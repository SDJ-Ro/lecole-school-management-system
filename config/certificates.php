<?php

declare(strict_types=1);

return [
    // Each status has its name and tag colour
    'statuses' => [
        'draft'  => ['Pending Review', 'flame'],
        'issued' => ['Issued', 'moss'],
    ],

    // The tab name, then the wording on the certificate
    'pathways' => [
        'leaving'    => ['Leaving', 'Leaving student'],
        'graduating' => ['Graduating', 'Graduating student'],
    ],

    // The certificate sections in order, each with its heading and icon
    'sections' => [
        'academic'   => ['Special recognition', 'graduationCap'],
        'activities' => ['Extracurricular achievements', 'fileCheck'],
        'conduct'    => ['Conduct & character', 'user'],
    ],

    // Shown until management writes the conduct text, which Finalise needs
    'conduct_placeholder' => 'To be written by the {institution} before the certificate is issued.',

    'request_states' => [
        'pending'  => ['Pending', 'flame'],
        'approved' => ['Approved', 'moss'],
        'rejected' => ['Rejected', 'maroon'],
    ],

    'purposes'   => ['University / Higher Education Admission', 'Employment / Job Application', 'Visa / Immigration', 'Scholarship Application', 'Other'],
    'deliveries' => [words('Collect from {Institution} Office'), 'Email as Signed PDF'],
    'max_copies' => 5,
];
