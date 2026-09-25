<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\NoticeModel;
use App\Models\NotificationModel;
use App\Services\CalendarFeed;
use App\Services\CountsDashboard;
use App\Services\ExtracurricularDashboard;
use App\Services\MarksDashboard;
use Core\Controller;

class DashboardController extends Controller
{
    // A teacher's View pickers for the chart and the two donuts
    private const PICKERS = ['view', 'overview', 'details'];

    // Pieces whose module is switched off, or that have nothing to show, are left out
    public function show(string $role): void
    {
        $user   = $this->requireRole($role);
        $picked = array_filter(array_combine(self::PICKERS, array_map(fn (string $name): string => $this->queryText($name), self::PICKERS)));
        $board  = config("dashboards.{$role}");
        $board  = CountsDashboard::fill($role, $user, $board);
        $board  = feature('term_marks') ? MarksDashboard::fill($role, $user, $board, $picked) : $board;
        $board  = feature('extracurricular') ? ExtracurricularDashboard::fill($role, $user, $board, $picked) : $board;
        $on     = fn (?array $piece): bool => $piece !== null && feature($piece['feature']);

        $this->page("{$role}/dashboard", $user, [
            'metrics'        => array_values(array_filter($board['metrics'], $on)),
            'chartConfig'    => $on($board['chartConfig']) ? $board['chartConfig'] : null,
            'donuts'         => array_values(array_filter($board['donuts'] ?? [], $on)),
            'calendarConfig' => feature('calendar') ? CalendarFeed::config($user) : null,
            'upcomingEvents' => feature('calendar') ? CalendarFeed::upcoming($user) : null,
            'notifications'  => in_array($role, config('permissions.notifications.see'), true) ? $this->notifications($role, $user) : null,
        ]);
    }

    // Unread notices and notifications together, newest first
    // A parent sees the ones about the child they are viewing
    private function notifications(string $role, array $user): array
    {
        $student = $role === 'parent' ? (int) ($user['child'] ?? 0) : (int) $user['id'];
        $board   = config("notices.board.{$role}.url");
        $items   = array_map(fn (array $notice): array => ['title' => $notice['title'], 'text' => $notice['body'], 'link' => $board, 'at' => $notice['publish_at']],
            feature('notices') ? (new NoticeModel())->unread($user) : []);

        foreach ((new NotificationModel())->unread((int) $user['id'], $student) as $row)
        {
            $items[] = ['title' => $row['text'], 'text' => date(country('date_format'), strtotime($row['created_at'])),
                'link' => "/{$role}/notifications/open?id={$row['id']}", 'at' => $row['created_at']];
        }

        usort($items, fn (array $a, array $b): int => $b['at'] <=> $a['at']);

        return $items;
    }
}
