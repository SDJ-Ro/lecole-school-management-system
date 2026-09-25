<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AchievementModel;
use App\Models\CalendarModel;
use App\Models\CertificateModel;
use App\Models\ClassModel;
use App\Models\NoticeModel;
use App\Models\PeopleModel;

// Fills every dashboard card that has a 'count' key.
final class CountsDashboard
{
    public static function fill(string $role, array $user, array $board): array
    {
        foreach ($board['metrics'] as &$card)
        {
            if (isset($card['count']))
            {
                $card['value'] = number_format(self::count($card['count'], $role, $user));
            }
        }
        unset($card);

        return $board;
    }

    private static function count(string $what, string $role, array $user): int
    {
        $student = $role === 'parent' ? (int) ($user['child'] ?? 0) : (int) $user['id'];
        $people  = fn (string ...$roles): int => array_sum(array_intersect_key((new PeopleModel())->activeCounts(), array_flip($roles)));

        return match ($what)
        {
            'achievements'      => count((new AchievementModel())->ofStudent($student)),
            'upcoming'          => count((new NoticeModel())->unread($user))
                + count((new CalendarModel())->between($user, date('Y-m-d'), date('Y-m-d', strtotime('+7 days')))),
            'subject_classes'   => count(array_unique(array_column((new ClassModel())->subjectsTaughtBy((int) $user['id']), 'class_id'))),
            'assigned_students' => (new ClassModel())->studentsTaughtBy((int) $user['id']),
            'students'          => $people('student'),
            'teachers'          => $people('teacher'),
            'parents'           => $people('parent'),
            'management'        => $people('management'),
            'staff'             => $people('teacher', 'management', 'admin'),
            'waiting'           => (new CertificateModel())->waitingRequests() + count(array_filter(
                (new CertificateModel())->roster((int) config('white_label.academic.grade_numbers.last')), [AccountClosing::class, 'waitingBeforeClosing'])),
        };
    }
}
