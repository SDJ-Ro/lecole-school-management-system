<?php

declare(strict_types=1);

return [
    'name'        => 'Sri Lanka',
    'timezone'    => 'Asia/Colombo',
    'language'    => 'en-US',         // Used for the page's html lang

    // Written in PHP date() letters. The scripts get them too.
    'date_format'      => 'M d, Y',
    'day_format'       => 'F j',
    'short_day_format' => 'M j',
    'full_date_format' => 'F j, Y',
    'long_date_format' => 'l, F j, Y',
    'month_format'     => 'M Y',

    'phone' => [
        'code'   => '+94',
        'digits' => 9,
    ],

    'national_id' => [
        'label'   => 'NIC',
        'pattern' => '/^([0-9]{9}[VvXx]|[0-9]{12})$/',
    ],

    'passport_pattern' => '/^[A-Za-z0-9]{6,20}$/',

    // Smallest level first
    'achievement_levels' => ['School', 'Inter-School', 'Zonal', 'District', 'Provincial', 'National', 'All-Island', 'International'],

    'nationality' => 'Sri Lankan',   // Filled in for a new student
    'religions'   => ['Prefer not to say', 'Buddhism', 'Catholic', 'Hinduism', 'Islam', 'Other'],

    // Saved in the address_area, address_district and address_region columns of student_details
    'address_parts' => [
        'area'     => ['label' => 'Educational Zone', 'choices' => ['Colombo', 'Kandy', 'Galle', 'Gampaha', 'Kurunegala', 'Jaffna', 'Matara']],
        'district' => ['label' => 'District', 'choices' => ['Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
            'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara',
            'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya']],
        'region'   => ['label' => 'Province', 'choices' => ['Western', 'Central', 'Southern', 'North Western', 'Northern', 'Eastern',
            'Sabaragamuwa', 'Uva', 'North Central']],
    ],
];
