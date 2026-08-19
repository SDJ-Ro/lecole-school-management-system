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
