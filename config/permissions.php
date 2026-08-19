<?php

declare(strict_types=1);

// Who may do what. Read it with can(), for example can('calendar.create').
// The lists of choices stay in each feature's own config.
return [
    // Calendar events and notices
    'posts' => [
        'any_group'     => ['admin', 'management'],   // Others may only post to their own groups
        'manage_others' => [                          // Anyone may always manage their own posts
            'admin'      => ['admin', 'management', 'teacher'],
            'management' => ['management', 'teacher'],
            'teacher'    => [],
        ],
    ],

    // The duties that show each teacher tab
    'teacher_tabs' => [
        'students'        => ['class_teacher', 'subject_teacher', 'in_charge'],
        'marks'           => ['class_teacher', 'subject_teacher', 'in_charge'],
        'feedback'        => ['class_teacher', 'subject_teacher', 'in_charge'],
        'extracurricular' => ['class_teacher', 'subject_teacher', 'in_charge'],
        'achievements'    => ['class_teacher', 'subject_teacher', 'in_charge'],
        'notices'         => ['class_teacher', 'subject_teacher', 'in_charge'],
    ],

    'calendar' => [
        'create'  => ['admin', 'management', 'teacher'],   // A teacher only for their own groups
        'see_all' => ['admin', 'management'],
    ],

    'notices' => [
        'post'              => ['admin', 'management', 'teacher'],   // A teacher only for their own groups
        'see_all'           => ['admin', 'management'],              // Also scheduled and waiting notices
        'approve'           => ['admin'],
        'wait_for_approval' => ['teacher'],                          // Only when the approvals module is on
    ],

    'complaints' => [
        'send'    => ['parent'],       // Only about the child they are viewing
        'resolve' => ['management'],
    ],

    'audit' => [
        'view' => ['admin'],
    ],

    'settings' => [
        'edit' => ['admin'],
    ],

    'academic' => [
        'edit' => ['admin', 'management'],
    ],

    'people' => [
        'directory'    => ['admin', 'management'],
        'management'   => ['admin'],
        'own_students' => ['teacher'],               // View only
    ],

    'extracurricular' => [
        'page'    => ['student', 'teacher', 'management', 'admin'],   // A parent sees it through Child Profile
        'join'    => ['student'],
        'manage'  => ['admin', 'management'],
        'approve' => ['admin'],                 // Also archive and restore
        'watch'   => ['admin', 'management'],  // Lift Academic Watch
    ],

    'achievements' => [
        'record'     => ['teacher'],
        'answer'     => ['teacher', 'management'],   // Missing Record Requests
        'answer_any' => ['management'],              // Every waiting request, not only their own
        'honours'    => ['management'],              // The public honours board
    ],

    'certificates' => [
        'manage' => ['management'],
    ],

    'leaving' => [
        'see'    => ['admin', 'management', 'teacher'],
        'change' => ['admin'],                            // Also cancel
        'start'  => ['admin', 'management'],              // Left Without Notice
    ],

    'notifications' => [
        'see' => ['student', 'parent'],
    ],

    'profile' => [
        'password' => ['admin', 'management', 'teacher', 'parent'],
    ],

    'feedback' => [
        'write' => ['teacher'],             // Only a class teacher, for their own class
        'read'  => ['student', 'parent'],
    ],
];