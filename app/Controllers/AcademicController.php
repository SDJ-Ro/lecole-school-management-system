<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Assignments;
use App\Models\ClassModel;
use App\Models\PeopleModel;
use App\Models\SchoolYear;
use App\Models\StageModel;
use App\Services\CalendarFeed;
use App\Services\RecordBook;
use App\Services\TeacherChoices;
use App\Services\TermDates;
use App\Services\TermResults;
use App\Services\YearEnd;
use Core\Controller;
use Core\Validator;

// Academic Records for students, and the school's grades, classes and subjects for admin and management
// Nothing that has students or marks is ever deleted
class AcademicController extends Controller
{
    // GET /student/academic
    public function student(): void
    {
        $user = $this->requireRole('student');

        $this->page('student/academic', $user, RecordBook::shown(RecordBook::forStudent($user['id']), '/student/academic/print'));
    }

    // GET /student/academic/print and /parent/child-profile/print
    // Only published terms can be printed
    public function recordPrint(string $role): void
    {
        $user      = $this->requireRole($role);
        $studentId = $role === 'parent' ? $user['child'] : $user['id'];
        $back      = $role === 'parent' ? '/parent/child-profile?tab=academics' : '/student/academic';
        $student   = $studentId === null ? null : (new PeopleModel())->find($studentId);
        $books     = $student === null ? [] : RecordBook::forStudent($studentId);
        $year      = (int) $this->queryText('year');
        $term      = (int) $this->queryText('term');
        $record    = $books[$year]['terms'][$term] ?? $this->refuse('That record does not exist.', $back, 404);

        $this->view('print/record_book', [
            'student' => ['name' => $student['full_name'], 'code' => $student['identifier']],
            'book'    => $books[$year],
            'term'    => $term,
            'record'  => $record,
        ]);
    }

    // GET /{role}/academic. Changing the chart's filters reloads the page
    public function overview(string $role): void
    {
        $user     = $this->guard($role);
        $classes  = new ClassModel();
        $model    = new StageModel();
        $stages   = $model->all();
        $marks    = $model->marks();
        $grades   = $classes->grades();
        $teachers = $classes->teachers();

        foreach ($grades as &$grade)
        {
            $grade['stage'] = $this->stageFor($grade['number'], $stages);
        }
        unset($grade);

        // A stage with marks can't be deleted, and its editor warns before a save removes subject teachers
        foreach ($stages as &$stage)
        {
            $stage['marks']    = array_sum(array_intersect_key($marks, $stage['subjects'] + $stage['retired']));
            $stage['assigned'] = $model->assignments($stage['id']);
        }
        unset($stage);

        $numbers = config('white_label.academic.grade_numbers');

        $this->page("{$role}/academic", $user, [
            'pageUrl'             => $this->pageUrl($role),
            'chartConfig'         => $this->chart($grades),
            'calendarConfig'      => feature('calendar') ? CalendarFeed::config($user) : null,
            'grades'              => $grades,
            'stages'              => $stages,
            'teachers'            => $teachers,
            'teacherOptions'      => TeacherChoices::options($teachers, false),
            'classTeacherOptions' => TeacherChoices::options($teachers, true),
            'freeGradeNumbers'    => array_values(array_diff(range($numbers['first'], $numbers['last']), array_column($grades, 'number'))),
            'workloads'           => $classes->workloads(),
            'subjectTeachers'     => $classes->subjectTeachers(),
            'classForm'           => $this->getFlash('class_form'),   // What was typed before a refused save
            'stageForm'           => $this->getFlash('stage_form'),
            'schoolYear'          => $this->schoolYear($this->getFlash('terms_form')),
        ]);
    }

    // POST /{role}/academic/stages/save. Without an id it adds a new stage
    public function saveStage(string $role): never
    {
        $user    = $this->guard($role);
        $model   = new StageModel();
        $id      = (int) $this->postText('id') ?: null;
        $stage   = $id === null ? null : ($model->find($id) ?? $this->refuse('That stage no longer exists.', $this->pageUrl($role), 404));
        $numbers = config('white_label.academic.grade_numbers');
        $data    = [
            'first_grade' => $this->postText('first_grade', 3),
            'last_grade'  => $this->postText('last_grade', 3),
            'description' => $this->postText('description', 255),
        ];
        $names    = $this->postList('subjects');
        $ids      = $this->postList('subject_ids');   // One id per name, in the same order. An empty id is a new subject
        $back     = $this->pageUrl($role) . '#curriculum';


        $subjects = $this->matchSubjects($names, $ids, $stage['subjects'] ?? []);
        $refuse   = function (string $message) use ($data, $subjects, $id, $model, $back): never
        {
            // Reopens the editor
            $this->setFlash('stage_form', $data + ['id' => $id, 'subjects' => $subjects, 'assigned' => $id === null ? [] : $model->assignments($id)]);
            $this->refuse($message, $back, 422);
        };
        $range    = "required|between:{$numbers['first']},{$numbers['last']}";
        $errors   = Validator::check($data, ['first_grade' => $range, 'last_grade' => $range, 'description' => 'max:255'], [
            'first_grade' => 'From ' . strtolower(word('grade')), 'last_grade' => 'To ' . strtolower(word('grade')),
        ]);

        if ($errors !== [])
        {
            $refuse(reset($errors));
        }

        [$first, $last] = [(int) $data['first_grade'], (int) $data['last_grade']];

        if ($first > $last)
        {
            $refuse('"To" must be the same as or after "From".');
        }

        if (($other = $model->overlapping($first, $last, $id)) !== null)
        {
            $refuse("These overlap with {$other}. Each " . strtolower(word('grade')) . ' can be in only one stage.');
        }

        if ($model->gradesIn($first, $last) === 0)
        {
            $refuse('Add a ' . strtolower(word('grade')) . ' in ' . grade_range($first, $last) . ' first.');
        }

        if ($subjects === [])
        {
            $refuse(words('Add at least one {subject}.'));
        }

        foreach ($subjects as $subject)
        {
            if (mb_strlen($subject['name']) > 100)
            {
                $refuse("\"{$subject['name']}\" is too long (100 characters at most).");
            }
        }

        // A subject with marks keeps its old name on old reports
        // If it is renamed, a new subject takes over this year's teachers and the old one is retired
        // If it is taken out, it is retired
        $marks = $model->marks();

        foreach ($subjects as &$subject)
        {
            $oldName = $stage['subjects'][$subject['id']] ?? null;

            if ($oldName !== null && mb_strtolower($oldName) !== mb_strtolower($subject['name']) && isset($marks[$subject['id']]))   // Changing only capital letters keeps the same subject
            {
                $subject = ['id' => null, 'name' => $subject['name'], 'replaces' => $subject['id']];
            }
        }
        unset($subject);

        [$id, $removed] = $model->save($id, ['first_grade' => $first, 'last_grade' => $last, 'description' => $data['description'] ?: null], $subjects);
        $title = grade_range($first, $last);
        $this->log($user, $stage === null ? 'STAGE_ADDED' : 'STAGE_UPDATED', "{$title}: " . implode(', ', array_column($subjects, 'name')));
        $this->done("{$title} curriculum saved." . ($removed > 0 ? " {$removed} " . words('{subject} ') . strtolower($removed === 1 ? word('teacher') : plural('teacher')) . ' removed.' : ''), $back);
    }

    // POST /{role}/academic/stages/delete. Refused while its subjects have marks
    public function deleteStage(string $role): never
    {
        $user  = $this->guard($role);
        $model = new StageModel();
        $back  = $this->pageUrl($role) . '#curriculum';
        $stage = $model->find((int) $this->postText('id')) ?? $this->refuse('That stage no longer exists.', $back, 404);
        $title = grade_range($stage['first_grade'], $stage['last_grade']);


        $model->delete($stage['id']);
        $this->log($user, 'STAGE_DELETED', $title);
        $this->done("{$title} curriculum deleted.", $back);
    }

    // POST /{role}/academic/terms/save. Saves this year's and next year's term dates
    // A locked date keeps its saved value, whatever is sent
    // Next year is not saved while all its boxes are empty
    // When next year's Term 1 starts, it becomes the current year by itself
    
    private function guard(string $role): array
    {
        $user = $this->requireRole($role);


        return $user;
    }

    private function pageUrl(string $role): string
    {
        return "/{$role}/academic";
    }

    // This year and next year
    // 'suggested' means next year isn't saved yet, so the usual dates are shown
    // 'usual' means the usual dates were filled in at year-end and still need checking
    // 'box' is what the pop-up shows, including what was typed before a refusal
    private function schoolYear(?array $typed): array
    {
        $years   = new SchoolYear();
        $current = $years->current();
        $today   = date('Y-m-d');
        $list    = [];

        foreach ([$current, $current + 1] as $year)
        {
            $saved     = $years->terms($year);
            $suggested = $saved === [] && $year > $current;
            $shown     = $suggested ? YearEnd::usualTerms($year) : $saved;
            $locks     = TermDates::locks($saved, $years->publishedTerms($year), $today);
            $terms     = [];

            foreach (range(1, (int) config('white_label.academic.terms_per_year')) as $number)
            {
                $dates          = $shown[$number] ?? ['starts_on' => '', 'ends_on' => ''];
                $terms[$number] = [
                    'starts_on' => $dates['starts_on'],
                    'ends_on'   => $dates['ends_on'],
                    'state'     => match (true)
                    {
                        $dates['starts_on'] === ''    => null,
                        $suggested                    => 'Usual',
                        $dates['ends_on'] < $today    => 'Finished',
                        $dates['starts_on'] <= $today => 'Now',
                        default                       => 'Coming',
                    },
                    'lock'      => $locks[$number] ?? ['start' => false, 'end' => false],
                    'box'       => $typed[$year][$number] ?? ['starts_on' => $dates['starts_on'], 'ends_on' => $dates['ends_on']],
                ];
            }

            $list[$year] = ['label' => $year === $current ? 'Current' : 'Next', 'set' => $shown !== [], 'suggested' => $suggested,
                            'terms' => $terms, 'usual' => $years->datesFromUsual($year)];
        }

        return ['years' => $list, 'past' => $this->pastYears($years->termsBefore($current)), 'reopen' => $typed !== null];
    }

    // A grade may be without a stage for a while
    private function stageFor(int $gradeNumber, array $stages): ?array
    {
        foreach ($stages as $stage)
        {
            if ($gradeNumber >= $stage['first_grade'] && $gradeNumber <= $stage['last_grade'])
            {
                return $stage;
            }
        }

        return null;
    }

    // Chart data for one grade's classes, one subject and one term of this year
    // Returns null when there is no chart to show
    private function chart(array $grades): ?array
    {
        if (!feature('term_marks'))
        {
            return null;
        }

        $withClasses = array_values(array_filter($grades, fn (array $grade): bool => $grade['classes'] !== []));

        if ($withClasses === [])
        {
            return null;
        }

        $years    = new SchoolYear();
        $terms    = $years->startedTerms() ?: [1];
        $byId     = array_column($withClasses, null, 'id');
        $grade    = $byId[(int) $this->queryText('grade')] ?? $withClasses[0];
        $subjects = array_values($grade['stage']['subjects'] ?? []);
        $subject  = in_array($this->queryText('subject'), $subjects, true) ? $this->queryText('subject') : ($subjects[0] ?? '');
        $term     = in_array((int) $this->queryText('term'), $terms, true) ? (int) $this->queryText('term') : end($terms);
        $results  = TermResults::forGrade($years->current(), $term, $grade['number'])['classes'];
        $rows     = [];

        // Shows 0 until the term is published
        foreach ($grade['classes'] as $class)
        {
            $rows[] = ['label' => $class['name'], 'average' => $results[$class['id']]['average'][$subject] ?? 0, 'best' => $results[$class['id']]['highest'][$subject] ?? 0];
        }

        return [
            'variant'    => 'counts',
            'id'         => 'j-academic-chart',
            'title'      => words('{Class} Section Performance'),
            'yAxisTitle' => 'Score',
            'xAxisTitle' => words('{Class} Section'),
            'ticks'      => [0, 20, 40, 60, 80, 100],
            'series'     => [
                ['key' => 'average', 'label' => words('{Class} Average'), 'color' => 'skyblue'],
                ['key' => 'best', 'label' => 'Highest Mark', 'color' => 'maroon'],
            ],
            'data'       => $rows,
            'filters'    => [
                ['name' => 'grade', 'label' => word('grade'), 'value' => (string) $grade['id'],
                 'options' => array_map(fn (array $g): array => ['value' => (string) $g['id'], 'label' => grade_name($g['number'])], $withClasses)],
                ['name' => 'subject', 'label' => word('subject'), 'value' => $subject, 'options' => $subjects],
                ['name' => 'term', 'label' => word('term'), 'value' => (string) $term,
                 'options' => array_map(fn (int $t): array => ['value' => (string) $t, 'label' => word('term') . " {$t}"], $terms)],
            ],
        ];
    }
}
