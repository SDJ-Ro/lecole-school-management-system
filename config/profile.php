<?php

declare(strict_types=1);

$nationalId = country('national_id.label');
$area       = country('address_parts');

return [
    // What each role may change on their own profile. The office changes names, IDs and class on People.
    // UserModel::updateProfile() refuses any other field.
    'editable' => [
        'student'    => [],
        'parent'     => ['phone', 'address', 'emergency_name', 'emergency_phone'],   // Not the email, because it is their sign-in ID
        'teacher'    => ['phone', 'address', 'emergency_name', 'emergency_phone'],
        'management' => ['phone', 'address', 'emergency_name', 'emergency_phone'],
        'admin'      => ['phone', 'address', 'emergency_name', 'emergency_phone'],
    ],

    'rules' => [
        'phone'           => 'required|phone',
        'address'         => 'required|min:6|max:300',
        'emergency_name'  => 'required|name|max:150',
        'emergency_phone' => 'required|phone',
    ],

    'labels' => [
        'phone'           => 'Phone',
        'address'         => 'Home address',
        'emergency_name'  => 'Emergency contact',
        'emergency_phone' => 'Emergency phone',
    ],

    'subtitles' => [
        'admin'      => 'Manage your account information and credentials.',
        'management' => 'Leadership credentials and institutional administration.',
        'teacher'    => 'Manage your staff profile and teaching assignments.',
        'parent'     => 'View and update your parent account details.',
        'student'    => 'Your personal and academic profile information.',
    ],

    'section_lines' => [
        'contact'  => 'How the {institution} reaches you',
        'personal' => 'Who you are on record',
        'account'  => 'Your sign-in and access',
    ],

    // Each card has a label, an icon, where its value comes from, and maybe 'wide'.
    // Values come from PersonDetails::values() or ProfileController::schoolValues().
    // 'role' is the tinted section. 'extra' holds the other sections.
    'layout' => [
        'admin' => [
            'contact'  => [['Administrator Email', 'mail', 'identifier'], ['Primary Mobile', 'phone', 'phone'], ['Central IT Office', 'phone', 'school_phone']],
            'personal' => [['Full Name', 'user', 'full_name'], ['Gender', 'user', 'gender'], ["{$nationalId} Number", 'lockKeyhole', 'national_id'],
                           ['Date of Birth', 'calendar', 'dob'], ['Joined Date', 'calendar', 'join'], ['Central Station', 'building2', 'office_address']],
            'role'     => ['Administrative Access & System Operations', 'What you can reach and how it is guarded', 'shieldCheck', 'midnight',
                           [['Access Level', 'shieldCheck', 'access'], ['Security Audit Log', 'lockKeyhole', 'audit'], ['Session Security', 'shieldCheck', 'session']]],
            'extra'    => [
                ['Residential & Emergency Contact', 'Where you live and who to call', 'mapPin', [['Home Address', 'mapPin', 'address', 'wide'],
                    ['Emergency Contact', 'phone', 'emergency_name'], ['Emergency Phone', 'phone', 'emergency_phone']]],
                ['System Scope & Platform Governance', 'The modules you look after', 'shieldCheck', [['Modules Managed', 'building2', 'modules', 'wide']]],
            ],
            'account'  => [['Administrator ID', 'lockKeyhole', 'code'], ['Portal Role', 'shieldCheck', 'role_word'], ['Account Created', 'calendar', 'created'],
                           ['Last Sign-In', 'clock', 'last_login']],
        ],
        'management' => [
            'contact'  => [['Institutional Email', 'mail', 'identifier'], ['Direct Mobile', 'phone', 'phone'], ['Office Line', 'phone', 'school_phone']],
            'personal' => [['Full Name', 'user', 'full_name'], ['Designation', 'briefcase', 'job_title'], ['Gender', 'user', 'gender'],
                           ["{$nationalId} Number", 'lockKeyhole', 'national_id'], ['Date of Birth', 'calendar', 'dob'], ['Join Date', 'calendar', 'join'],
                           ['Office Location', 'building2', 'office_address']],
            'role'     => null,
            'extra'    => [
                ['Emergency Contacts & Address', 'Where you live and who to call', 'mapPin', [['Home Address', 'mapPin', 'address', 'wide'],
                    ['Emergency Contact', 'phone', 'emergency_name'], ['Emergency Phone', 'phone', 'emergency_phone']]],
            ],
            'account'  => [['Staff ID', 'lockKeyhole', 'code'], ['Portal Access', 'shieldCheck', 'portal'], ['Account Created', 'calendar', 'created'],
                           ['Last Sign-In', 'clock', 'last_login']],
        ],
        'teacher' => [
            'contact'  => [['{Institution} Email', 'mail', 'identifier'], ['Mobile Phone', 'phone', 'phone']],
            'personal' => [['Full Name', 'user', 'full_name'], ['Date of Birth', 'calendar', 'dob'], ["{$nationalId} Number", 'lockKeyhole', 'national_id'],
                           ['Gender', 'user', 'gender'], ['Joined Date', 'calendar', 'join'], ['Qualifications', 'award', 'qualifications']],
            'role'     => ['Teaching Assignments & {Institution} Roles', 'What you teach and look after', 'bookOpen', 'sunshine',
                           [['Primary Subject', 'bookOpen', 'subject'], ['Homeroom {Class}', 'graduationCap', 'homeroom'],
                           ['{Classes} Taught', 'usersRound', 'classes_taught'], ['{Teacher}-in-Charge', 'extracurricular', 'in_charge'],
                           ['Staff Room Desk', 'building2', 'office_address']]],
            'extra'    => [
                ['Residential & Emergency Contact', 'Where you live and who to call', 'mapPin', [['Home Address', 'mapPin', 'address', 'wide'],
                    ['Emergency Contact', 'phone', 'emergency_name'], ['Emergency Phone', 'phone', 'emergency_phone']]],
            ],
            'account'  => [['Staff ID', 'lockKeyhole', 'code'], ['Portal Access', 'shieldCheck', 'portal'], ['Account Created', 'calendar', 'created'],
                           ['Last Sign-In', 'clock', 'last_login']],
        ],
        'parent' => [
            'contact'  => [['Personal Email', 'mail', 'identifier'], ['Primary Mobile', 'phone', 'phone'], ['Alternative Phone', 'phone', 'home_phone']],
            'personal' => [['Full Name', 'user', 'full_name'], ['Gender', 'user', 'gender'], ['Relationship', 'heart', 'relationship'],
                           ['Date of Birth', 'calendar', 'dob'], ["{$nationalId} Number", 'lockKeyhole', 'national_id'], ['Occupation', 'briefcase', 'occupation'],
                           ['Employer / Business', 'building2', 'employer']],
            'role'     => ['Linked Children & {Institution} Engagement', 'Your children at the {institution}', 'heartHandshake', 'terracotta',
                           [['Linked Children', 'graduationCap', 'children', 'wide']]],
            'extra'    => [
                ['Residential & Family Information', 'Where you live and who to call', 'mapPin', [['Home Address', 'mapPin', 'address', 'wide'],
                    ['Emergency Contact', 'phone', 'emergency_name'], ['Emergency Phone', 'phone', 'emergency_phone']]],
            ],
            'account'  => [['{Parent} ID', 'lockKeyhole', 'code'], ['Portal Access', 'shieldCheck', 'portal'], ['Registration Date', 'calendar', 'created'],
                           ['Last Sign-In', 'clock', 'last_login']],
        ],
        'student' => [
            'contact'  => [['{Parent} Email', 'mail', 'guardian_email'], ['{Parent} Contact', 'phone', 'guardian_phone'], ['Emergency Line', 'phone', 'emergency_line']],
            'personal' => [['Full Name', 'user', 'full_name'], ['Date of Birth', 'calendar', 'dob'], ['Gender', 'user', 'gender'],
                           ['Birth Certificate No', 'award', 'birth_certificate'], ['Blood Group', 'heart', 'blood_group'], ['Nationality', 'mapPin', 'nationality'],
                           ['Religion', 'shield', 'religion'], ['Previous {Institution}', 'bookOpen', 'previous_school']],
            'role'     => ['Academic & Extracurricular Information', 'Your {class}, {teacher} and activities', 'graduationCap', 'sky',
                           [['Current {Class}', 'graduationCap', 'class'], ['{Class} {Teacher}', 'user', 'class_teacher'],
                           ['Primary Sport', 'extracurricular', 'sports'], ['Clubs & Societies', 'usersRound', 'clubs'], ['Admission Date', 'calendar', 'admission']]],
            'extra'    => [
                ['Residential & Regional Details', 'Where you live', 'mapPin', [['Residential Address', 'mapPin', 'address', 'wide'],
                    [$area['area']['label'], 'building2', 'address_area'], [$area['district']['label'], 'mapPin', 'address_district'],
                    [$area['region']['label'], 'mapPin', 'address_region']]],
                ['Guardian & Medical Notes', 'Who looks after you, and health notes', 'heartHandshake', [['Primary Guardian', 'heartHandshake', 'guardian'],
                    ['Guardian Phone', 'phone', 'guardian_phone'], ['Guardian Email', 'mail', 'guardian_email'], ['Medical Notes / Health', 'heart', 'medical_notes', 'wide']]],
            ],
            'account'  => [['{Student} ID', 'lockKeyhole', 'identifier'], ['Portal Role', 'graduationCap', 'role_word'], ['Academic Year', 'calendar', 'academic_year'],
                           ['Last Portal Sign-In', 'clock', 'last_login']],
        ],
    ],
];
