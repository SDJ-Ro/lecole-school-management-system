    'notices' => [
        'post'              => ['admin', 'management', 'teacher'],   // A teacher only for their own groups
        'see_all'           => ['admin', 'management'],              // Also scheduled and waiting notices
        'approve'           => ['admin'],
        'wait_for_approval' => ['teacher'],                          // Only when the approvals module is on
    ],

    'audit' => [
        'view' => ['admin'],
    ],

    'settings' => [
        'edit' => ['admin'],
    ],

    'academic' => [
        'edit' => ['admin', 'management'],
    ],

    'people' => [
        'directory'    => ['admin', 'management'],
        'management'   => ['admin'],
        'own_students' => ['teacher'],               // View only
    ],

    'leaving' => [
        'see'    => ['admin', 'management', 'teacher'],
        'change' => ['admin'],                            // Also cancel
        'start'  => ['admin', 'management'],              // Left Without Notice
    ],

    'notifications' => [
        'see' => ['student', 'parent'],
    ],
