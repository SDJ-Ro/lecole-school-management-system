<?php

declare(strict_types=1);

return [
    // These match the column sizes in the complaints table
    'limits' => [
        'subject'  => 150,
        'body'     => 2000,
        'response' => 2000,
    ],

    'open_limit' => 5,   // Most open complaints one parent may have at once

    // Each category's card colour
    'categories' => [
        'Academic'        => 'sky',
        'Facilities'      => 'flame',
        'Transport'       => 'terracotta',
        'Administration'  => 'maroon',
        'Extracurricular' => 'sunshine',
    ],

    'statuses' => [
        'in_progress' => ['In Progress', 'clock'],
        'resolved'    => ['Resolved', 'checkCircle2'],
    ],
];
