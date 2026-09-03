<?php

declare(strict_types=1);

// The white-label values an admin can change on the Settings page.
// A saved value wins over the file. Clearing the box goes back to the file's value.
return [
    // Each school.php key has a label, rules, section and icon. 'lines' makes a box with several lines.
    'profile' => [
        'name'          => ['{Institution} Name', 'max:100', 'Identity', 'building2'],
        'tagline'       => ['Tagline', 'max:150', 'Identity', 'sparkles'],
        'motto'         => ['Motto', 'max:150', 'Identity', 'award'],
        'about'         => ['About', 'max:500', 'Identity', 'info', 'lines'],
        'contact_email' => ['General Enquiries Email', 'email|max:150', 'Contact Details', 'mail'],
        'support_email' => ['Support Email', 'email|max:150', 'Contact Details', 'mailCheck'],
        'phone'         => ['Phone', 'landline', 'Contact Details', 'phone'],
        'address'       => ['Address', 'max:200', 'Contact Details', 'mapPin', 'lines'],
    ],

    // A change counts from the next school year.
    // The No-Promotion Mark must be below the pass mark, and the pass mark below the Commended average.
    'rules' => [
        'commended.average'    => ['Commended Average (%)', 'number|between:0,100', 'Academic Structure', 'award'],
        'pass_mark'            => ['Pass Mark', 'number|between:0,100', 'Academic Structure', 'checkCircle'],
        'no_promotion.average' => ['No-Promotion Mark (%)', 'number|between:0,100', 'Academic Structure', 'alertTriangle'],
    ],

    // 'beside' is the card that shares the logo's row
    'logo' => ['section' => 'Identity', 'beside' => 'about'],

    // Each word with its plural. Null means the word has no plural box.
    'terminology' => [
        'Academic Structure' => [
            'institution' => 'institutions',
            'grade'       => 'grades',
            'class'       => 'classes',
            'term'        => 'terms',
            'subject'     => 'subjects',
        ],
        'People' => [
            'student'    => 'students',
            'teacher'    => 'teachers',
            'parent'     => 'parents',
            'management' => null,
            'principal'  => null,
        ],
    ],

    // The sections in order, each with its icon and subtitle. The last one is view only.
    'sections' => [
        'Identity'           => ['building2', 'How the {institution} is named and looks everywhere'],
        'Contact Details'    => ['mail', 'Where people reach the office'],
        'Academic Structure' => ['graduationCap', 'How years, groups and lessons are named, and the marks rules (a mark changed now counts from next year)'],
        'People'             => ['usersRound', 'What each kind of account is called'],
        'System Information' => ['info', 'Set when the system is installed: changing it affects sign-in IDs, dates and every module'],
    ],
];
