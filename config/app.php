<?php

declare(strict_types=1);

return [
    'debug_mode' => env('APP_DEBUG', false),

    // For links in emails
    'url' => rtrim((string) env('APP_URL', ''), '/'),

    // Seconds without activity before sign out
    'session_timeout' => [
        'admin'   => 900,
        'default' => 1800,
    ],

    'roles' => ['student', 'teacher', 'parent', 'management', 'admin'],

    // The account locks after 5 wrong passwords, then again after every 3 more.
    // Each lock is longer than the one before, and the last length repeats.
    // The count starts again after 30 minutes.
    'login' => [
        'lock_after'       => 5,
        'lock_again_after' => 3,
        'lock_minutes'     => [2, 5, 15],
        'reset_minutes'    => 30,
    ],

    'codes' => [
        'expire_minutes' => 15,
        'max_attempts'   => 5,
        'resend_seconds' => 60,
    ],

    'password_rules' => [
        ['/.{8,}/',        'at least 8 characters'],
        ['/[A-Za-z]/',     'a letter'],
        ['/[0-9]/',        'a number'],
        ['/[^A-Za-z0-9]/', 'a symbol (like @ or #)'],
    ],
];
