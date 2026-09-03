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
    // POST /{role}/people/add. Checks everything first, then saves it all at once
    public function add(string $role): never
    {
        $user = $this->guard($role);
        $tab  = $this->postText('tab', 20);

    //65-132
    
        $back   = "/{$role}/people/add?tab={$tab}";
        $people = new PeopleModel();
        $typed  = ['values' => [], 'mode' => 'existing', 'idType' => 'national_id', 'parent' => null, 'qualifications' => []];

        [$values, $problems] = $this->check($this->fields($tab), '', $tab, $people, $typed);

        // A student's parent: an existing one from the search, or a new one
        $parentId = null;
        $guardian = [];

        if ($tab === 'student')
        {
            $typed['mode']   = $this->postText('guardian_mode', 10) === 'new' ? 'new' : 'existing';
            $typed['idType'] = $this->postText('guardian_id_type', 15) === 'passport' ? 'passport' : 'national_id';
            $typed['parent'] = $this->postText('parent_id', 11) === '' ? null : (int) $this->postText('parent_id', 11);

            if ($typed['mode'] === 'existing' && ($typed['parent'] === null || $people->parentRow($typed['parent']) === null))
            {
                $problems[] = 'Please choose a ' . strtolower(word('parent')) . ' from the search, or add a new one.';
            }

            if ($typed['mode'] === 'existing')
            {
                $parentId = $typed['parent'];
            }

            if ($typed['mode'] === 'new')
            {
                // One ID box serves both kinds of ID, and its text goes to the chosen one
                // If no home address is typed, the parent gets the student's
                $idNumber = $this->postText('guardian_id_number', 30);
                $fields   = $this->fields('guardian') + [$typed['idType'] => [$typed['idType'] === 'passport' ? 'Passport Number' : country('national_id.label'), true]];
                $instead  = [$typed['idType'] => $idNumber] + ($this->postText('guardian_address', 300) === '' ? ['address' => $values['address']] : []);

                $typed['values']['guardian_id_number'] = $idNumber;
                [$guardian, $more] = $this->check($fields, 'guardian_', 'parent', $people, $typed, $instead);
                $problems          = array_merge($problems, $more);
            }
        }

        // Kept as typed too, so a refused form can show them again
        $degrees      = $this->postList('qualification_degree');
        $institutions = $this->postList('qualification_institution');
        $years        = $this->postList('qualification_year');

        [$qualifications, $problem] = $tab === 'teacher' ? PersonFields::qualifications($degrees, $institutions, $years) : [[], null];
        $typed['qualifications']    = $tab !== 'teacher' ? [] : array_map(fn (?string $degree, ?string $institution, ?string $year): array =>
            ['degree' => $degree ?? '', 'institution' => $institution ?? '', 'year_obtained' => $year ?? ''], $degrees, $institutions, $years);

        if ($problem !== null)
        {
            $problems[] = $problem;
        }

        // The photo is saved last, so a refused form leaves no file behind
        $photo = null;

        if ($problems === [] && $tab === 'student')
        {
            [$photo, $photoProblem] = Upload::image($_FILES['photo'] ?? [], 'photos', 'photo');

            if ($photoProblem !== null)
            {
                $problems[] = $photoProblem;
            }
        }
    //138-177
    
        [$profile, $details] = $this->split($values);
        $profile            += $photo === null ? [] : ['photo_url' => $photo];

        $newParent = $tab === 'student' && $typed['mode'] === 'new';

        try
        {
            if ($newParent)
            {
                [$id] = $people->addStudentWithNewParent($profile, $details, ...$this->split($guardian));   // Returns the student's id first, then the parent's
            }
            else
            {
                $id = $people->add($tab, $profile, $details, $parentId, $qualifications);
            }
        }
        catch (DomainException $full)
        {
            Upload::forget($photo);
            $this->setFlash('person_form', $typed);
            $this->refuse($full->getMessage(), $back, 422);   // The class filled up in the meantime
        }

        $person = $people->find($id);
        $unlocked = $this->postText('age_unlocked', 1) === '1' || $this->postText('guardian_age_unlocked', 1) === '1';
        $this->log($user, 'PERSON_ADDED', "{$person['full_name']} ({$tab})" . ($newParent ? ' + a new ' . strtolower(word('parent')) : '')
            . ($unlocked ? ' · age range unlocked' : ''));
        $years = new SchoolYear();
        $later = $tab === 'student' && $years->placementYear() > $years->current();   // Admitted after this year's last term
        $this->setFlash('notice', "{$person['full_name']} added" . ($later ? ' (their ' . strtolower(word('class')) . ' starts in ' . $years->placementYear() . ')' : '')
            . '. ' . ($this->welcome($person, $newParent)
            ? 'A welcome email was sent.'
            : 'The welcome email could not be sent; they can still sign up with their ID.'));

        // Back to the list, filtered to where the new person is
        $class = $tab === 'student' ? (new ClassModel())->find((int) $person['class_id']) : null;
        $this->redirect("/{$role}/people?tab={$tab}" . ($class === null ? '' : "&grade={$class['grade_id']}&class={$class['id']}"));
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
    //203-250
       // Each field's label, and whether it is required
    private function fields(string $tab): array
    {
        $boxes = $tab === 'guardian' ? config('people.guardian') : array_merge(...array_map(
            fn (array $section): array => is_array($section[1]) ? $section[1] : [],
            config("people.add.{$tab}")
        ));
        $fields = [];

        foreach ($boxes as $box)
        {
            $fields[$box[0]] = [words($box[1]), str_contains($box[2] ?? '', 'required')];
        }

        return $fields;
    }

    // Returns the values and a list of problems
    // $instead replaces some typed values, and $typed keeps what was typed
    private function check(array $fields, string $prefix, string $role, PeopleModel $people, array &$typed, array $instead = []): array
    {
        $values = [];

        foreach (array_keys($fields) as $field)
        {
            if (config('people.fields')[$field][0] !== 'photo')
            {
                $typed['values'][$prefix . $field] = $this->postText($prefix . $field, 1000);
                $values[$field]                    = $instead[$field] ?? $typed['values'][$prefix . $field];
            }
        }

        $labels   = array_map(fn (array $field): string => $field[0], $fields);
        $required = array_keys(array_filter($fields, fn (array $field): bool => $field[1]));
        $problems = Validator::check($values, PersonFields::rules(array_keys($values), $required), $labels)
            ?: PersonFields::problems($role, 0, $values, $people, $this->postText("{$prefix}age_unlocked", 1) === '1');

        return [$values, array_values($problems)];
    }

    // Splits the values into profile columns and role details
    // Empty boxes are saved as null
    private function split(array $values): array
    {
        $columns = array_map(fn (string $value): ?string => $value === '' ? null : $value, $values);
        $profile = array_intersect_key($columns, array_flip(PeopleModel::PROFILE_COLUMNS));

        return [$profile, array_diff_key($columns, $profile)];
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
 // Sends one email for each person added
    // Staff get it at their personal email
    // A student's goes to their parent, and also covers the parent's own account when the parent is new
    // It holds no password, because they choose one on the sign-up page
    private function welcome(array $person, bool $newParent = false): bool
    {
        $school  = school('name') . ' ' . word('institution');
        $account = fn (array $who, string $title): array => ['title' => $title, 'fullName' => $who['full_name'], 'identifier' => $who['identifier'],
            'url' => config('app.url') . "/auth/{$who['role']}/signup"];

        if ($person['role'] !== 'student')
        {
            return Mailer::send((string) $person['personal_email'], "{$school} — Your account is ready", 'welcome', [
                'name'     => $person['first_name'],
                'intro'    => 'Your ' . strtolower(word($person['role'])) . " account at {$school} is ready to be set up.",
                'accounts' => [$account($person, 'Your account')],
            ]);
        }

        $parent = (new PeopleModel())->find((int) $person['parents'][0]['id']);
        $child  = $account($person, "{$person['first_name']}'s " . strtolower(word('student')) . ' account');

        return Mailer::send($parent['identifier'], "{$school} — {$person['full_name']} enrolled", 'welcome', [
            'name'     => $parent['first_name'],
            'intro'    => $newParent
                ? "{$person['full_name']} has been enrolled at {$school}. Your " . strtolower(word('parent')) . " account and {$person['first_name']}'s account are ready to be set up."
                : "{$person['full_name']} has been enrolled at {$school} and linked to your account. Your own sign-in stays the same; only {$person['first_name']}'s account needs setting up.",
            'accounts' => $newParent ? [$account($parent, 'Your ' . strtolower(word('parent')) . ' account'), $child] : [$child],
        ]);
    //319–320
    }
}
