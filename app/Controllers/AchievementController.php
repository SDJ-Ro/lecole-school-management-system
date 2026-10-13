<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AchievementModel;
use App\Models\CertificateModel;
use App\Models\MissingRecordModel;
use App\Services\AchievementChecks;
use App\Services\AchievementTimeline;
use App\Services\HonoursBoard;
use App\Services\Notify;
use App\Services\RequestCards;
use Core\Controller;
use Core\Upload;
use Core\Validator;

// Achievements a class teacher records are final, nobody checks them again
// A club's or sport's achievements are recorded on its Extracurricular page
// Automatic achievements come from the marks
// A Missing Record Request goes to the club or sport's teacher in charge, or to the class teacher
// Management may answer any of them
class AchievementController extends Controller
{
    // GET /student/achievements
    public function student(): void
    {
        $user  = $this->requireRole('student');
        $items = AchievementTimeline::forStudent($user['id']);

        $this->page('student/achievements', $user, [
            'metrics'  => AchievementTimeline::metrics($items),
            'timeline' => AchievementTimeline::byYear($items),
        ]);
    }

    // GET /{role}/achievements. The link can name a student and an achievement to edit
    public function staff(string $role): void
    {
        $user     = $this->requireRole($role);
        $waiting  = $this->waitingFor($user);
        $code     = $this->queryText('student');
        $students = $this->cards($user, $waiting, $code === '' ? [] : ['code' => $code]);
        $chosen   = null;
        $editing  = null;
        $requests = [];

        $this->page("{$role}/achievements", $user, [
            'role'     => $role,
            'students' => $students,
            'student'  => $chosen,
            'timeline' => $chosen === null ? [] : AchievementTimeline::byYear(AchievementTimeline::forStudent($chosen['id'])),
            'editing'  => $editing === null ? null : $this->filled($editing),
            'issues'   => array_map(fn (array $request): array => RequestCards::review($request, $role), $requests),
        ]);
    }

    // POST /{role}/achievements/save. Without an id it adds a new one
    // The evidence file is optional
    public function save(string $role): never
    {
        $user    = $this->requireRole($role);
        $student = $this->sentStudent($user, $role);
        $back    = "/{$role}/achievements?student=" . rawurlencode($student['code']);
        $old     = $this->postText('id', 11) === '' ? null : $this->changeable((int) $this->postText('id', 11), $student, $back);

        
        $here   = $old === null ? $back : "{$back}&edit={$old['id']}";   // Where a refusal goes back to
        $values = $this->recordValues($old, $here);
        $clash  = AchievementChecks::problem([$student['id']], $values['title'], $values['achieved_on'], $old['id'] ?? null);

        
        [$file, $problem] = Upload::evidence($_FILES['proof'] ?? []);

        
        if ($file !== null)
        {
            $values += ['evidence_path' => $file, 'evidence_name' => $this->fileName($_FILES['proof']['name'])];
        }

        $this->keepingUploads(fn () => (new AchievementModel())->record($old['id'] ?? null, $student['id'], $values, $user['id']), [$file]);

        if ($file !== null)
        {
            Upload::forget($old['evidence_path'] ?? null);   // Deletes the file it replaced
        }

        $this->log($user, $old === null ? 'ACHIEVEMENT_ADDED' : 'ACHIEVEMENT_UPDATED', "{$values['title']} ({$student['name']}, {$values['achieved_on']})");

        if ($old === null)
        {
            Notify::students([$student['id']], "New achievement: {$values['title']}.", 'achievements');
        }

        $this->setFlash('notice', $old === null ? 'Achievement recorded.' : 'Achievement saved.');
        $this->redirect($back);
    }

    // POST /{role}/achievements/delete. Removes it and its evidence from every student it belongs to
    // The Audit Log keeps a copy of what it was
    public function delete(string $role): never
    {
        $user        = $this->requireRole($role);
        $student     = $this->sentStudent($user, $role);
        $back        = "/{$role}/achievements?student=" . rawurlencode($student['code']);
        $achievement = $this->changeable((int) $this->postText('id', 11), $student, $back);

        array_map([Upload::class, 'forget'], [...(new AchievementModel())->delete($achievement['id']), $achievement['evidence_path']]);

        $this->log($user, 'ACHIEVEMENT_DELETED', "{$achievement['title']} ({$student['name']}, {$achievement['achieved_on']})");
        $this->setFlash('notice', 'Achievement deleted.');
        $this->redirect($back);
    }

    // POST /{role}/achievements/answer. Answers a waiting Missing Record Request
    // Approving it makes an achievement with the request's evidence
    // If two people answer, the first answer wins
    public function answer(string $role): never
    {
        $user    = $this->requireRole($role);
        $request = $this->waitingRequest($user, (int) $this->postText('request', 11));
        $student = $request === null ? null : ($this->cards($user, [], ['id' => $request['student_id']])[$request['student_id']] ?? null);
        $gone    = 'That request is no longer waiting.';

        
        $back     = $this->answeredUrl($role, $student['code']);
        $requests = new MissingRecordModel();

        // A sport's or club's request becomes that programme's achievement
        $values = $this->recordValues(null, $back) + ['evidence_path' => $request['evidence_path'], 'evidence_name' => $request['evidence_name'],
            'extracurricular_id' => $request['extracurricular_id']];
        $clash  = AchievementChecks::problem([$student['id']], $values['title'], $values['achieved_on']);

        
        $this->log($user, 'MISSING_RECORD_APPROVED', "{$values['title']} ({$student['name']}, {$values['achieved_on']})");
        Notify::students([$student['id']], "Your missing record was added: {$values['title']}.", 'achievements');
        $this->setFlash('notice', 'Achievement recorded.');
        $this->redirect($back);
    }

    // GET /{role}/achievements/evidence. Opens the evidence of a request or an achievement
    // Only for a request this person may answer, or an achievement of one of their students
    // Anything else gets the same "does not exist" message
    public function evidence(string $role): never
    {
        $user = $this->requireRole($role);
        $file = null;

        if ($this->queryText('request') !== '')
        {
            $file = $this->waitingRequest($user, (int) $this->queryText('request', 11));
        }
        elseif (can('achievements.record'))
        {
            $achievement = (new AchievementModel())->find((int) $this->queryText('id', 11));
            $shared      = $achievement !== null && array_intersect_key($this->cards($user, []), array_flip(array_column($achievement['students'], 'id'))) !== [];
            $file        = $shared ? $achievement : null;
        }

        $path = Upload::evidenceFile($file['evidence_path'] ?? null) ?? $this->refuse('That file does not exist.', $this->answeredUrl($role), 404);

        Upload::send($path, $file['evidence_name']);
    }

    // POST /student/achievements/missing-record
    public function sendRequest(): never
    {
        $user     = $this->requireRole('student');
        $requests = new MissingRecordModel();
        $back     = '/student/certificates';
        $sent     = [
            'type'    => $this->postText('type', 60),
            'year'    => $this->postText('year', 40),
            'title'   => $this->postText('title', 150),
            'details' => $this->postText('details', 1000),
        ];

        
        $types  = config('achievements.request_types');
        $errors = Validator::check($sent, ['type' => 'required|in:' . implode(',', array_keys($types)), 'year' => 'required', 'title' => 'required',
            'details' => 'required'], ['type' => 'Record type', 'year' => words('Academic Year / {Grade}'), 'title' => 'Title / Role', 'details' => 'Details & Reason']);

            
        // Only a sport or club the student is a member of
        $programme = $types[$sent['type']]['programme'] ? (int) $this->postText('programme', 11) : null;

        
        [$file, $problem] = Upload::evidence($_FILES['evidence'] ?? []);

        
        $this->keepingUploads(fn () => $requests->send($user['id'], [
            'record_type' => $sent['type'], 'extracurricular_id' => $programme, 'school_year' => $sent['year'], 'title' => $sent['title'],
            'details' => $sent['details'], 'evidence_path' => $file, 'evidence_name' => $this->fileName($_FILES['evidence']['name']),
        ]), [$file]);
        $this->setFlash('notice', 'Missing record request sent.');
        $this->redirect($back);
    }

    // Teachers answer from Achievements, management from the Character Certificate page
    private function answeredUrl(string $role, string $code = ''): string
    {
        $page = can('achievements.record') ? "/{$role}/achievements" : "/{$role}/character-certificate";

        return $code === '' ? $page : "{$page}?student=" . rawurlencode($code);
    }

    // Waiting requests for each student, oldest first
    private function waitingFor(array $user): array
    {
        $waiting = [];

        foreach ((new MissingRecordModel())->waiting(can('achievements.answer_any') ? null : $user['id']) as $request)
        {
            $waiting[$request['student_id']][] = $request;
        }

        return $waiting;
    }

    private function waitingRequest(array $user, int $requestId): ?array
    {
        $waiting = (new MissingRecordModel())->waiting(can('achievements.answer_any') ? null : $user['id']);

        return array_values(array_filter($waiting, fn (array $request): bool => (int) $request['id'] === $requestId))[0] ?? null;
    }

    // An empty 'recordUrl' means Record opens the pop-up, for the teacher's own class
    // Otherwise Record links to the programme's "Add achievement" form
    // An empty $only means all of this person's students
    private function cards(array $user, array $waiting, array $only = []): array
    {
        $all      = can('achievements.answer_any');
        $students = (new AchievementModel())->studentsOf($all ? null : $user['id'], $only);
        $cards    = [];

        foreach ($students as $student)
        {
            $cards[$student['id']] = [
                'id'        => (int) $student['id'],
                'name'      => $student['name'],
                'code'      => $student['code'],
                'photo'     => $student['photo'] ?? '',
                'tone'      => card_tone($student['code']),
                'from'      => $all ? '' : ($student['in_class'] ? word('class') : 'Extracurricular'),
                'issue'     => count($waiting[$student['id']] ?? []),
                'recordUrl' => $all || $student['in_class'] ? null : "/{$user['role']}/extracurricular?id={$student['programme']}&award=new",
            ];
        }

        uasort($cards, fn (array $a, array $b): int => ($b['issue'] > 0) <=> ($a['issue'] > 0));   // Anyone with waiting requests comes first, otherwise name order stays

        return $cards;
    }

    private function sentStudent(array $user, string $role): array
    {
        $code = $this->postText('student', 20);

        return array_values(array_filter($this->cards($user, []), fn (array $card): bool => $card['code'] === $code))[0]
            ?? $this->refuse('That ' . strtolower(word('student')) . ' is not in your list.', "/{$role}/achievements", 404);
    }

    // A club or sport achievement gets the same message as one that doesn't exist
    private function changeable(int $achievementId, array $student, string $back): array
    {
        $achievement = (new AchievementModel())->find($achievementId);

        return $achievement;
    }

    // $old is the achievement being changed
    // It keeps its category as long as its type stays the same
    private function recordValues(?array $old, string $back): array
    {
        $sent = [];

        foreach (['type' => 20, 'title' => 150, 'date' => 10, 'issuer' => 150, 'level' => 50, 'result' => 100, 'description' => 600] as $field => $max)
        {
            $sent[$field] = $this->postText($field, $max);
        }

        $groups = config('achievements.groups');
        $errors = Validator::check($sent, ['type' => 'required|in:' . implode(',', array_keys($groups)), 'title' => 'required', 'date' => 'required|date',
            'level' => 'required|in:' . implode(',', country('achievement_levels')), 'description' => 'required'],
            ['type' => 'Achievement type', 'title' => 'Achievement title', 'date' => 'Date it occurred']);


            
        $keepCategory = $old !== null && AchievementTimeline::groupOf($old) === $sent['type'];
        $board        = HonoursBoard::value($old['level'] ?? null, $sent['level'], '');   // Null leaves it as it is

        return [
            'title'       => $sent['title'],
            'category'    => $keepCategory ? $old['category'] : $groups[$sent['type']]['category'],
            'level'       => $sent['level'],
            'result'      => $sent['result'] === '' ? null : $sent['result'],
            'achieved_on' => $sent['date'],
            'issued_by'   => $sent['issuer'] === '' ? null : $sent['issuer'],
            'summary'     => $sent['description'],
        ] + ($board === null ? [] : ['on_honours_board' => $board]);
    }

    private function filled(array $achievement): array
    {
        return [
            'id'          => $achievement['id'],
            'group'       => AchievementTimeline::groupOf($achievement),
            'title'       => $achievement['title'],
            'date'        => $achievement['achieved_on'],
            'issuer'      => $achievement['issued_by'] ?? '',
            'level'       => $achievement['level'],
            'result'      => $achievement['result'] ?? '',
            'description' => $achievement['summary'],
            'file'        => $achievement['evidence_name'],
        ];
    }

    // The uploaded file's name, only for showing on the page
    // Folders are cut off and it is kept to 150 characters
    private function fileName(mixed $name): string
    {
        return mb_substr(basename(is_string($name) ? $name : 'evidence'), 0, 150);
    }
}
