<?php

declare(strict_types=1);

return [
    // The first category is picked by default.
    // General is for the whole school, Academic for grades or classes, and Extracurricular for clubs and sports.
    'categories' => [
        'admin'      => ['General', 'Academic', 'Extracurricular'],
        'management' => ['General', 'Academic', 'Extracurricular'],
        'teacher'    => ['Academic', 'Extracurricular'],
    ],

    'audience' => [
        'admin'      => ['all', 'student', 'parent', 'teacher', 'management'],
        'management' => ['all', 'student', 'parent', 'teacher', 'management'],
        'teacher'    => ['student', 'parent'],
    ],

    // How many years the calendar shows before and after this one
    'years_back'  => 1,
    'years_ahead' => 1,

    // How long an event with no end time lasts when checking for clashes
    'default_minutes' => 60,

    'upcoming_count' => 3,
    'tag_colors'     => [
        'General'         => 'sky',
        'Academic'        => 'sand',
        'Extracurricular' => 'terracotta',
    ],
];
