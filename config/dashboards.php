<?php

declare(strict_types=1);

// What each dashboard shows. The numbers are filled in by the dashboard services.
// Each piece names its 'feature', so it hides when that module is switched off.

// Scores in percent with a Term picker. Teachers also get a View picker.
$scoreChart = fn (string $id, string $title, array $series): array => [
    'feature'    => 'term_marks',
    'variant'    => 'scores',
    'id'         => $id,
    'title'      => $title,
    'xAxisTitle' => 'SUBJECTS',
    'yAxisTitle' => 'SCORE (%)',
    'series'     => $series,
];

// All students next to sports players, for each grade
$schoolChart = fn (string $id): array => [
    'feature'    => 'extracurricular',
    'variant'    => 'counts',
    'id'         => $id,
    'title'      => words('Total {Students} vs Sports Participation by {Class}'),
    'yAxisTitle' => strtoupper(plural('student')),
    'xAxisTitle' => strtoupper(word('grade')) . ' LEVEL',
    'series'     => [
        ['key' => 'total',  'label' => words('Total {Students}'), 'color' => 'skyblue'],
        ['key' => 'sports', 'label' => 'Sports Participation',  'color' => 'maroon'],
    ],
];

// 'unit' is the word after the number in the tooltip
$schoolDonuts = [
    ['feature' => 'extracurricular', 'donut' => 'sports', 'title' => 'Sports Participation', 'unit' => strtolower(plural('student'))],
    ['feature' => 'extracurricular', 'donut' => 'clubs',  'title' => 'Clubs & Societies',    'unit' => 'members'],
];

return [
    'student' => [
        'metrics' => [
            ['feature' => 'extracurricular', 'color' => 'maroon',    'icon' => 'extracurricular', 'extracurricular' => 'members', 'label' => 'Sports / Clubs Enrolled'],
            ['feature' => 'achievements',    'color' => 'lightblue', 'icon' => 'achievements',    'count' => 'achievements',      'label' => 'Total Achievements'],
            ['feature' => 'term_marks',      'color' => 'sand',      'icon' => 'podium',          'marks' => 'position',          'label' => words('{Class} Position')],
            ['feature' => 'notices',         'color' => 'moss',      'icon' => 'mail',            'count' => 'upcoming',          'label' => 'Upcoming Notices / Exams'],
        ],
        'chartConfig' => $scoreChart('j-student-perf-chart', 'Academic Performance', [
            ['key' => 'mine', 'label' => 'My Score',      'color' => 'maroon'],
            ['key' => 'best', 'label' => 'Highest Score', 'color' => 'skyblue'],
        ]),
    ],

    'parent' => [
        'metrics' => [
            ['feature' => 'term_marks',      'color' => 'maroon',    'icon' => 'trendingUp',   'marks' => 'average',           'label' => words('Average {Term} Mark')],
            ['feature' => 'extracurricular', 'color' => 'lightblue', 'icon' => 'usersRound',   'extracurricular' => 'members', 'label' => 'Sports & Clubs Active'],
            ['feature' => 'term_marks',      'color' => 'sand',      'icon' => 'podium',       'marks' => 'position',          'label' => words('{Class} Position')],
            ['feature' => 'achievements',    'color' => 'lightblue', 'icon' => 'achievements', 'count' => 'achievements',      'label' => words('{Student} Achievements')],
        ],
        'chartConfig' => $scoreChart('j-parent-perf-chart', "Child's Academic Performance", [
            ['key' => 'student', 'label' => words('{Student} Score'), 'color' => 'maroon'],
            ['key' => 'average', 'label' => words('{Class} Average'), 'color' => 'skyblue'],
        ]),
    ],

    'teacher' => [
        'metrics' => [
            ['feature' => 'academic',        'color' => 'maroon',    'icon' => 'bookOpen',   'count' => 'subject_classes',   'label' => words('Active {Subject} {Classes}')],
            ['feature' => 'academic',        'color' => 'lightblue', 'icon' => 'users',      'count' => 'assigned_students', 'label' => words('Total Assigned {Students}')],
            ['feature' => 'term_marks',      'color' => 'sand',      'icon' => 'trendingUp', 'marks' => 'average',           'label' => words('Average {Term} Mark')],
            ['feature' => 'extracurricular', 'color' => 'sunshine',  'icon' => 'usersRound', 'extracurricular' => 'players', 'label' => 'Total Enrolled Players'],
        ],
        'chartConfig' => $scoreChart('j-teacher-perf-chart', 'Academic Performance', [
            ['key' => 'avg',  'label' => words('{Class} Average'), 'color' => 'maroon'],
            ['key' => 'high', 'label' => 'Highest Score', 'color' => 'skyblue'],
        ]),
        // Overview and details, each with a View picker when there is a choice
        'donuts' => [
            ['feature' => 'extracurricular', 'donut' => 'overview', 'title' => 'Activity Overview',   'unit' => strtolower(plural('student'))],
            ['feature' => 'extracurricular', 'donut' => 'details',  'title' => 'Activity Engagement', 'unit' => strtolower(plural('student'))],
        ],
    ],

    'management' => [
        'metrics' => [
            ['feature' => 'people',          'color' => 'sand',     'icon' => 'graduationCap',   'count' => 'students',          'label' => words('Total {Students}')],
            ['feature' => 'people',          'color' => 'maroon',   'icon' => 'usersRound',      'count' => 'staff',             'label' => 'Total Staff Members'],
            ['feature' => 'extracurricular', 'color' => 'moss',     'icon' => 'extracurricular', 'extracurricular' => 'programmes', 'label' => 'Extracurricular Programs'],
            ['feature' => 'certificates',    'color' => 'sunshine', 'icon' => 'shieldCheck',     'count' => 'waiting',           'label' => 'Waiting for You'],
        ],
        'chartConfig' => $schoolChart('j-management-enrollment-chart'),
        'donuts'      => $schoolDonuts,
    ],

    'admin' => [
        'metrics' => [
            ['feature' => 'people',          'color' => 'sand',      'icon' => 'graduationCap',   'count' => 'students',   'label' => words('Total {Students}')],
            ['feature' => 'people',          'color' => 'maroon',    'icon' => 'presentation',    'count' => 'teachers',   'label' => words('Total {Teachers}')],
            ['feature' => 'people',          'color' => 'sunshine',  'icon' => 'usersRound',      'count' => 'parents',    'label' => words('Total {Parents}')],
            ['feature' => 'people',          'color' => 'lightblue', 'icon' => 'briefcase',       'count' => 'management', 'label' => 'Management Panel'],
            ['feature' => 'extracurricular', 'color' => 'moss',      'icon' => 'extracurricular', 'extracurricular' => 'programmes', 'label' => 'Extracurriculars'],
        ],
        'chartConfig' => $schoolChart('j-admin-enrollment-chart'),
        'donuts'      => $schoolDonuts,
    ],
];
