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

    // A club or sport achievement gets the same message as one that doesn't exist
    private function changeable(int $achievementId, array $student, string $back): array
    {
        $achievement = (new AchievementModel())->find($achievementId);

        return $achievement;
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
    }
}
