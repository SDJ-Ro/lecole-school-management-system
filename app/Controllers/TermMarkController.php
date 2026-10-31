<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\SchoolYear;
use App\Models\TermMarkModel;
use App\Services\Notify;
use Core\Controller;

// A class teacher's Term Marks
// Marks can only be typed for this year's terms that have started, and earlier years are read only
// A change after publishing is allowed, and it goes in the Audit Log
class TermMarkController extends Controller
{
    // GET /teacher/marks. Opens the newest term that has started unless the link picks one
    public function index(): void
    {
        $user = $this->requireRole('teacher');
        $work = $this->workspace($user, (int) $this->queryText('term'));

        if (is_string($work))
        {
            $this->page('teacher/term_marks', $user, ['emptyText' => $work]);

            return;
        }

        $students = [];

        foreach ($work['sheet'] as $student)
        {
            $students[] = [
                'id'       => $student['id'],
                'name'     => $student['name'],
                'code'     => $student['code'],
                'photo'    => $student['photo'] ?? '',
                'tone'     => card_tone($student['code']),
                'class'    => $work['class']['name'],
                'marks'    => array_map(fn (?int $mark): string => (string) ($mark ?? 'AB'), $student['marks']),
                'feedback' => $student['comment'],
            ];
        }

        $this->page('teacher/term_marks', $user, [
            'emptyText' => null,
            'class'     => $work['class'],
            'students'  => $students,
            'subjects'  => $work['subjects'],
            'terms'     => $work['terms'],
            'term'      => $work['term'],
            'published' => $work['publication'] === null ? null : date(country('date_format'), strtotime($work['publication']['published_at'])),
            'complete'  => $work['complete'],
            'needed'    => count($work['needed']),
        ]);
    }

    // POST /teacher/marks/save, answers with JSON
    // Each mark is a number from 0 to 100, AB for absent, or empty
    public function save(): never
    {
        $user = $this->requireRole('teacher');
        $work = $this->workspace($user, (int) $this->postText('term', 2), true);
        $id   = (int) $this->postText('student_id', 11);


        $marks = [];

        foreach ($work['subjects'] as $subjectId => $subject)
        {
            $typed = strtoupper($this->postText("mark_{$subjectId}", 3));

            $marks[$subjectId] = match ($typed)
            {
                ''      => '',
                'AB'    => null,
                default => (int) $typed,
            };
        }

        $student = $work['sheet'][$id];
        $changes = (new TermMarkModel())->save($id, $work['year'], $work['term'], $marks, $this->postText('feedback', 500), $user['id']);

        if ($work['publication'] !== null)
        {
            foreach ($changes as $subjectId => [$before, $after])
            {
                $this->log($user, 'MARK_CHANGED', "{$work['class']['name']} · {$student['name']} · {$work['subjects'][$subjectId]} "
                    . mb_substr(word('term'), 0, 1) . "{$work['term']}: " . ($before === '' ? '—' : $before) . ' → ' . ($after === '' ? '—' : $after));
            }

            if ($changes !== [])
            {
                Notify::students([$id], 'A published ' . strtolower(word('term')) . " {$work['term']} mark was corrected.", 'marks');
            }
        }

        $this->sendJson(['ok' => true, 'message' => 'Marks saved.', 'complete' => $this->workspace($user, $work['term'], true)['complete']]);
    }

    // 'needed' holds the students who were in the class before the term started
    // When there is nothing to work on it returns the reason as text, and a POST is refused with it
    private function workspace(array $user, int $term, bool $posting = false): array|string
    {
        $model  = new TermMarkModel();
        $years  = new SchoolYear();
        $class  = $model->classOf($user['id']);
        $terms  = $years->startedTerms();
        $reason = match (true)
        {
            $class === null => words('You are not a {class} {teacher} this year, so there are no marks to enter.'),
            $terms === []   => words('No {term} has started yet this year.'),
            default         => null,
        };



        $term     = in_array($term, $terms, true) ? $term : end($terms);
        $year     = $years->current();
        $starts   = $years->terms($year)[$term]['starts_on'];
        $subjects = $model->subjectsFor($class['grade_number']);
        $sheet    = $model->sheet($class['id'], $year, $term);
        $needed   = array_filter($sheet, fn (array $student): bool => $student['admission_date'] <= $starts);
        $missing  = array_filter($needed, fn (array $student): bool => $student['comment'] === '' || array_diff_key($subjects, $student['marks']) !== []);

        return [
            'class'       => $class,
            'year'        => $year,
            'terms'       => $terms,
            'term'        => $term,
            'subjects'    => $subjects,
            'sheet'       => $sheet,
            'publication' => $model->publication($class['id'], $year, $term),
            'needed'      => $needed,
            'missing'     => $missing,
            'complete'    => count($needed) - count($missing),
        ];
    }
}
