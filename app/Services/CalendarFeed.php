<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CalendarModel;

// The calendar gets its events in the same shape on page load and after every save or delete
class CalendarFeed
{
    // A teacher with no class, club or sport of their own gets no "Add Event" pop-up.
    // $only limits the events to one group, for example 'extracurricular:3'.
    public static function config(array $user, string $only = ''): array
    {
        $choices = can('calendar.create') ? (new CalendarModel())->choicesFor($user) : null;
        $anyGroup = can('posts.any_group');
        $canAdd   = $choices !== null && ($anyGroup || $choices['classes'] !== [] || $choices['extracurriculars'] !== []);

        return [
            'role'      => $user['role'],
            'anyGroup'  => $anyGroup,   // May post to any grade or class, not only their own
            'events'    => self::around($user, $only),
            'only'      => $only,
            'firstYear' => self::firstYear(),
            'lastYear'  => self::lastYear(),
            'canAdd'    => $canAdd,
            'choices'   => $canAdd ? $choices : null,
        ];
    }

    public static function around(array $user, string $only = ''): array
    {
        $events = (new CalendarModel())->between($user, self::firstYear() . '-01-01', self::lastYear() . '-12-31');

        if ($only !== '')
        {
            $events = array_filter($events, fn (array $event): bool => in_array($only, explode(',', $event['scopes'] ?? ''), true));
        }

        return array_map([self::class, 'shape'], array_values($events));
    }

    public static function upcoming(array $user): array
    {
        $events = (new CalendarModel())->between($user, date('Y-m-d'), self::lastYear() . '-12-31');

        return array_map(fn (array $event): array => [
            'date'     => $event['event_date'],
            'day'      => date('j', strtotime($event['event_date'])),
            'month'    => date('M', strtotime($event['event_date'])),            // The CSS shows it in capitals
            'name'     => $event['title'],
            'tag'      => $event['category'],
            'tagColor' => config("calendar.tag_colors.{$event['category']}", 'sand'),
        ], array_slice($events, 0, config('calendar.upcoming_count')));
    }

    public static function firstYear(): int
    {
        return (int) date('Y') - config('calendar.years_back');
    }

    public static function lastYear(): int
    {
        return (int) date('Y') + config('calendar.years_ahead');
    }

    private static function shape(array $event): array
    {
        $audience = explode(',', $event['audience']);
        sort($audience);   // Sorted so audienceLabel() can compare whole lists
        $canDelete = can_manage($event);
        $canEdit   = $canDelete && $event['event_date'] >= date('Y-m-d');   // Past events can only be deleted

        return [
            'id'            => (int) $event['id'],
            'date'          => $event['event_date'],
            'time'          => event_time($event),
            'title'         => $event['title'],
            'details'       => $event['details'] ?? '',
            'category'      => $event['category'],
            'audienceLabel' => self::audienceLabel($audience),
            'authorLabel'   => 'Posted by ' . ($event['author_name'] ?? 'Former staff'),
            'canEdit'       => $canEdit,
            'canDelete'     => $canDelete,
        ] + ($canEdit ? self::forEditing($event, $audience) : []);
    }

    private static function forEditing(array $event, array $audience): array
    {
        $scopes = array_map(function (string $scope): array
        {
            [$type, $id] = explode(':', $scope, 2);
            return ['type' => $type, 'id' => $id];
        }, explode(',', $event['scopes'] ?? 'school:'));

        return [
            'start'    => $event['start_time'] ? substr($event['start_time'], 0, 5) : '',   // Empty means all day
            'end'      => $event['end_time'] ? substr($event['end_time'], 0, 5) : '',
            'scopes'   => $scopes,
            'audience' => $audience === self::everyone() ? ['all'] : $audience,
        ];
    }

    private static function audienceLabel(array $audience): string
    {
        return match ($audience)
        {
            self::everyone()                       => 'All ' . word('institution'),
            ['parent', 'student']                  => plural('student') . ' & ' . plural('parent'),
            ['management', 'teacher'], ['teacher'] => 'Staff Only',
            ['student']                            => plural('student') . ' Only',
            ['parent']                             => plural('parent') . ' Only',
            default                                => implode(', ', array_map('plural', $audience)),
        };
    }

    // Sorted the same way as $audience in shape()
    private static function everyone(): array
    {
        $roles = config('posting.audience');
        sort($roles);

        return $roles;
    }
}
