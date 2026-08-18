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
