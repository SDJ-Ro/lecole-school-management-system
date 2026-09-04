<?php

declare(strict_types=1);

// A category not listed here gets the linen colour and goes under clubs
return [
    'categories' => [
        'Academic'   => ['tone' => 'lightblue',  'group' => 'academic'],
        'Sports'     => ['tone' => 'maroon',     'group' => 'sports'],
        'Football'   => ['tone' => 'maroon',     'group' => 'sports'],
        'Athletics'  => ['tone' => 'sunshine',   'group' => 'sports'],
        'Debating'   => ['tone' => 'sky',        'group' => 'clubs'],
        'Music'      => ['tone' => 'terracotta', 'group' => 'clubs'],
        'Arts'       => ['tone' => 'terracotta', 'group' => 'clubs'],
        'Robotics'   => ['tone' => 'sand',       'group' => 'clubs'],
        'Clubs'      => ['tone' => 'sunshine',   'group' => 'clubs'],
        'Leadership' => ['tone' => 'grey',       'group' => 'leadership'],
    ],

    // The timeline filter groups. 'category' is the category a new record in that group is saved with.
    'groups' => [
        'academic'   => ['label' => 'Academic',   'type' => 'Academic',          'tone' => 'lightblue', 'category' => 'Academic'],
        'sports'     => ['label' => 'Sports',     'type' => 'Sports',            'tone' => 'rose',      'category' => 'Sports'],
        'clubs'      => ['label' => 'Clubs',      'type' => 'Clubs & Societies', 'tone' => 'fern',      'category' => 'Clubs'],
        'leadership' => ['label' => 'Leadership', 'type' => 'Leadership',        'tone' => 'violet',    'category' => 'Leadership'],
    ],

    // Missing Record Requests.
    // With 'programme' the student picks a club or sport and its teacher answers. Otherwise the class teacher does.
    // When 'group' is null the teacher chooses the group.
    // 'section' is the certificate section the record goes in.
    'request_types' => [
        'Academic Achievement'                => ['programme' => false, 'group' => 'academic', 'section' => 'academic'],
        'Sports / Club Enrollment or Position' => ['programme' => true,  'group' => null,       'section' => 'activities'],
        'Certificate or Award'                => ['programme' => false, 'group' => null,       'section' => 'activities'],
        'Other'                               => ['programme' => false, 'group' => null,       'section' => 'activities'],
    ],

    'waiting_requests' => 5,       // Most requests one student may have waiting at once
];
