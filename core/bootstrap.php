<?php

declare(strict_types=1);

$projectRoot = dirname(__DIR__);

$autoloadFile = $projectRoot . '/vendor/autoload.php';

if (!is_file($autoloadFile))
{
    throw new RuntimeException('Composer autoloader not found. Run composer install first.');
}

require_once $autoloadFile;

require_once __DIR__ . '/helpers.php';

$envFile = $projectRoot . '/.env';

if (is_file($envFile))
{
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line)
    {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '='))
        {
            continue;
        }

        [$name, $value] = array_map('trim', explode('=', $line, 2));
        $value = trim($value, '"\'');

        if (getenv($name) === false)
        {
            putenv("{$name}={$value}");
        }
    }
}

// The school's timezone, not the server's
date_default_timezone_set(country('timezone'));

if (session_status() === PHP_SESSION_NONE)
{
    session_start([
        'cookie_httponly' => true,    // JavaScript can't read the cookie
        'cookie_samesite' => 'Lax',   // Not sent with forms from other sites
        'use_strict_mode' => true,    // Refuses made-up session IDs
    ]);
}

// Security headers. Only our own pages may show us in a frame, which blocks clickjacking.
// Export PDF needs this, because it opens in a frame.
header('X-Frame-Options: SAMEORIGIN');
header("Content-Security-Policy: frame-ancestors 'self'");
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header_remove('X-Powered-By');

if (config('app.debug_mode', false))
{
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
}
else
{
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL);
    ini_set('log_errors', '1');
    ini_set('error_log', $projectRoot . '/storage/logs/php_errors.log');

    // The details go to the log. Visitors only see the error page.
    set_exception_handler(function (Throwable $error) use ($projectRoot): void
    {
        error_log((string) $error);
        http_response_code(500);
        $code    = 500;
        $heading = 'Something went wrong';
        $message = "We couldn't load this page. Please try again in a moment.";
        require $projectRoot . '/app/Views/errors/error.php';
    });
}
