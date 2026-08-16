#!/bin/bash
# Checks the code rules. Run it with bash bin/check.sh
# It exits with 1 if it finds any ERROR
cd "$(dirname "$0")/.." || exit 1
REPORT=$(mktemp)

CSS_DIR=public/assets/css
JS_DIR=public/assets/js

# Find the CSS and JS files each page loads
listed() { find app/Views -name '*.php' -exec perl -0777 -ne 'print "$1\n" while /\$'"$1"'\s*=\s*\[([^\]]*)\]/g' {} + \
  | grep -oE "'[a-z0-9/_-]+'" | tr -d "'" | sort -u; }
# Files every signed-in page loads
always() { grep -hoE "foreach \(\[[^]]*" "app/Views/layouts/$1" | grep -oE "'[a-z0-9/_-]+'" | tr -d "'"; }
CSS_FILES="$CSS_DIR/global.css $CSS_DIR/auth.css $CSS_DIR/landing.css $CSS_DIR/print.css"
for name in $(always page_top.php) $(listed styles); do CSS_FILES="$CSS_FILES $CSS_DIR/components/$name.css"; done
for name in $(listed grids); do CSS_FILES="$CSS_FILES $CSS_DIR/layout/$name-grid.css"; done
JS_FILES=$(ls $JS_DIR/*.js 2>/dev/null | tr '\n' ' ')
for name in $(always page_bottom.php) $(listed scripts); do JS_FILES="$JS_FILES $JS_DIR/components/$name.js"; done
PHP_FILES=$(find app core config routes public -name '*.php')
VIEWS=$(find app/Views -name '*.php' -not -path 'app/Views/emails/*')

fail() { echo "  ERROR $*"; }
warn() { echo "  WARN $*"; }
section() { echo; echo "== $*"; }

{
  section "1. Syntax (php -l, node --check)"
  for f in $PHP_FILES; do php -l "$f" > /dev/null 2>&1 || fail "$f: PHP syntax error"; done
  for f in $CSS_FILES $JS_FILES; do [ -f "$f" ] || fail "$f: loaded by a page but missing"; done
  for f in $JS_FILES; do [ -f "$f" ] && { node --check "$f" 2>/dev/null || fail "$f: JS syntax error"; }; done

  section "2. Banned: !important, inline style=\"\", htmlspecialchars, old c-select names, a font size outside the set"
  grep -n '!important' $CSS_FILES | while read -r l; do fail "$l"; done
  grep -rn 'style="' $VIEWS | while read -r l; do fail "$l"; done
  grep -rn 'htmlspecialchars' $VIEWS | while read -r l; do fail "$l  (use e())"; done
  grep -rnE 'c-select([^e]|$)' $VIEWS $CSS_FILES $JS_FILES | while read -r l; do fail "$l  (old name: use the dropdown component)"; done
  grep -n 'font-size:' $(echo $CSS_FILES | tr ' ' '\n' | grep -v print.css) \
    | grep -vE 'font-size: (0\.625|0\.75|0\.8125|0\.875|1|1\.125|1\.25|1\.5|1\.875|2\.25|3)rem;|font-size: inherit;|svg units' \
    | while read -r l; do fail "$l  (sizes: 10 12 13 14 16 18 20 24 30 36 48px, in rem)"; done
  NOT_GLOBAL=$(echo $CSS_FILES | tr ' ' '\n' | grep -v global.css)
  grep -nE '#[0-9A-Fa-f]{3,8}\b' $NOT_GLOBAL | grep -v 'url(' \
    | while read -r l; do fail "$l  (a typed colour: use a global.css token)"; done
  grep -nE 'var\(--[a-z0-9-]+, ' $NOT_GLOBAL | while read -r l; do fail "$l  (no fallback, typed or another token: the token is always there)"; done
  grep -n 'rgba(' $CSS_FILES | while read -r l; do fail "$l  (a colour typed as rgba: a --text / --line / --wash token, or color-mix from its token)"; done
  grep -n 'border-radius:' $NOT_GLOBAL \
    | grep -vE 'border-radius: (0|var\(--radius-[a-z0-9]+\))( (0|var\(--radius-[a-z0-9]+\))){0,3};' \
    | while read -r l; do fail "$l  (a typed corner: use a --radius-* token)"; done
  grep -nE 'box-shadow: [^;]*[0-9]' $NOT_GLOBAL | grep -vE 'box-shadow: (0 0 0 |inset )|glow' \
    | while read -r l; do fail "$l  (a typed shadow: use --shadow-sm / md / lg / xl or --ring)"; done
  grep -nE 'z-index: [0-9]' $CSS_FILES | grep -vE 'z-index: [0-2];' \
    | while read -r l; do fail "$l  (a typed layer: use a --z-* token; 0-2 only for order inside one component)"; done
  grep -n 'outline: none' $NOT_GLOBAL | while read -r l; do fail "$l  (the focus look is global.css's ring)"; done
  grep -n 'font-family: inherit' $NOT_GLOBAL | while read -r l; do fail "$l  (the reset in global.css already does it)"; done
  grep -nE 'transition:.*\b(100|120|160|180|200|220)ms ease[,;]' $CSS_FILES \
    | while read -r l; do warn "$l  (a hover / colour change uses var(--speed); an open / close animation may keep its own)"; done

  section "3. Security: SQL only in models, e() on printed values, CSRF on POST forms"
  grep -rnE "[\"'](SELECT|INSERT|UPDATE|DELETE) " app/Controllers app/Views app/Services 2>/dev/null \
    | while read -r l; do fail "$l  (SQL outside a model)"; done
  grep -rnE "\\\$(currentRole|role) (===|!==) '" $VIEWS \
    | while read -r l; do fail "$l  (a view deciding by role: the controller sends a flag from can())"; done
  grep -rnE "in_array\([^,]+, \['(admin|management|teacher|student|parent)'" app core \
    | while read -r l; do fail "$l  (a typed role list: config/permissions.php, or the feature's config)"; done
  grep -rn "c-banner--success" $VIEWS $JS_FILES | while read -r l; do fail "$l  (\"it worked\" = setFlash('notice') / showFeedbackBanner())"; done
  grep -rln "_feedback_banner.php" $VIEWS | grep -v "layouts/page_bottom.php\|components/_feedback_banner.php" \
    | while read -r l; do fail "$l  (draws its own sliding banner: page_bottom.php already does)"; done
  grep -rnE '<\?= *\$[a-zA-Z_]+(\[[^]]*\])* *\?>' $VIEWS | grep -vE '\$csrfField|\$[a-zA-Z]+Content *\?>' \
    | while read -r l; do warn "$l  (print it with e())"; done
  for f in $(grep -rliE '<form[^>]*method="post"' $VIEWS); do
    grep -q 'csrf' "$f" || fail "$f: a POST form without the CSRF token"
  done

  section "4. One way: icons via icon(), no empty files, components named _x.php"
  grep -rn '<use href="#icon-' $VIEWS | grep -v 'components/icons.php\|j-question-icon\|_sidebar.php' \
    | while read -r l; do warn "$l  (hand-written icon: use icon('name', size))"; done
  for f in $PHP_FILES $JS_FILES $CSS_FILES; do [ -f "$f" ] && [ ! -s "$f" ] && fail "$f: empty file"; done
  for f in app/Views/components/*.php; do
    case "$(basename "$f")" in _*|icons.php) ;; *) warn "$f: a component's name starts with _" ;; esac
  done

  section "5. Formatting: { on the next line in PHP and JS"
  grep -rnE '^\s*((public|private|protected|static) )*function [a-zA-Z_]+\(.*\).*\{\s*$|^\s*(if|foreach|for|while) \(.*\) *\{\s*$' \
    --include='*.php' app core routes config | grep -v 'app/Views/' | while read -r l; do warn "$l"; done
  grep -nE '^\s*(function [a-zA-Z_]+\(.*\)|if \(.*\)|else|for \(.*\)) *\{\s*$' $JS_FILES | while read -r l; do warn "$l"; done

  section "6. Dead code: CSS classes nobody uses, functions nobody calls"
  USED_IN="app/Views app/Controllers app/Services config $JS_FILES"
  for f in $CSS_FILES; do
    [ -f "$f" ] || continue
    unused=""
    for c in $(grep -v '^@import' "$f" | grep -ohE '\.[a-zA-Z][a-zA-Z0-9_-]*' | sed 's/^\.//' | sort -u); do
      grep -rqF -- "$c" $USED_IN && continue
      base="${c%--*}"   # A class made from a variant
      [ "$base" != "$c" ] && grep -rqF -- "$base--" $USED_IN && continue
      prefix="${c%-*}"  # A class made from a tone
      [ "$prefix" != "$c" ] && grep -rqF -- "$prefix-<?=" app/Views && continue
      unused="$unused $c"
    done
    [ -n "$unused" ] && warn "$f:$unused"
  done
  ALL_CSS=$(cat $CSS_FILES 2>/dev/null)
  for c in $(grep -rhoE 'class="[^"]*"' $VIEWS | grep -v '<?' | grep -oE '\bc-[a-z0-9_-]+' | sort -u); do
    grep -qF -- ".$c" <<< "$ALL_CSS" || echo "${c%%__*}" | sed 's/--.*//'
  done | sort | uniq -c | while read -r count block; do
    warn "$block: $count class(es) used in a view, but no loaded CSS styles them (a page doesn't load it yet, or a rule is missing)"
  done
  ALL_JS_AND_VIEWS=$(cat $JS_FILES $VIEWS 2>/dev/null)
  for f in $JS_FILES; do
    [ -f "$f" ] || continue
    for fn in $(grep -oE 'function [a-zA-Z_]+' "$f" | sed 's/function //' | sort -u); do
      [ "$(grep -owE "$fn" <<< "$ALL_JS_AND_VIEWS" | wc -l)" -le 1 ] && warn "$f: $fn() is never called"
    done
  done
  for f in app/Models/*.php app/Services/*.php app/Controllers/*.php core/*.php; do
    for fn in $(grep -oE 'function [a-zA-Z_]+\(' "$f" | sed 's/function //;s/(//' | grep -v '^__'); do
      # Calls to the database's own methods don't count
      in_others=$(grep -rnw "$fn" --include='*.php' app core routes config | grep -v "^$f:" | grep -vc "db->$fn")
      in_self=$(grep -cw "$fn" "$f")
      [ "$in_others" -eq 0 ] && [ "$in_self" -le 1 ] && warn "$f: $fn() is never called"
    done
  done

  section "7. Duplicates: the same selector in two CSS files, or the same lines under two names"
  for f in $CSS_FILES; do
    [ -f "$f" ] && grep -hE '^[.#a-zA-Z][^{]*\{' "$f" | sed 's/ *{.*//' | sort -u | sed "s|^|$f	|"
  done | awk -F'\t' '{n[$2]++; w[$2]=w[$2]" "$1} END {for (s in n) if (n[s]>1) print "  WARN " s " in" w[s]}'
  php bin/same-rules.php $(for f in $CSS_FILES; do [ -f "$f" ] && echo "$f"; done | sort -u)

  section "8. White-label: the school's details typed in, fixed date formats, settings nobody reads"
  CODE="$VIEWS app/Views/emails app/Controllers app/Models app/Services core routes $JS_FILES $CSS_FILES"
  CONFIGS=$(find config -name '*.php' -not -path 'config/white_label/*')
  SCHOOL_DETAILS=$(php -r 'require "core/helpers.php"; echo school("name"), "\n", strtok(school("email_domain"), "."), "\n", country("phone.code"), "\n";')
  while read -r detail; do
    [ -n "$detail" ] && grep -rniF -- "$detail" $CODE $CONFIGS | while read -r l; do fail "$l  (typed in: use school() / country())"; done
  done <<< "$SCHOOL_DETAILS"
  grep -rnE "date\('[^']*[MF][^']*Y" $CODE | while read -r l; do fail "$l  (use country('date_format'))"; done
  grep -nE "toLocale(Date|Time)?String\('en-|DateTimeFormat\('en-" $JS_FILES | while read -r l; do fail "$l  (a fixed country's date format)"; done
  for f in config/white_label/*.php; do
    grep -rqF "white_label.$(basename "$f" .php)" app core routes $CONFIGS || warn "$f: nothing reads these settings yet"
  done
  php -r 'require "core/helpers.php"; $modules = require "config/white_label/features.php";
    foreach (require "config/dashboards.php" as $role => $board)
      foreach ([...$board["metrics"], $board["chartConfig"], ...($board["donuts"] ?? [])] as $piece)
        if (!array_key_exists($piece["feature"] ?? "", $modules)) echo "  ERROR config/dashboards.php: a {$role} piece has no module (feature)\n";'
  WORDS="$VIEWS app/Controllers app/Services core $JS_FILES $CONFIGS"
  NOTE='^[^:]+:[0-9]+:\s*(//|\*|/\*|#|<\?php //)'
  grep -rnE "['\">]([^'\"<]*[^{'\"<A-Za-z-])?(Students?|Teachers?|Parents?|Grades?|Class(es)?|Terms?|School)\b" $WORDS \
    | grep -vE "$NOTE" | grep -vE "'value' => '[A-Z]" | while read -r l; do fail "$l  (a typed school word: use word() / plural() / words())"; done
  grep -rnE "[a-z]\.\.\.['\"<\`]" $WORDS | grep -vE "$NOTE" | while read -r l; do fail "$l  (write … , one character)"; done
  grep -rnE "['\"\`][^'\"\`]*successfully" $WORDS | grep -vE "$NOTE" | while read -r l; do fail "$l  (say what happened: \"Notice published.\")"; done
  grep -rnE "['\">][^'\"<]*\b(Logout|Log Out|Log out|Login)\b" $WORDS | grep -vE "$NOTE" | while read -r l; do fail "$l  (the words are Sign In / Sign Out)"; done

  section "9. Unused: a page-level CSS / JS file no page loads, a colour token, a setting"
  for f in $JS_DIR/*.js $CSS_DIR/*.css; do
    grep -rqF "$(basename "$f")" app/Views || fail "$f: no page loads this file"
  done
  # A file only counts if a page lists it, not if it is just mentioned
  for f in $(find $JS_DIR/components $CSS_DIR/components $CSS_DIR/layout -type f); do
    case " $JS_FILES $CSS_FILES " in *" $f "*) ;; *) fail "$f: no page loads this file" ;; esac
  done
  ALL_STYLES=$(cat $(find $CSS_DIR -name '*.css') $(find app/Views -name '*.php') $(find $JS_DIR -name '*.js'))
  for token in $(grep -oE '^ *--[a-z0-9-]+:' $CSS_DIR/global.css | tr -d ' :'); do
    grep -qF -- "var($token" <<< "$ALL_STYLES" || warn "$CSS_DIR/global.css: $token is never used"
  done
  for f in config/*.php; do
    [ "$f" = config/portals.php ] && continue   # Its keys are role names
    name=$(basename "$f" .php)
    for key in $(grep -oE "^    '[a-z_]+'" "$f" | tr -d "' "); do
      grep -rlE "$name\.$key|\['$key'\]|can\('$key\." --include='*.php' app core routes config | grep -qv "^$f$" \
        || warn "$f: '$key' is never read"
    done
  done
} | tee "$REPORT"

ERRORS=$(grep -c '^  ERROR' "$REPORT")
WARNINGS=$(grep -c '^  WARN' "$REPORT")
rm -f "$REPORT"
echo
echo "Done: $ERRORS error(s), $WARNINGS warning(s)."
[ "$ERRORS" -eq 0 ]
