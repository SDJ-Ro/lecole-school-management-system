<?php

declare(strict_types=1);

return [
    // 'group' is the achievements timeline group in achievements.php
    'types'      => [
        'sport' => ['tab' => 'Sports', 'name' => 'Sports',              'pill' => 'Sport', 'group' => 'sports'],
        'club'  => ['tab' => 'Clubs',  'name' => 'Clubs and Societies', 'pill' => 'Club',  'group' => 'clubs'],
    ],

    'categories' => ['Athletics', 'Creative Arts', 'Academic Club', 'STEM Club', 'Performing Arts', 'Team Sport', 'Aquatics', 'General'],

    // Youngest first. A student is in a group if they are under its age on the cut-off day.
    // Open takes any age.
    'age_groups' => ['Under 13' => 13, 'Under 15' => 15, 'Under 17' => 17, 'Under 19' => 19, 'Open' => null],

    // The cover used when none is uploaded, and the most photos in one gallery
    'default_cover'  => 'images/campus.jpg',
    'gallery_photos' => 12,

    // Dashboard donuts show this many slices and put the rest in "Others"
    'donut_slices'  => 5,
    'donut_colours' => ['skyblue', 'midnight', 'sunshine', 'terracotta', 'moss', 'lightblue'],
];
