<?php

declare(strict_types=1);

return [
    // Words in braces such as {student} are filled in by words()
    'board' => [
        'student'    => ['url' => '/student/notice',      'subtitle' => 'Stay up to date with official notices, schedules, and club activities.',            'search' => 'Search notices or programmes…'],
        'parent'     => ['url' => '/parent/notice-board', 'subtitle' => 'Stay up to date with notices across all your child’s academic programmes.',       'search' => 'Search notices or programmes…'],
        'teacher'    => ['url' => '/teacher/notice',      'subtitle' => 'Curriculum notices, department circulars, and {student} notices.',                 'search' => 'Search notices…'],
        'management' => ['url' => '/management/notice',   'subtitle' => '{Institution} notices, administrative circulars, and official directives.',       'search' => 'Search notices…'],
        'admin'      => ['url' => '/admin/notice',        'subtitle' => 'Stay up to date with notices across all {institution} programmes.',                'search' => 'Search notices…'],
    ],

    // The first category is picked by default.
    // Academic goes to a grade or class, Extracurricular to a club, and the others to everyone.
    'categories' => [
        'admin'      => ['Academic', 'Extracurricular', 'General', 'Administrative'],
        'management' => ['Academic', 'Extracurricular', 'General', 'Administrative'],
        'teacher'    => ['Academic', 'Extracurricular'],
    ],

    // A teacher can only post to the students and parents of their own class or club
    'audience' => [
        'admin'      => ['all', 'student', 'parent', 'teacher', 'management'],
        'management' => ['all', 'student', 'parent', 'teacher'],
        'teacher'    => ['all', 'student', 'parent'],
    ],

    // Boards that have the For Me and Posted by Me tabs
    'tabs' => ['teacher', 'management'],

    'audience_tones' => ['all' => 'linen', 'student' => 'sky', 'teacher' => 'sunshine', 'parent' => 'terracotta', 'management' => 'maroon'],

    'max_pinned' => 5,   // Most notices that can be pinned at once
];
