<?php

declare(strict_types=1);

if (!function_exists('e'))
{
    function e(mixed $value): string
    {
        return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}

if (!function_exists('env'))
{
    function env(string $key, mixed $default = null): mixed
    {
        $value = getenv($key);

        if ($value === false)
        {
            return $default;
        }

        return match (strtolower($value))
        {
            'true'  => true,
            'false' => false,
            'null'  => null,
            default => $value,
        };
    }
}

if (!function_exists('config'))
{
    function config(string $key, mixed $default = null): mixed
    {
        static $loaded = [];

        $segments = explode('.', $key);
        $path = dirname(__DIR__) . '/config';

        while (count($segments) > 1 && is_dir($path . '/' . $segments[0]))
        {
            $path .= '/' . array_shift($segments);
        }

        $file = $path . '/' . array_shift($segments) . '.php';

        if (!is_file($file))
        {
            return $default;
        }

        $loaded[$file] ??= require $file;
        $value = $loaded[$file];

        foreach ($segments as $segment)
        {
            if (!is_array($value) || !array_key_exists($segment, $value))
            {
                return $default;
            }

            $value = $value[$segment];
        }

        return $value;
    }
}

// The value an admin saved, or null.
// Also null when run without the app classes, as bin/check.sh does.
if (!function_exists('saved_setting'))
{
    function saved_setting(string $key): mixed
    {
        return class_exists(App\Models\SchoolSettings::class) ? App\Models\SchoolSettings::saved($key) : null;
    }
}

// Uses the admin's saved setting first, then config/white_label/school.php
if (!function_exists('school'))
{
    function school(string $key, mixed $default = null): mixed
    {
        return saved_setting("school.{$key}") ?? config("white_label.school.{$key}", $default);
    }
}

if (!function_exists('country'))
{
    function country(string $key, mixed $default = null): mixed
    {
        return config("white_label.country.{$key}", $default);
    }
}

if (!function_exists('feature'))
{
    function feature(string $name): bool
    {
        return (bool) config("white_label.features.{$name}", false);
    }
}

// Turns a php.ini size such as "8M" into bytes
if (!function_exists('ini_bytes'))
{
    function ini_bytes(string $setting): int
    {
        $size   = trim((string) ini_get($setting));
        $number = (int) $size;

        return match (strtoupper(substr($size, -1)))
        {
            'G'     => $number * 1024 ** 3,
            'M'     => $number * 1024 ** 2,
            'K'     => $number * 1024,
            default => $number,
        };
    }
}

// An admin's change for that year wins over rules.php. Without a $year it uses this year.
if (!function_exists('rule'))
{
    function rule(string $key, ?int $year = null): mixed
    {
        $saved = class_exists(App\Models\SchoolRules::class) ? App\Models\SchoolRules::inForce($key, $year) : null;

        return $saved ?? config("white_label.rules.{$key}");
    }
}

if (!function_exists('word'))
{
    function word(string $key): string
    {
        return saved_setting("wording.{$key}") ?? default_word($key);
    }
}

// The word before any admin change. It looks in the organisation type first, then the school words.
if (!function_exists('default_word'))
{
    function default_word(string $key): string
    {
        $type = school('type', 'school');

        return config("white_label.wording.{$type}.{$key}")
            ?? config("white_label.wording.school.{$key}")
            ?? ucfirst($key);
    }
}
// Adds the file's change time to the link, so browsers fetch it again after an edit
if (!function_exists('asset'))
{
    function asset(string $path): string
    {
        $file = dirname(__DIR__) . '/public/assets/' . $path;

        return '/assets/' . $path . '?v=' . (is_file($file) ? filemtime($file) : 0);
    }
}

// Builds a link with its query. Empty values are left out.
if (!function_exists('url_with'))
{
    function url_with(string $path, array $params): string
    {
        $query = http_build_query(array_filter($params, fn ($value): bool => $value !== '' && $value !== null));

        return $query === '' ? $path : "{$path}?{$query}";
    }
}

// Turns 'class' into "Classes"
if (!function_exists('plural'))
{
    function plural(string $word): string
    {
        return word(match ($word) { 'class' => 'classes', 'management' => 'management', default => "{$word}s" });
    }
}

// Fills in the school's words. {Class} gives a capital letter and {class} gives lowercase.
if (!function_exists('words'))
{
    function words(string $text): string
    {
        return preg_replace_callback('/\{(\w+)\}/', fn (array $match): string => ctype_upper($match[1][0])
            ? word(strtolower($match[1]))
            : strtolower(word($match[1])), $text);
    }
}

// Checks the signed-in role against config/permissions.php
if (!function_exists('can'))
{
    function can(string $ability): bool
    {
        $role = $_SESSION['user']['role'] ?? null;

        return $role !== null && in_array($role, config("permissions.{$ability}", []), true);
    }
}

// Tabs not listed in teacher_tabs are open to every teacher
if (!function_exists('teacher_has_tab'))
{
    function teacher_has_tab(string $tab): bool
    {
        $needs = config("permissions.teacher_tabs.{$tab}");
        $id    = (int) ($_SESSION['user']['id'] ?? 0);

        return $needs === null || array_intersect($needs, App\Services\TeacherDuties::of($id)) !== [];
    }
}

// Anyone may manage their own posts. Who may manage other people's is set in posts.manage_others.
// The post needs author_id and author_role.
if (!function_exists('can_manage'))
{
    function can_manage(array $post): bool
    {
        $user = $_SESSION['user'] ?? null;

        return $user !== null && ((int) $post['author_id'] === (int) $user['id']
            || in_array($post['author_role'], config("permissions.posts.manage_others.{$user['role']}") ?? [], true));
    }
}

// Shows "09:00 - 10:30", just "15:00" when there is no end, or "All Day" when there is no start
if (!function_exists('event_time'))
{
    function event_time(array $event): string
    {
        if ($event['start_time'] === null)
        {
            return 'All Day';
        }

        return substr($event['start_time'], 0, 5) . ($event['end_time'] ? ' – ' . substr($event['end_time'], 0, 5) : '');
    }
}

// Grades store only a number, so the school's own words always show
if (!function_exists('grade_name'))
{
    function grade_name(int $number): string
    {
        return config("white_label.academic.grade_names.{$number}") ?? word('grade') . " {$number}";
    }
}

// Turns 6 and 9 into "Grades 6-9"
if (!function_exists('grade_range'))
{
    function grade_range(int $first, int $last): string
    {
        $named = config('white_label.academic.grade_names');

        return match (true)
        {
            $first === $last                                    => grade_name($first),
            isset($named[$first]) || isset($named[$last])       => grade_name($first) . ' – ' . grade_name($last),
            default                                             => plural('grade') . " {$first}–{$last}",
        };
    }
}

// The grade as used inside a class name
if (!function_exists('grade_short'))
{
    function grade_short(int $gradeNumber): string
    {
        return config("white_label.academic.grade_names.{$gradeNumber}") ?? (string) $gradeNumber;
    }
}

// Turns 6 and 'A' into "6-A"
if (!function_exists('class_name'))
{
    function class_name(int $gradeNumber, string $section): string
    {
        return strtr(config('white_label.academic.class_name'), ['{grade}' => grade_short($gradeNumber), '{section}' => $section]);
    }
}

// What class_name() puts before the section
if (!function_exists('class_prefix'))
{
    function class_prefix(int $gradeNumber): string
    {
        return explode('{section}', strtr(config('white_label.academic.class_name'), ['{grade}' => grade_short($gradeNumber)]), 2)[0];
    }
}

// Gets the section back from a class name, so "6-A" gives "A"
if (!function_exists('class_section'))
{
    function class_section(int $gradeNumber, string $name): string
    {
        $before = mb_strlen(class_prefix($gradeNumber));
        $after  = mb_strlen(class_name($gradeNumber, '')) - $before;   // Any text after the section

        return mb_substr($name, $before, mb_strlen($name) - $before - $after);
    }
}

// Turns 2 into "2nd". The 11th, 12th and 13th don't follow the last digit.
if (!function_exists('ordinal'))
{
    function ordinal(int $number): string
    {
        $suffix = in_array($number % 100, [11, 12, 13], true) ? 'th' : (['th', 'st', 'nd', 'rd'][$number % 10] ?? 'th');

        return $number . $suffix;
    }
}

// First letters of the first two words
if (!function_exists('initials'))
{
    function initials(string $name): string
    {
        return implode('', array_map(fn (string $word): string => mb_substr($word, 0, 1), array_slice(explode(' ', trim($name)), 0, 2)));
    }
}

// Gives the same person the same card colour on every page
if (!function_exists('card_tone'))
{
    function card_tone(string $code): string
    {
        $tones = config('people.card_tones');

        return $tones[crc32($code) % count($tones)];
    }
}

// Joins a list as "PDF, PNG or JPG"
if (!function_exists('word_list'))
{
    function word_list(array $words): string
    {
        $words = array_values($words);
        $last  = array_pop($words);

        return $words === [] ? (string) $last : implode(', ', $words) . " or {$last}";
    }
}

// The file types for a file input's accept. The server checks the same list.
if (!function_exists('accept_types'))
{
    function accept_types(string $kind): string
    {
        return implode(',', array_keys(config("uploads.{$kind}.types")));
    }
}

if (!function_exists('icon'))
{
    function icon(string $name, int $size = 16, string $class = ''): string
    {
        return '<svg class="' . e(trim("c-icon {$class}")) . '" width="' . $size . '" height="' . $size . '" aria-hidden="true">'
            . '<use href="#icon-' . e($name) . '"/></svg>';
    }
}

if (!function_exists('icon_image'))
{
    // An icon as an image for PDFs, because Dompdf can't use the icon sheet or CSS colours
    function icon_image(string $name, int $size, string $colourToken): string
    {
        static $icons = null, $tokens = null;
        $icons  ??= file_get_contents(dirname(__DIR__) . '/app/Views/components/icons.php');
        $tokens ??= file_get_contents(dirname(__DIR__) . '/public/assets/css/global.css');

        preg_match('/<symbol id="icon-' . preg_quote($name, '/') . '" viewBox="([^"]+)">(.*?)<\/symbol>/s', $icons, $drawing);
        preg_match('/--' . preg_quote($colourToken, '/') . ':\s*(#[0-9A-Fa-f]{3,8})/', $tokens, $colour);

        // Dompdf reads px as pt, so the SVG is drawn at 4/3 size
        $drawn = round($size * 4 / 3, 2);
        $svg   = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $drawn . '" height="' . $drawn . '" viewBox="' . $drawing[1] . '" fill="none"'
            . ' stroke="' . $colour[1] . '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' . $drawing[2] . '</svg>';

        return '<img src="data:image/svg+xml;base64,' . base64_encode($svg) . '" width="' . $size . '" height="' . $size . '" alt="">';
    }
}
