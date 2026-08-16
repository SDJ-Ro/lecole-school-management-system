    'notices' => [
        'post'              => ['admin', 'management', 'teacher'],   // A teacher only for their own groups
        'see_all'           => ['admin', 'management'],              // Also scheduled and waiting notices
        'approve'           => ['admin'],
        'wait_for_approval' => ['teacher'],                          // Only when the approvals module is on
    ],

    'audit' => [
        'view' => ['admin'],
    ],

    'academic' => [
        'edit' => ['admin', 'management'],
    ],

    'notifications' => [
        'see' => ['student', 'parent'],
    ],

