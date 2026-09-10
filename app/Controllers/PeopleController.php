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
//172-175

        $this->sendProfile($person, null, '', $people->isClassTeacherOf($user['id'], $person['id']) ? null : 'subject_teacher');
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
//328-337
// With no $editorRole the profile is view only
    // $partial asks for a shorter student profile, or null for all of it
    // Public because ExtracurricularController::member() uses it too
    public function sendProfile(array $person, ?string $editorRole, string $message = '', ?string $partial = null): never
    {
        ob_start();
        $this->view('components/_person_profile', $this->profileData($person, $editorRole, $partial) + ['csrfField' => $this->csrfField()]);
        $this->sendJson(['ok' => true, 'message' => $message, 'html' => ob_get_clean()]);
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