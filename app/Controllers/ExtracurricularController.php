<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AchievementModel;
use App\Models\Assignments;
use App\Models\ClassModel;
use App\Models\ExtracurricularModel;
use App\Models\PeopleModel;
use App\Models\TeamModel;
use App\Services\AcademicWatch;
use App\Services\AchievementChecks;
use App\Services\CalendarFeed;
use App\Services\Extracurriculars;
use App\Services\HonoursBoard;
use App\Services\JoinRules;
use App\Services\Notify;
use App\Services\TeacherChoices;
use Core\Controller;
use Core\Upload;
use Core\Validator;

// Clubs and sports
// Management and admin can edit every programme, but a new one from management waits for the admin's approval
// Only the admin archives and restores programmes
// A teacher in charge edits their own programme's description, cover, session details, teams and achievements
// ChildProfileController reuses the list and programme pages
class ExtracurricularController extends Controller
{
    // GET /{role}/extracurricular
    // Shows the list, or one programme when the link has an id
    public function index(string $role): void
    {
        $user     = $this->requireRole($role);
        $listPath = "/{$role}/extracurricular";
        $id       = (int) $this->queryText('id');

        if ($role === 'teacher')
        {
            $runs = (new ExtracurricularModel())->runBy($user['id']);
            $id   = in_array($id, array_column($runs, 'id'), true) ? $id : (count($runs) === 1 ? $runs[0]['id'] : 0);

            if ($id === 0)
            {
                $this->page("{$role}/extracurricular", $user, ['runs' => $runs] + $this->listPage($user, $role, $listPath, []));
                return;
            }
        }

        $data = $id !== 0 ? $this->programmePage($user, $role, $id, $listPath, []) : $this->listPage($user, $role, $listPath, []);
        $this->page("{$role}/extracurricular", $user, $data);
    }

    // GET /{role}/extracurricular/member, answers with JSON
    // Shows one member's view of the programme
    // An unknown student and one who isn't a member get the same answer
    public function member(string $role): never
    {
        $user   = $this->requireRole($role);
        $model  = new ExtracurricularModel();
        $row    = $model->find((int) $this->queryText('id', 11));
        $person = (new PeopleModel())->find((int) $this->queryText('student', 11));
        $theirs = $row !== null && $row['archived_at'] === null && $this->looksAfter($row, $user);

        (new PeopleController())->sendProfile($person, null, '', 'club');
    }

    // Those who manage programmes also see the ones waiting for approval
    protected function listPage(array $user, string $role, string $listPath, array $listKeep): array
    {
        $types   = array_keys(config('extracurricular.types'));
        $wanted  = $this->queryText('type');
        $filters = [
            'q'    => $this->queryText('q'),
            'type' => in_array($wanted, $types, true) || ($wanted === 'archived' && can('extracurricular.approve')) ? $wanted : '',
        ];
        $archived = $filters['type'] === 'archived';
        $model    = new ExtracurricularModel();
        $rows     = $model->all(can('extracurricular.manage') || $role === 'teacher', $archived);

        if ($role === 'teacher')
        {
            $theirs = array_column($model->runBy($user['id']), 'id');
            $rows   = array_values(array_filter($rows, fn (array $row): bool => in_array($row['id'], $theirs, true)));
        }

        return [
            'programme'  => null,
            'can'        => $this->listRights(),
            'filters'    => $filters,
            'programmes' => Extracurriculars::cards($rows, $this->studentRow($user, $role), ['q' => $filters['q'], 'type' => $archived ? '' : $filters['type']]),
            'emptyText'  => match (true)
            {
                $role === 'teacher' && $rows === [] => 'You are not in charge of any programme this year.',
                $archived                           => 'No archived programmes.',
                default                             => 'No activities match your search or filters.',
            },
            'teachers'   => $this->teacherOptions(),
            'listPath'   => $listPath,
            'listKeep'   => $listKeep,   // Link values the list keeps when it reloads
            'runs'       => null,
        ];
    }

    // A student, or a parent through their child, sees only approved programmes that are open
    // A teacher sees the ones they run
    protected function programmePage(array $user, string $role, int $id, string $listPath, array $listKeep): array
    {
        $listUrl = url_with($listPath, $listKeep);
        $row     = (new ExtracurricularModel())->find($id);
        $visible = $row !== null && match ($role)
        {
            'student' => $row['review'] === 'approved' && $row['archived_at'] === null,
            'teacher' => $this->runs($row, $user) && $row['archived_at'] === null,
            default   => can('extracurricular.manage'),
        };

        $studentId = $this->studentSeen($user, $role);
        $current   = $studentId === null ? null : ((new ExtracurricularModel())->statesOf($studentId)[$id] ?? null);
        $member    = $role !== 'student' || ($current['status'] ?? null) === 'member';   // Members see the coach's contact and the roster
        $programme = Extracurriculars::page($row, $current, $member, $studentId, $this->queryText('age'), $user);
        $archived  = $row['archived_at'] !== null;

        $can = [
            'edit'        => !$archived && $this->looksAfter($row, $user),
            'editAll'     => !$archived && can('extracurricular.manage'),        // Name, type, category, who can join and staff
            'editStaff'   => !$archived && can('extracurricular.manage'),        // The teacher in charge and the coach
            'archive'     => can('extracurricular.approve') && $row['review'] === 'approved',
            'deleteAward' => !$archived && $this->mayDeleteAwards($row, $user),
        ];

        $programmeUrl = url_with($listPath, $listKeep + ['id' => $id]);
        $awardUrl     = $programmeUrl . '&award=';
        $wanted       = $this->queryText('award', 11);
        $award        = Extracurriculars::award($programme, $wanted, $can['edit']);

        return [
            'programme'      => $programme,
            'award'          => $award,
            'editing'        => $award !== null && ($award['id'] === 'new' || $this->queryText('edit') === '1') && $can['edit'],
            'honours'        => HonoursBoard::mayPick(),
            'can'            => $can,
            'teachers'       => $this->teacherOptions(),
            'gradeOptions'   => array_map(fn (array $grade): array => ['value' => (string) $grade['number'], 'label' => grade_name($grade['number'])],
                (new ClassModel())->grades()),
            'listUrl'        => $role === 'teacher' && count((new ExtracurricularModel())->runBy($user['id'])) < 2 ? null : $listUrl,
            'listPath'       => $listPath,
            'listKeep'       => $listKeep,
            'programmeUrl'   => $programmeUrl,
            'awardUrl'       => $awardUrl,
            'calendarConfig' => feature('calendar') ? CalendarFeed::config($user, "extracurricular:{$id}") : null,
        ];
    }

    // Members, teams and achievements
    private function looksAfter(array $row, array $user): bool
    {
        return can('extracurricular.manage') || $this->runs($row, $user);
    }
    }
}
