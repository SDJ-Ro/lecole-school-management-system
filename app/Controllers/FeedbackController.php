<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\FeedbackModel;
use App\Models\SchoolYear;
use App\Models\TermMarkModel;
use App\Services\Notify;
use Core\Controller;
use Core\Validator;

// Feedback from a class teacher to a student in their class this year, the student's parent, or both
// Nobody replies to it
class FeedbackController extends Controller
{
    // GET /teacher/feedback
    public function teacher(): void
    {
        $user  = $this->requireRole('teacher');
        $model = new FeedbackModel();
        $cards = array_map(fn (array $row): array => $this->card($row) + ['to' => $this->sentTo($row), 'readUrl' => null, 'mine' => true],
            $model->sentBy($user['id']));

        // With no students, the New Feedback button is hidden
        $students = array_map(fn (array $student): array => [
            'value' => (string) $student['id'],
            'label' => "{$student['name']} ({$student['code']}) - {$student['class_name']}",
        ], can('feedback.write') ? $model->students($user['id']) : []);

        $this->page('teacher/feedback', $user, $this->board($cards) + [
            'students'  => $students,
            'subjects'  => $this->subjects($user['id']),
            'audiences' => config('feedback.audiences'),
        ]);
    }

    // GET /parent/feedback. Only for the child being viewed
    public function parent(): void
    {
        $user  = $this->requireRole('parent');
        $rows  = $user['child'] === null ? [] : (new FeedbackModel())->forParent($user['child']);
        $cards = array_map(fn (array $row): array => $this->card($row) + [
            'to'      => '',
            'readUrl' => $row['parent_read_at'] === null ? '/parent/feedback/read' : null,
            'mine'    => false,
        ], $rows);

        $this->page('parent/feedback', $user, $this->board($cards, true));
    }

    // GET /student/feedback
    public function student(): void
    {
        $user  = $this->requireRole('student');
        $cards = array_map(fn (array $row): array => $this->card($row) + [
            'to'      => '',
            'readUrl' => $row['student_read_at'] === null ? '/student/feedback/read' : null,
            'mine'    => false,
        ], (new FeedbackModel())->forStudent($user['id']));

        $this->page('student/feedback', $user, $this->board($cards, true));
    }

    // POST /teacher/feedback/save
    public function save(): never
    {
        $user    = $this->requireRole('teacher');
        $back    = '/teacher/feedback';
        $lengths = config('feedback.lengths');

        
        // Text longer than allowed is read in full, so it is refused with a message instead of being cut off
        $sent = [
            'student'  => $this->postText('student', 11),
            'audience' => $this->postText('audience', 10),
            'type'     => $this->postText('type', 20),
            'subject'  => $this->postText('subject', $lengths['subject']),
            'title'    => $this->postText('title', $lengths['title'] + 1),
            'content'  => $this->postText('content', $lengths['message'] + 1),
        ];

        $errors = Validator::check($sent, [
            'student'  => 'required',
            'audience' => 'required|in:' . implode(',', array_keys(config('feedback.audiences'))),
            'type'     => 'required|in:' . implode(',', array_keys(config('feedback.types'))),
            'subject'  => 'required',
            'title'    => "required|max:{$lengths['title']}",
            'content'  => "required|max:{$lengths['message']}",
        ], ['student' => word('student'), 'type' => 'Feedback category', 'title' => 'Feedback title / topic', 'content' => 'Feedback content']);

        
        // Only students in their own class this year
        // An unknown id and someone else's student get the same answer
        $model    = new FeedbackModel();
        $students = array_column($model->students($user['id']), 'name', 'id');
        $student  = (int) $sent['student'];

        
        $model->add([
            'student_id'  => $student,
            'school_year' => (new SchoolYear())->current(),
            'teacher_id'  => $user['id'],
            'kind'        => $sent['type'],
            'audience'    => $sent['audience'],
            'subject'     => $sent['subject'],
            'title'       => $sent['title'],
            'message'     => $sent['content'],
        ]);

        $this->log($user, 'FEEDBACK_SENT', "{$sent['title']} ({$students[$student]}, {$sent['type']}, for: {$sent['audience']})");
        // Notify exactly who can read it
        match ($sent['audience'])
        {
            'student' => Notify::studentsOnly([$student], "New feedback: {$sent['title']}.", 'feedback'),
            'parent'  => Notify::parents([$student], "New feedback: {$sent['title']}.", 'feedback'),
            default   => Notify::students([$student], "New feedback: {$sent['title']}.", 'feedback'),
        };
        $this->setFlash('notice', "Feedback sent to {$students[$student]}.");
        $this->redirect($back);
    }

    // POST /teacher/feedback/delete. Teachers can only delete their own
    // Someone else's and an unknown id get the same answer
    // The Audit Log keeps a copy of what it was
    public function delete(): never
    {
        $user     = $this->requireRole('teacher');
        $back     = '/teacher/feedback';
        $model    = new FeedbackModel();
        $feedback = can('feedback.write') ? $model->writtenBy((int) $this->postText('id', 11), $user['id']) : null;

        
        $model->delete($feedback['id']);

        $this->log($user, 'FEEDBACK_DELETED', "{$feedback['title']} ({$feedback['student_name']}): {$feedback['message']}");
        $this->setFlash('notice', 'Feedback deleted.');
        $this->redirect($back);
    }

    // POST /{role}/feedback/read, answers with JSON
    // Feedback this person may not read and an unknown id get the same answer
    public function read(string $role): never
    {
        $user       = $this->requireRole($role);
        $model      = new FeedbackModel();
        $studentIds = $role === 'parent' ? array_keys($this->children($user)) : [$user['id']];
        $feedback   = can('feedback.read') ? $model->find((int) $this->postText('id', 11), $role, $studentIds) : null;

        $model->markRead($feedback['id'], $role);
        $this->sendJson(['ok' => true, 'message' => '']);
    }

    // Each page adds its own 'to', 'readUrl' and 'mine' values
    private function card(array $row): array
    {
        return [
            'id'      => (int) $row['id'],
            'type'    => $row['kind'],
            'title'   => $row['title'],
            'subject' => $row['subject'],
            'teacher' => $row['teacher_name'],
            'student' => $row['student_name'],
            'date'    => substr($row['created_at'], 0, 10),
            'year'    => (int) $row['school_year'],
            'text'    => $row['message'],
        ];
    }

    // Who it went to, and whether each reader has read it
    private function sentTo(array $row): string
    {
        $read  = fn (?string $at): string => $at === null ? 'Unread' : 'Read';
        $parts = [$row['student_name']];

        if ($row['audience'] !== 'parent')
        {
            $parts[] = word('student') . ': ' . $read($row['student_read_at']);
        }

        if ($row['audience'] !== 'student')
        {
            $parts[] = word('parent') . ': ' . $read($row['parent_read_at']);
        }

        return 'To ' . implode(' · ', $parts);
    }

    // The class's current subjects, then the general one
    private function subjects(int $teacherId): array
    {
        $marks = new TermMarkModel();
        $class = $marks->classOf($teacherId);

        return [...($class === null ? [] : array_values($marks->subjectsFor((int) $class['grade_number']))), config('feedback.general')];
    }

    // Unknown filter values are dropped
    // $byYear also filters by school year, with this year first
    private function board(array $feedback, bool $byYear = false): array
    {
        $types   = config('feedback.types');
        $current = (new SchoolYear())->current();
        $years   = array_values(array_unique([$current, ...array_column($feedback, 'year')]));
        rsort($years);
        $filters = [
            'q'    => $this->queryText('q'),
            'type' => array_key_exists($this->queryText('type'), $types) ? $this->queryText('type') : '',
            'year' => in_array((int) $this->queryText('year'), $years, true) ? (int) $this->queryText('year') : $current,
        ];
        $search  = mb_strtolower($filters['q']);

        $cards = array_filter($feedback, fn (array $card): bool =>
            (!$byYear || $card['year'] === $filters['year'])
            && ($filters['type'] === '' || $card['type'] === $filters['type'])
            && ($search === '' || str_contains(mb_strtolower("{$card['title']} {$card['subject']} {$card['teacher']} {$card['student']} {$card['text']}"), $search)));

        return ['filters' => $filters, 'types' => $types, 'years' => $byYear ? $years : null, 'feedback' => array_values($cards)];
    }
}
