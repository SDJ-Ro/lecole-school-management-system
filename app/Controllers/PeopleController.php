<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\ClassModel;
use App\Models\LeaveRequestModel;
use App\Models\PeopleModel;
use App\Services\AcademicWatch;
use App\Services\AchievementTimeline;
use App\Services\PersonDetails;
use App\Services\RecordBook;
use App\Services\PersonFields;
use App\Services\TeacherChoices;
use Core\Controller;
use Core\Validator;
use DomainException;

// The People directory for the office, and a teacher's view of the students in their own classes
// Switching off a teacher who still has duties opens the handover pop-up instead
class PeopleController extends Controller
{
    // Each tab has a label and the module it needs, if any
    private const PROFILE_TABS = [
        'information'      => ['Information', null],
        'academics'        => ['Academics', 'term_marks'],
        'extracurriculars' => ['Extracurriculars', 'extracurricular'],
        'achievements'     => ['Achievements', 'achievements'],
    ];

    // GET /{role}/people
    public function index(string $role): void
    {
        $user   = $this->guard($role);
        $tabs   = $this->tabs();
        $tab    = array_key_exists($this->queryText('tab'), $tabs) ? $this->queryText('tab') : 'student';
        $people = new PeopleModel();

        // The first grade that has students is shown by default
        $grades  = array_values(array_filter((new ClassModel())->grades(), fn (array $grade): bool => $grade['classes'] !== []));
        $first   = array_values(array_filter($grades, fn (array $grade): bool => $grade['students'] > 0))[0] ?? $grades[0] ?? null;
        $grade   = array_column($grades, null, 'id')[(int) $this->queryText('grade')] ?? $first;
        $class   = array_column($grade['classes'] ?? [], null, 'id')[(int) $this->queryText('class')] ?? null;

        $filters = [
            'q'                  => $this->queryText('q'),
            'status'             => in_array($this->queryText('status'), ['on', 'off'], true) ? $this->queryText('status') : '',
            'grade_id'           => $tab === 'student' && $class === null ? $grade['id'] ?? null : null,
            'class_id'           => $tab === 'student' ? $class['id'] ?? null : null,
            'extracurricular_id' => array_key_exists((int) $this->queryText('extracurricular'), $people->extracurricularChoices()) ? (int) $this->queryText('extracurricular') : null,
            'subject'            => in_array($this->queryText('subject'), $people->subjectChoices(), true) ? $this->queryText('subject') : '',
            'relationship'       => in_array($this->queryText('relationship'), config('people.relationships'), true) ? $this->queryText('relationship') : '',
        ];

        // The current filters, so the page's links can keep them
        $query = array_filter([
            'tab'             => $tab,
            'grade'           => $tab === 'student' ? $grade['id'] ?? null : null,
            'class'           => $filters['class_id'],
            'q'               => $filters['q'],
            'status'          => $filters['status'],
            'extracurricular' => $tab === 'student' ? $filters['extracurricular_id'] : null,
            'subject'         => $tab === 'teacher' ? $filters['subject'] : '',
            'relationship'    => $tab === 'parent' ? $filters['relationship'] : '',
        ], fn (mixed $value): bool => $value !== null && $value !== '');

        $this->page("{$role}/people", $user, $this->listData($tab, $filters) + [
            'pageUrl'                => "/{$role}/people",
            'query'                  => $query,
            'tabs'                   => $tabs,
            'tab'                    => $tab,
            'grades'                 => $grades,
            'grade'                  => $grade,
            'class'                  => $class,
            'extracurricularChoices' => $people->extracurricularChoices(),
            'subjectChoices'         => $people->subjectChoices(),
        ]);
    }

    // GET /teacher/students. View only
    public function students(string $role): void
    {
        $user = $this->requireRole($role);
//90-98

        $search = $this->queryText('q');

        $this->page("{$role}/students", $user, $this->listData('student', ['q' => $search, 'teacher_id' => $user['id']]) + [
            'pageUrl' => "/{$role}/students",
            'query'   => array_filter(['q' => $search]),
        ]);
    }
//145-150
// GET /{role}/people/profile, answers with JSON
    public function profile(string $role): never
    {
        $this->guard($role);
        $person = (new PeopleModel())->find((int) $this->queryText('id', 11));

        //156-167
        
        $this->sendProfile($person, $role);
    }

    // GET /teacher/students/profile, answers with JSON
    // Only the student's class teacher sees the medical notes
    public function studentProfile(string $role): never
    {
        $user   = $this->requireRole($role);
        $people = new PeopleModel();
        $person = $people->find((int) $this->queryText('id', 11));
//172-184

        $this->sendProfile($person, null, '', $people->isClassTeacherOf($user['id'], $person['id']) ? null : 'subject_teacher');
    }
        // POST /{role}/people/update, answers with JSON
    // Sends back the redrawn profile, or the first problem found
    public function update(string $role): never
    {
        $user   = $this->guard($role);
        $back   = "/{$role}/people";
        $people = new PeopleModel();
        $person = $people->find((int) $this->postText('id', 11));
//190-222

        $labels = $this->editable($person['role']);
        $values = [];

        foreach ($labels as $field => $label)
        {
            $values[$field] = $this->postText($field, 1000);
        }

        $unlocked = $this->postText('age_unlocked', 1) === '1';   // Allows an unusual age
        $problems = Validator::check($values, PersonFields::rules(array_keys($labels)), $labels)
            ?: PersonFields::problems($person['role'], $person['id'], $values, $people, $unlocked);

        // A student's main parent, picked from the search
        // Picking the same parent again changes nothing
        $parentId = $person['role'] === 'student' && $this->postText('parent_id', 11) !== '' ? (int) $this->postText('parent_id', 11) : null;

        if ($parentId !== null && $people->parentRow($parentId) === null)
        {
            $problems[] = 'Please choose a ' . strtolower(word('parent')) . ' from the search.';
        }

        // Qualifications replace the old list only when the form sends them
        // That way a request without them can't wipe the list
        [$qualifications, $problem] = $person['role'] === 'teacher' && $this->postText('qualifications_sent', 1) === '1'
            ? PersonFields::qualifications($this->postList('qualification_degree'), $this->postList('qualification_institution'), $this->postList('qualification_year'))
            : [null, null];

        if ($problem !== null)
        {
            $problems[] = $problem;
        }
//227-247

        // Empty fields are saved as null
        // Profile columns are kept apart from the role's details
        $columns = array_map(fn (string $value): ?string => $value === '' ? null : $value, $values);
        $profile = array_intersect_key($columns, array_flip(PeopleModel::PROFILE_COLUMNS));
        $parent  = $parentId === (int) ($person['parents'][0]['id'] ?? 0) ? null : $parentId;

        try
        {
            $people->update($person['id'], $person['role'], $profile, array_diff_key($columns, $profile), $parent, $qualifications);
        }
        catch (DomainException $full)
        {
            $this->refuse($full->getMessage(), $back, 422);   // The new class filled up in the meantime
        }

        $saved = $people->find($person['id']);
        $this->log($user, 'PERSON_UPDATED', $saved['full_name'] . ($unlocked ? ' · age range unlocked' : ''));
        $this->sendProfile($saved, $role, "{$saved['full_name']} saved.");
    }

//248-265
// GET /{role}/people/handover, answers with JSON
    public function handoverForm(string $role): never
    {
        $this->guard($role);
        $people = new PeopleModel();
        $person = $this->leavingTeacher($people, (int) $this->queryText('id', 11), "/{$role}/people?tab=teacher");
        $rows   = $this->handoverRows($people->duties($person['id']), array_diff_key((new ClassModel())->teachers(), [$person['id'] => true]));

        ob_start();
        $this->view('components/_teacher_handover', [
            'person'    => $person,
            'rows'      => $rows,
            'action'    => "/{$role}/people/handover",
            'csrfField' => $this->csrfField(),
        ]);
        $this->sendJson(['ok' => true, 'html' => ob_get_clean()]);
    }
//328-443
// With no $editorRole the profile is view only
    // $partial asks for a shorter student profile, or null for all of it
    // Public because ExtracurricularController::member() uses it too
    public function sendProfile(array $person, ?string $editorRole, string $message = '', ?string $partial = null): never
    {
        ob_start();
        $this->view('components/_person_profile', $this->profileData($person, $editorRole, $partial) + ['csrfField' => $this->csrfField()]);
        $this->sendJson(['ok' => true, 'message' => $message, 'html' => ob_get_clean()]);
    }
    // Public because the parent's Child profile shows the same, view only
    // With an $editorRole each card gets its edit box
        public function profileData(array $person, ?string $editorRole, ?string $partial = null): array
    {
        $canEdit = $editorRole !== null;
        $role    = $person['role'];
        $values  = PersonDetails::values($person);
        $leave   = $partial === null ? ['cards' => [], 'tabs' => []] : config("people.partial.{$partial}");
        $card    = fn (string $label, ?string $value, bool $wide = false, array $box = []): array =>
            $box + ['label' => $label, 'icon' => null, 'value' => ($value ?? '') !== '' ? $value : '—', 'edit' => null, 'raw' => '', 'wide' => $wide];

        $sections = [];

        foreach (config("people.profile.{$role}") as [$title, $icon, $columns, $content])
        {
            // Drop what a partial profile leaves out
            $kept = is_array($content)
                ? array_values(array_filter($content, fn (array $field): bool => !in_array($field[1], $leave['cards'], true)))
                : (in_array($content, $leave['cards'], true) ? [] : $content);

            if ($kept === [])
            {
                continue;
            }

            $cards = is_array($kept)
                ? array_map(fn (array $field): array => $card(words($field[0]), $values[$field[1]] ?? '', ($field[2] ?? '') === 'wide',
                    $canEdit ? $this->editBox($field[3] ?? '', $person) : []), $kept)
                : $this->listCards($kept, $person, $card, $editorRole);

            $sections[] = ['title' => words($title), 'icon' => $icon, 'columns' => $columns, 'cards' => $cards];
        }

        $status = match ($person['activation_status'])
        {
            'INACTIVE' => ['Deactivated', 'terracotta'],
            'PENDING'  => ['Pending', 'sand'],
            default    => ['Active', 'moss'],
        };

        return [
            'id'       => $person['id'],
            'saveUrl'  => $canEdit ? "/{$editorRole}/people/update" : null,
            'header'   => [
                'role'    => $role,
                'tone'    => config("people.tones.{$role}"),
                'name'    => $person['full_name'],
                'photo'   => $person['photo_url'],
                'eyebrow' => match ($role)
                {
                    'student' => words('{Student} Profile'),
                    'teacher' => words('{Teacher} Profile'),
                    'parent'  => words('{Parent} / Guardian Profile'),
                    default   => word('management') . ' Profile',
                },
                'sub'     => match ($role)
                {
                    'student' => trim($values['grade'] . ($values['class'] ? ' · ' . word('class') . " {$values['class']}" : ''), ' ·'),
                    'teacher' => $values['subjects'] ?? '',
                    'parent'  => $values['relationship'] ?? '',
                    default   => $values['job_title'] ?? '',
                },
                'code'    => $values['code'],
                'status'  => $status,
            ],
            'sections' => $sections,
            'student'  => $role !== 'student' ? null : $this->studentTabs($person['id'], $editorRole, $leave['tabs']),
        ];
    }

    // A tab that is switched off gets null
    // Academic Watch is only included for someone who may lift it, while the student is on watch
    // $leave lists the tabs a partial profile leaves out
    private function studentTabs(int $id, ?string $editorRole, array $leave): array
    {
        $tabs  = array_map(fn (array $tab): string => $tab[0], array_filter(self::PROFILE_TABS, fn (array $tab): bool => $tab[1] === null || feature($tab[1])));
        $tabs  = array_diff_key($tabs, array_flip($leave));
        $books = isset($tabs['academics']) ? RecordBook::forStudent($id) : [];
        $watch = $editorRole !== null && feature('extracurricular') && can('extracurricular.watch') ? AcademicWatch::of($id) : null;

        return [
            'tabs'        => $tabs,
            'watch'       => $watch === null ? null : $watch + ['url' => "/{$editorRole}/extracurricular/watch"],
            'book'        => isset($tabs['academics']) ? RecordBook::shown($books, null) : null,
            'memberships' => isset($tabs['extracurriculars']) ? (new PeopleModel())->memberships($id) : null,
            'timeline'    => isset($tabs['achievements']) ? AchievementTimeline::byYear(AchievementTimeline::forStudent($id, $books)) : null,
            'leaving'     => $this->leaving($id, $editorRole),
            // The "Left Without Notice" button, only while there is no leaving date yet
            'leftUrl'     => $editorRole !== null && can('leaving.start') && ((new LeaveRequestModel())->latest($id)['status'] ?? '') !== 'approved'
                ? "/{$editorRole}/leaving/left" : null,
        ];
    }

    // A student's approved leave, or null
    private function leaving(int $studentId, ?string $editorRole): ?array
    {
        $latest = feature('parent_consent') && can('leaving.see') ? (new LeaveRequestModel())->latest($studentId) : null;

        if (($latest['status'] ?? '') !== 'approved')
        {
            return null;
        }

        return $latest + ['changeUrl' => $editorRole !== null && can('leaving.change') ? "/{$editorRole}/leaving" : null];
    }
//444-542
    // While editing, one more wide card holds the qualification rows or the parent search
    private function listCards(string $list, array $person, callable $card, ?string $editorRole): array
    {
        $cards = [];

        if ($list === 'subjects')
        {
            $subjects = (new PeopleModel())->rowLists('teacher', [$person['id']])[$person['id']]['subjects'] ?? [];

            foreach ($subjects as $subject => $classes)
            {
                $cards[] = $card($subject, implode(', ', $classes));
            }
        }

        if ($list === 'qualifications')
        {
            foreach ($person['qualifications'] as $q)
            {
                $cards[] = $card($q['year_obtained'] !== null ? (string) $q['year_obtained'] : 'Qualification', $q['degree'] . ($q['institution'] ? " — {$q['institution']}" : ''));
            }
        }

        if ($list === 'children')
        {
            foreach ($person['children'] as $child)
            {
                $cards[] = $card(word('class') . ' ' . ($child['class_name'] ?? '—'), $child['full_name']);
            }
        }

        if ($list === 'parents')
        {
            foreach ($person['parents'] as $parent)
            {
                array_push($cards, $card('Name', $parent['full_name']), $card('Email', $parent['identifier']), $card('Mobile Number', $parent['phone']));
            }
        }

        $cards = $cards === [] ? [$card('None', 'Nothing added yet.', true)] : $cards;

        if ($editorRole !== null && $list === 'parents')
        {
            $main    = $person['parents'][0]['id'] ?? null;
            $cards[] = $card(words('Change the Main {Parent}'), '', true, ['edit' => 'parent_id', 'box' => 'parent', 'editOnly' => true,
                'raw' => ['row' => $main === null ? null : (new PeopleModel())->parentRow((int) $main), 'url' => "/{$editorRole}/people/parents"]]);
        }

        if ($editorRole !== null && $list === 'qualifications')
        {
            $cards[] = $card('Edit Qualifications', '', true, ['edit' => 'qualifications', 'box' => 'qualifications', 'editOnly' => true, 'raw' => $person['qualifications']]);
        }

        return $cards;
    }

    // Empty when the card isn't being edited
    // 'raw' is the saved value, or a list of values for a card with two boxes
    private function editBox(string $edit, array $person): array
    {
        if ($edit === '')
        {
            return [];
        }

        $names = explode(',', $edit);
        $ages  = $edit === 'date_of_birth' ? PersonFields::ages($person['role']) : [];

        return [
            'edit'    => $edit,
            'raw'     => count($names) > 1 ? array_map(fn (string $name): string => (string) $person[$name], $names) : (string) $person[$edit],
            'box'     => config('people.fields')[$names[0]][0],
            'options' => PersonFields::options($names[0], $person['class_id'] === null ? null : (int) $person['class_id']),
            'minAge'  => $ages['min'] ?? '',
            'maxAge'  => $ages['max'] ?? '',
        ];
    }

    // Each field's label, for the messages
    private function editable(string $role): array
    {
        $labels = [];

        foreach (config("people.profile.{$role}") as [, , , $content])
        {
            foreach (is_array($content) ? $content : [] as $card)
            {
                $names = array_filter(explode(',', $card[3] ?? ''));

                foreach ($names as $name)
                {
                    $labels[$name] = count($names) > 1 ? ucfirst(str_replace('_', ' ', $name)) : words($card[0]);
                }
            }
        }

        return $labels;
    }

//543-547
// An unknown id, someone who isn't a teacher, or a role without the teachers tab all get the same answer
    private function leavingTeacher(PeopleModel $people, int $id, string $back): array
    {
        $person = $people->find($id);
//552-600

        return $person;
    }

    // One row per duty, and all classes of one subject share a row
    // $teachers holds who may take them
    private function handoverRows(array $duties, array $teachers): array
    {
        $rows = [];

        if ($duties['homeroom'] !== null)
        {
            $rows[] = ['field' => 'homeroom', 'type' => 'homeroom', 'indexes' => [], 'title' => words('{Class} {Teacher}'), 'tag' => $duties['homeroom']['name'],
                'tone' => 'sky', 'options' => TeacherChoices::options($teachers, true)];
        }

        $subjects = [];

        // Grouped by name, so the same subject in two curricula is one row
        // The row's field is named after the first id
        foreach ($duties['subjects'] as $index => $subject)
        {
            $key                          = mb_strtolower($subject['subject']);
            $subjects[$key]['name']       = $subject['subject'];
            $subjects[$key]['field']    ??= "subject_{$subject['subject_id']}";
            $subjects[$key]['classes'][]  = $subject['class_name'];
            $subjects[$key]['indexes'][]  = $index;
        }

        foreach ($subjects as $subject)
        {
            $rows[] = ['field' => $subject['field'], 'type' => 'subjects', 'indexes' => $subject['indexes'], 'title' => words('{Subject} Teaching'),
                'tag' => $subject['name'] . ' · ' . implode(', ', $subject['classes']), 'tone' => 'terracotta',
                'options' => TeacherChoices::options($teachers, false)];
        }

        foreach ($duties['extracurriculars'] as $index => $extracurricular)
        {
            $rows[] = ['field' => "extracurricular_{$extracurricular['id']}", 'type' => 'extracurriculars', 'indexes' => [$index], 'title' => 'Extracurricular Activity',
                'tag' => $extracurricular['name'], 'tone' => 'moss', 'options' => TeacherChoices::options($teachers, false)];
        }

        return $rows;
    }

    protected function guard(string $role): array
    {
        $user = $this->requireRole($role);
//605-632

        return $user;
    }

    protected function tabs(): array
    {
        $tabs = ['student' => plural('student'), 'teacher' => plural('teacher'), 'parent' => plural('parent'), 'management' => word('management') . ' Panel'];

        return can('people.management') ? $tabs : array_diff_key($tabs, ['management' => true]);
    }

    private function listData(string $tab, array $filters): array
    {
        $people  = new PeopleModel();
        $perPage = (int) config('people.per_page');
        $page    = max(1, (int) $this->queryText('page'));
        [$rows, $total] = $people->directory($tab, $filters, $page, $perPage);

        return [
            'rows'    => $rows,
            'lists'   => $people->rowLists($tab, array_column($rows, 'id')),
            'total'   => $total,
            'page'    => $page,
            'pages'   => max(1, (int) ceil($total / $perPage)),
            'filters' => $filters,
        ];
    }
}