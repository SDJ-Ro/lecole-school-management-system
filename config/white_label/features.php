<?php

declare(strict_types=1);

// Module switches. Switching one off hides its pages and links.
return [
    // Accounts
    'student_signup'    => true,
    'parent_signup'     => true,
    'teacher_signup'    => true,
    'management_signup' => true,
    'admin_signup'      => false,   // Admins are made when the system is installed
    'demo_quickfill'    => true,    // The "Fill in demo account" button

    // Public
    'honours_board'     => true,

    // Core modules
    'academic'          => true,
    'term_marks'        => true,
    'extracurricular'   => true,
    'achievements'      => true,
    'certificates'      => true,
    'notices'           => true,
    'calendar'          => true,
    'people'            => true,
    'profile'           => true,

    // Moderation
    'parent_consent'    => true,    // A parent approves joining a club and leaving
    'approvals'         => true,    // A teacher's notices wait for the admin to approve them
    'feedback'          => true,
    'complaints'        => true,
    'audit_log'         => true,
];
