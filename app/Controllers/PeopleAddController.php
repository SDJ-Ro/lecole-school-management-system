<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\ClassModel;
use App\Models\PeopleModel;
use App\Models\SchoolYear;
use App\Services\PersonFields;
use Core\Mailer;
use Core\Upload;
use Core\Validator;
use DomainException;

// Adding people
// A parent is only added together with their child, so the parents tab shows a policy card instead
// Each new account gets a welcome email with its sign-in ID and the sign-up link
class PeopleAddController extends PeopleController
{
    // GET /{role}/people/add
    public function form(string $role): void
    {
        $user  = $this->guard($role);
        $tab   = array_key_exists($this->queryText('tab'), $this->tabs()) ? $this->queryText('tab') : 'student';
        $typed = $this->getFlash('person_form') ?? ['values' => [], 'mode' => 'existing', 'idType' => 'national_id', 'parent' => null, 'qualifications' => []];

        $this->page("{$role}/add_person", $user, [
            'personForm' => [
                'tab'            => $tab,
                'tone'           => config("people.tones.{$tab}"),
                'title'          => match ($tab)
                {
                    'student'    => words('Add {Student} Account'),
                    'teacher'    => words('Add {Teacher} Account'),
                    'parent'     => words('Add {Parent} / Guardian Account'),
                    default      => 'Add ' . word('management') . ' Panel Account',
                },
                'sections'       => $tab === 'parent' ? [] : $this->sections($tab, $typed['values']),
                'guardian'       => $this->boxes(config('people.guardian'), 'guardian_', 'parent', $typed['values']),
                'idNumber'       => $typed['values']['guardian_id_number'] ?? '',
                'mode'           => $typed['mode'],
                'idType'         => $typed['idType'],
                'parent'         => $typed['parent'] === null ? null : (new PeopleModel())->parentRow((int) $typed['parent']),
                'qualifications' => $typed['qualifications'],
                'error'          => $this->getFlash('error'),
                'action'         => "/{$role}/people/add",
                'back'           => "/{$role}/people?tab={$tab}",
                'studentUrl'     => "/{$role}/people/add?tab=student",
                'searchUrl'      => "/{$role}/people/parents",
            ],
        ]);
    }
    // 178-202
    // GET /{role}/people/parents, answers with JSON
    // With nothing typed it returns the first 20 parents
    public function parents(string $role): never
    {
        $this->guard($role);
        $rows = (new PeopleModel())->searchParents($this->queryText('q', 60));

        ob_start();

        foreach ($rows as $parentRow)
        {
            $this->view('components/_parent_row', ['parentRow' => $parentRow]);
        }

        $html    = ob_get_clean();
        $message = match (true)
        {
            $rows === []        => 'No ' . strtolower(plural('parent')) . ' match your search.',
            count($rows) === 20 => 'Showing the first 20: type a name, code, phone or a child’s name to narrow it.',
            default             => 'Showing ' . count($rows) . ' registered ' . strtolower(count($rows) === 1 ? word('parent') : plural('parent')) . '.',
        };

        $this->sendJson(['ok' => true, 'html' => $html, 'message' => $message]);
    }

    // 253–289
     private function sections(string $tab, array $values): array
    {
        return array_map(fn (array $section): array => [
            'title' => words($section[0]),
            'boxes' => is_array($section[1]) ? $this->boxes($section[1], '', $tab, $values) : $section[1],
        ], config("people.add.{$tab}"));
    }

    private function boxes(array $list, string $prefix, string $role, array $values): array
    {
        $start = ['nationality' => country('nationality'), 'admission_date' => date('Y-m-d'), 'join_date' => date('Y-m-d')];
        $boxes = [];

        foreach ($list as $item)
        {
            [$field, $label] = $item;
            $flags           = $item[2] ?? '';
            [$kind, $rules]  = config('people.fields')[$field];
            $ages            = $field === 'date_of_birth' ? PersonFields::ages($role) : [];
            $required        = !str_contains($flags, 'optional') && (str_contains($flags, 'required') || str_contains($rules, 'required'));

            $boxes[] = [
                'name'     => $prefix . $field,
                'box'      => $kind,
                'label'    => words($label),
                'value'    => $values[$prefix . $field] ?? ($start[$field] ?? ''),
                'options'  => PersonFields::options($field, null, $required),
                'wide'     => str_contains($flags, 'wide'),
                'required' => $required,
                'minAge'   => $ages['min'] ?? '',
                'maxAge'   => $ages['max'] ?? '',
            ];
        }

        return $boxes;
    }

    //319–320
    }
}
