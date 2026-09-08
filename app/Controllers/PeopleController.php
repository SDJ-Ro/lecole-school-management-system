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

    