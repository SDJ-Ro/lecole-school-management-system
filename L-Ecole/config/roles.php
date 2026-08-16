<?php
// config/roles.php
// Single source of truth for role-based navigation and shell metadata.

return [
    'admin' => [
        'title' => "L'École",
        'subtitle' => 'Administrator',
        'homeHref' => '/landing_page/landing/index.html',
        'logoSrc' => '/assets/images/logo.jpg',
        'nav' => [
            [
                'label' => 'Dashboard',
                'href' => '/admin/dashboard',
                'dataNavName' => 'Dashboard',
                'icon' => 'dashboard'
            ],
            [
                'label' => 'Users',
                'href' => '/admin/people',
                'dataNavName' => 'Users',
                'icon' => 'users'
            ],
            [
                'label' => 'Extracurricular',
                'href' => '/admin/extracurricular',
                'dataNavName' => 'Extracurricular',
                'icon' => 'extracurricular'
            ],
            [
                'label' => 'Academic',
                'href' => '/admin/academic',
                'dataNavName' => 'Academic',
                'icon' => 'academic'
            ],
            [
                'label' => 'Notice Board',
                'href' => '/admin/notice',
                'dataNavName' => 'Notice Board',
                'icon' => 'notice'
            ],
            [
                'label' => 'Approvals & Verifications',
                'href' => '/admin/verify',
                'dataNavName' => 'Approvals & Verifications',
                'icon' => 'verify'
            ],
            [
                'label' => 'Audit Logs',
                'href' => '/admin/audit',
                'dataNavName' => 'Audit Logs',
                'icon' => 'audit'
            ],
        ],
        'profile' => [
            'label' => 'Alex Thompson',
            'href' => '/admin/profile',
            'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=faces'
        ]
    ],
    'management' => [
        'title' => "L'École",
        'subtitle' => 'Management Panel',
        'homeHref' => '/management/dashboard',
        'logoSrc' => '/assets/images/logo.jpg',
        'nav' => [
            [
                'label' => 'Dashboard',
                'href' => '/management/dashboard',
                'dataNavName' => 'Dashboard',
                'icon' => 'dashboard'
            ],
            [
                'label' => 'Users',
                'href' => '/management/people',
                'dataNavName' => 'Users',
                'icon' => 'users'
            ],
            [
                'label' => 'Extracurricular',
                'href' => '/management/extracurricular',
                'dataNavName' => 'Extracurricular',
                'icon' => 'extracurricular'
            ],
            [
                'label' => 'Academic',
                'href' => '/management/academic',
                'dataNavName' => 'Academic',
                'icon' => 'academic'
            ],
            [
                'label' => 'Notice Board',
                'href' => '/management/notice',
                'dataNavName' => 'Notice Board',
                'icon' => 'notice'
            ],
            [
                'label' => 'Character Certificate',
                'href' => '/management/certificate',
                'dataNavName' => 'Character Certificate',
                'icon' => 'certificate'
            ],
            [
                'label' => 'Complaints',
                'href' => '/management/complaints',
                'dataNavName' => 'Complaints',
                'icon' => 'complaints'
            ]
        ],
        'profile' => [
            'label' => 'Alex Thompson',
            'href' => '/management/profile',
            'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=faces'
        ]
    ],
    'student' => [
        'title' => "L'École",
        'subtitle' => 'Student Portal',
        'homeHref' => '/student/dashboard',
        'logoSrc' => '/assets/images/logo.jpg',
        'nav' => [],
        'profile' => ['label' => 'Profile', 'href' => '/student/profile']
    ],
    'teacher' => [
        'title' => "L'École",
        'subtitle' => 'Teacher Portal',
        'homeHref' => '/teacher/dashboard',
        'logoSrc' => '/assets/images/logo.jpg',
        'nav' => [],
        'profile' => ['label' => 'Profile', 'href' => '/teacher/profile']
    ],
    'parent' => [
        'title' => "L'École",
        'subtitle' => 'Parent Portal',
        'homeHref' => '/parent/dashboard',
        'logoSrc' => '/assets/images/logo.jpg',
        'nav' => [],
        'profile' => ['label' => 'Profile', 'href' => '/parent/profile']
    ]
];
