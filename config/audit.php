<?php

declare(strict_types=1);

return [
    'per_page' => 50,

    // 'system' is for events with no account, such as an unknown ID trying to sign in
    'tones' => [
        'admin'      => 'moss',
        'management' => 'maroon',
        'teacher'    => 'sunshine',
        'parent'     => 'terracotta',
        'student'    => 'sky',
        'system'     => 'bronze',
    ],

    // Names for codes that read badly. Other codes are shown as words, so NOTICE_POSTED shows "Notice Posted".
    'names' => [
        'LOGIN_SUCCESS'          => 'Sign In',
        'LOGIN_FAILED'           => 'Failed Sign In',
        'LOGIN_WRONG_PORTAL'     => 'Wrong Portal',
        'LOGOUT'                 => 'Sign Out',
        'ACTIVATE_CODE_SENT'     => 'Sign-Up Code',
        'ACCOUNT_ACTIVATED'      => 'Signed Up',
        'SIGNUP_REJECTED'        => 'Sign-Up Refused',
        'RESET_REQUESTED'        => 'Reset Asked',
        'RESET_CODE_SENT'        => 'Reset Code',
        'PASSWORD_CHANGE_FAILED' => 'Wrong Password',
        'ACCOUNT_SWITCHED_ON'    => 'Account On',
        'ACCOUNT_SWITCHED_OFF'   => 'Account Off',
        'EVENT_CLASH_ACCEPTED'   => 'Event Clash',
        'SUBJECT_TEACHER_SAVED'  => words('Subject {Teacher}'),
        'TEACHER_HANDED_OVER'    => 'Handover',
    ],
];
