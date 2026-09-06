<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AuditLog;
use App\Models\LeaveRequestModel;
use App\Models\PeopleModel;
use App\Models\UserModel;
use App\Services\PersonDetails;
use Core\Controller;
use Core\Upload;
use Core\Validator;

// My Profile for every role, with details, photo and password
class ProfileController extends Controller
{
    // After a refused save the page opens in edit mode with what was typed
    public function show(string $role): void
    {
        $user  = $this->requireRole($role);
        $typed = $this->getFlash('profile_form');

        $this->page("{$role}/profile", $user, [
            'subtitle'      => config("profile.subtitles.{$role}"),
            'profile'       => $this->profile((new PeopleModel())->find($user['id']), $typed ?? []),
            'editing'       => $typed !== null,
            'error'         => $this->getFlash('error'),   // Shown inside the page, not in the banner at the top
            'passwordError' => $this->getFlash('password_error'),
            'leaving'       => $role === 'student' && feature('parent_consent') ? ['request' => (new LeaveRequestModel())->latest($user['id'])] : null,
        ]);
    }

    // $typed is what was typed before a refused save, shown again instead of the saved value
    private function profile(array $person, array $typed): array
    {
        $role     = $person['role'];
        $layout   = config("profile.layout.{$role}");
        $editable = config("profile.editable.{$role}");
        $values   = PersonDetails::values($person) + $this->schoolValues($role);

        // Each field has a label, an icon, a value key and maybe 'wide'
        $card = function (array $field) use ($values, $editable, $typed, $person): array
        {
            $column = in_array($field[2], $editable, true) ? $field[2] : null;

            return [
                'label' => words($field[0]),
                'icon'  => $field[1],
                'value' => ($values[$field[2]] ?? '') ?: '—',
                'edit'  => $column,
                'raw'   => $column === null ? '' : ($typed[$column] ?? (string) $person[$column]),
                'wide'  => ($field[3] ?? null) === 'wide',
            ];
        };
        $section = fn (string $title, string $subtitle, string $icon, array $fields, int $columns = 3, ?string $tint = null, string $tone = ''): array =>
            ['title' => words($title), 'subtitle' => words($subtitle), 'icon' => $icon, 'tone' => $tone, 'columns' => $columns, 'tint' => $tint,
             'cards' => array_map($card, $fields), 'password' => false];
        $lines    = config('profile.section_lines');

        $sections = [$section('Contact Information', $lines['contact'], 'phone', $layout['contact']),
                     $section('Personal Details', $lines['personal'], 'user', $layout['personal'])];

        if ($layout['role'] !== null)
        {
            [$title, $subtitle, $icon, $tint, $fields] = $layout['role'];
            $sections[] = $section($title, $subtitle, $icon, $fields, 3, $tint);
        }

        foreach ($layout['extra'] as [$title, $subtitle, $icon, $fields])
        {
            $sections[] = $section($title, $subtitle, $icon, $fields);
        }

        $sections[] = ['password' => can('profile.password')] + $section('Account Information', $lines['account'], 'lockKeyhole', $layout['account'], 4, null, 'maroon');

        return [
            'hero'      => [
                'role'    => $role,
                'name'    => $person['full_name'],
                'eyebrow' => $this->eyebrow($person, $values),
                'sub'     => $values['portal'] . ' · ' . school('name') . ' ' . word('institution') . ' Management',
                'id'      => $values['code'],
                'status'  => ucfirst(strtolower($person['activation_status'])),
                'photo'   => $person['photo_url'] ?: config("portals.{$role}.avatar"),
                'photoTo' => $editable !== [] ? "/{$role}/profile/photo" : null,
            ],
            'sections'  => $sections,
            'canEdit'   => $editable !== [],
        ];
    }

    }
}
