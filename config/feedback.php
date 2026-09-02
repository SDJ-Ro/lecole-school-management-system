<?php

declare(strict_types=1);

// The keys match the kind and audience values in the feedback table
return [
    'types' => [
        'positive'     => ['Positive', 'starFilled'],
        'constructive' => ['Constructive', 'trendingUp'],
        'negative'     => ['Negative', 'alertCircle'],
    ],

    'audiences' => [
        'both'    => words('{Student} & {Parent}'),
        'student' => words('{Student} only'),
        'parent'  => words('{Parent} only'),
    ],

    // Feedback of these kinds can't be sent to the student alone
    'parent_must_read' => ['negative'],
    // The one subject choice that is not a class subject
    'general' => 'General Conduct',

    // These match the column sizes in the feedback table
    'lengths' => [
        'subject' => 100,
        'title'   => 150,
        'message' => 2000,
    ],
];
