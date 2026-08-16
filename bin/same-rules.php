<?php

// Finds the same CSS lines written under two names. Short rules and layout-only rules are skipped.
// Run it with php bin/same-rules.php and the CSS files to check

declare(strict_types=1);

const ARRANGING = '/^(display|gap|flex|flex-direction|flex-wrap|align-items|justify-content|grid-template-columns|min-width|margin-top|margin-bottom):/';

$groups = [];

foreach (array_slice($argv, 1) as $file)
{
    $css = preg_replace('#/\*.*?\*/#s', '', (string) @file_get_contents($file));
    preg_match_all('/([^{}]+)\{([^{}]*)\}/', $css, $rules, PREG_SET_ORDER);

    foreach ($rules as [, $selector, $body])
    {
        $lines = array_filter(array_map('trim', explode(';', $body)), fn (string $line): bool => str_contains($line, ':'));

        $onlyArranging = $lines === preg_grep(ARRANGING, $lines);

        if (count($lines) >= 4 && !$onlyArranging)
        {
            sort($lines);
            $groups[implode('; ', $lines)][] = $file . ': ' . trim(preg_replace('/\s+/', ' ', $selector));
        }
    }
}

foreach ($groups as $lines => $where)
{
    if (count($where) > 1)
    {
        echo '  WARN the same ' . (substr_count($lines, ';') + 1) . ' lines: ' . implode('  =  ', $where) . "\n";
    }
}
