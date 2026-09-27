<?php

declare(strict_types=1);

// The 'log' driver writes emails to storage/logs/mail.log. The 'smtp' driver sends real email.
return [
    'driver'       => env('MAIL_DRIVER', 'smtp'),
    'redirect_to'  => env('MAIL_REDIRECT_TO', ''),   // For testing, all mail goes to this address
    'from_name'    => school('name'),
    'from_address' => env('MAIL_FROM', env('SMTP_USER', '')),
    'log_file'     => dirname(__DIR__) . '/storage/logs/mail.log',

    'smtp' => [
        'host'     => env('SMTP_HOST', 'smtp.gmail.com'),
        'port'     => (int) env('SMTP_PORT', 587),
        'username' => env('SMTP_USER', ''),
        'password' => env('SMTP_PASS', ''),
    ],
];
