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

    // POST /{role}/profile/save. Only the details this role may change
    public function save(string $role): never
    {
        $user    = $this->requireRole($role);
        $back    = "/{$role}/profile";
        $columns = config("profile.editable.{$role}");
        $values  = [];

        foreach ($columns as $column)
        {
            $values[$column] = $this->postText($column, 300);
        }

        
        (new UserModel())->updateProfile($user['id'], $values);
        $this->log($user, 'PROFILE_UPDATED', implode(', ', $columns));

        $this->setFlash('notice', 'Changes saved.');
        $this->redirect($back);
    }

    // POST /{role}/profile/photo. The old photo is deleted
    // The session keeps the new one so the sidebar shows it straight away
    public function photo(string $role): never
    {
        $user = $this->requireRole($role);
        $back = "/{$role}/profile";

        [$url, $error] = Upload::image($_FILES['photo'] ?? [], 'photos', 'photo');


        $users = new UserModel();
        $old   = $users->findProfile($user['id'])['photo_url'] ?? null;

        $users->setPhoto($user['id'], $url);
        Upload::forget($old);
        $_SESSION['user']['photo'] = $url;
        $this->log($user, 'PHOTO_CHANGED', $url);

        $this->setFlash('notice', 'Photo updated.');
        $this->redirect($back);
    }

    // POST /{role}/profile/password. Typed passwords are never kept or shown again
    public function password(string $role): never
    {
        $user     = $this->requireRole($role);
        $back     = "/{$role}/profile";
        $users    = new UserModel();
        $account  = $users->findByIdentifier($user['identifier']);
        $current  = $this->postPassword('current_password');
        $password = $this->postPassword('password');
        $problem  = null;

        // A wrong current password counts like a wrong sign-in
        // The one that starts a pause also signs the person out
        // That way someone at a computer left signed in can't keep guessing
        if ($account['minutes_locked'] > 0)
        {
            $problem = "Too many wrong passwords. Try again in {$account['minutes_locked']} minutes.";
        }
        elseif (($missing = UserModel::passwordProblems($password)) !== [])
        {
            $problem = 'Your new password needs ' . implode(', ', $missing) . '.';
        }
        elseif ($password !== $this->postPassword('password_confirm'))
        {
            $problem = 'Passwords do not match.';
        }
        elseif ($password === $current)
        {
            $problem = 'Choose a password different from your current one.';
        }

        $users->changePassword($user['id'], password_hash($password, PASSWORD_DEFAULT));
        session_regenerate_id(true);   // A new session id, the same as after signing in
        $this->log($user, 'PASSWORD_CHANGED', 'from My Profile');
        $this->emailPasswordChanged($account, 'on My Profile');

        $this->setFlash('notice', 'Password updated.');
        $this->redirect($back);
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

    // Cards about the school and the system, not the person
    private function schoolValues(string $role): array
    {
        $values = ['school_phone' => school('phone')];

        if ($role === 'admin')
        {
            $modules = array_filter(config('portals.admin.menu'), fn (array $item): bool => isset($item['feature']) && feature($item['feature']));
            $values += [
                'access'  => 'Full access to every module',
                'modules' => implode(', ', array_column($modules, 'label')),
                'session' => 'Signs out after ' . intdiv((int) config('app.session_timeout.admin'), 60) . ' min idle · pauses sign-in after '
                    . config('app.login.lock_after') . ' wrong tries (' . implode(', ', config('app.login.lock_minutes')) . ' min)',
                'audit'   => feature('audit_log') ? 'On · ' . number_format((new AuditLog())->count()) . ' entries' : 'Off',
            ];
        }

        return $values;
    }

    private function eyebrow(array $person, array $values): string
    {
        return match ($person['role'])
        {
            'admin', 'management' => $person['job_title'] ?: word($person['role']),
            'teacher'             => word('teacher') . ($values['subject'] ? " · {$values['subject']}" : ''),
            'parent'              => word('parent') . ' / Guardian' . ($person['relationship'] ? " · {$person['relationship']}" : ''),
            'student'             => word('student') . ($person['class_name'] ? " · {$person['class_name']}" : ''),
        };
    }
}
