<?php

declare(strict_types=1);

return [
    // A new class starts with the max number of places
    'class_size' => [
        'min' => 15,
        'max' => 40,
    ],

    // Grades are numbers, and moving up adds one. Students in the last grade graduate.
    // grade_names can give a grade its own name, for example 0 can be 'UKG'.
    'grade_numbers' => [
        'first' => 6,
        'last'  => 11,
    ],
    'grade_names'   => [],

    'terms_per_year' => 3,

    // Each term's start and end, written as month-day.
    // Used for next year if nobody typed its dates, so the new year still starts.
    'usual_terms' => [
        ['01-02', '04-10'],
        ['05-02', '08-07'],
        ['09-01', '12-04'],
    ],

    'class_name'    => '{grade}-{section}',
    'first_section' => 'A',

    'max_subjects_per_teacher' => 5,

    'id_formats' => [
        'student'    => 'STU-{year}-{number}',
        'teacher'    => 'TEA-{year}-{number}',
        'management' => 'MAN-{year}-{number}',
        'parent'     => 'PAR-{year}-{number}',
    ],

];
