<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\CalendarModel;
use App\Services\CalendarFeed;
use Core\Controller;
use Core\Validator;

// Saving and deleting calendar events
// Every answer is JSON with the user's fresh events, so the calendar redraws without reloading
// A clash with another event for the same students is only a warning
// Ticking "Allow parallel schedule" saves it anyway
class CalendarController extends Controller
{
    private const RULES = [
        'title'          => 'required|max:150',
        'details'        => 'max:500',
        'event_date'     => 'required|date',
        'start_time'     => 'time',   // Empty means all day
        'end_time'       => 'time',
        'category'       => 'required|max:20',
        'academic_level' => 'in:grade,class',
        'allow_parallel' => 'in:1',
    ];

    
    // POST /{role}/calendar/save. Without an id it adds a new event
    public function save(string $role): never
    {
        $user     = $this->guard($role);
        $id       = (int) $this->postText('id') ?: null;
        $existing = $id === null ? null : $this->manageable($user, $id);
        $data     = $this->checkedForm();
        $choices  = (new CalendarModel())->choicesFor($user);
        $lastDay  = CalendarFeed::lastYear() . '-12-31';

    }
}


        [$scopes, $missing] = match (true)
        {
            $data['category'] === 'General'         => [[['school', null]], ''],
            $data['category'] === 'Extracurricular' => [$this->picked('extracurriculars', 'extracurricular', $choices['extracurriculars']), 'Please select at least one club or sport.'],
            $data['academic_level'] === 'grade'     => [$this->picked('grades', 'grade', $choices['grades']), 'Please select at least one ' . strtolower(word('grade')) . '.'],
            default                                 => [$this->picked('classes', 'class', $choices['classes']), 'Please select at least one ' . strtolower(word('class')) . '.'],
        };

        // An all-day event has no end time and can't clash with anything
        if ($data['start_time'] === '')
        {
            $data['end_time'] = '';
        }

        $clash = $data['start_time'] === '' ? null
            : (new CalendarModel())->clash($data['event_date'], $data['start_time'], $data['end_time'] ?: null, $scopes, $id);

        $event = [
            'title'      => $data['title'],
            'details'    => $data['details'] ?: null,
            'category'   => $data['category'],
            'audience'   => implode(',', $this->audience($role)),
            'event_date' => $data['event_date'],
            'start_time' => $data['start_time'] ?: null,
            'end_time'   => $data['end_time'] ?: null,
        ];

        if ($existing === null)
        {
            $event += ['author_id' => $user['id'], 'author_role' => $user['role']];
        }

        $id = (new CalendarModel())->save($id, $event, $scopes);
        $this->log($user, $existing === null ? 'EVENT_ADDED' : 'EVENT_UPDATED', "#{$id} {$event['title']}");

        if ($clash !== null)
        {
            $this->log($user, 'EVENT_CLASH_ACCEPTED', "#{$id} {$event['title']} alongside \"{$clash['title']}\"");
        }

        $this->done('Event saved.', $user, $event['event_date']);
    }

    // POST /{role}/calendar/delete
    public function delete(string $role): never
    {
        $user  = $this->guard($role);
        $event = $this->manageable($user, (int) $this->postText('id'));

        (new CalendarModel())->delete((int) $event['id']);
        $this->log($user, 'EVENT_DELETED', "#{$event['id']} {$event['title']}");

        $this->done('Event deleted.', $user, $event['event_date']);
    }

       private function guard(string $role): array
    {
        $user = $this->requireRole($role);

        return $user;
    }

    // An event they can't see gets 404, and one they can see but not change gets 403
    private function manageable(array $user, int $id): array
    {
        $event = (new CalendarModel())->findFor($user, $id);


        return $event;
    }

    private function checkedForm(): array
    {
        $data = [];

        foreach (array_keys(self::RULES) as $field)
        {
            $data[$field] = $this->postText($field, 1000);
        }

        $data['start_time'] = $this->joinedTime('start');
        $data['end_time']   = $this->joinedTime('end');


        
        return $data;
    }

    // Joins the hour and minute boxes into a time like "09:30"
    // Returns an empty string when no hour was chosen
    private function joinedTime(string $which): string
    {
        $hour = $this->postText("{$which}_hour", 2);

        return $hour === '' ? '' : $hour . ':' . $this->postText("{$which}_minute", 2);
    }

    // Only the groups this user was offered, each as a type and an id
    private function picked(string $field, string $type, array $offered): array
    {
        $ids = array_unique(array_map('intval', $this->postList($field)));

        return array_values(array_map(fn (int $id): array => [$type, $id], array_filter($ids, fn (int $id): bool => isset($offered[$id]))));
    }

    // Choosing "all", or nothing, means every role this role may write to
    private function audience(string $role): array
    {
        $offered = config("calendar.audience.{$role}");
        $picked  = array_intersect($this->postList('audience'), $offered);

        return in_array('all', $picked, true) || $picked === [] ? array_values(array_diff($offered, ['all'])) : array_values($picked);
    }

    // The 'only' field limits the events to one club or sport page
    private function done(string $message, array $user, string $date): never
    {
        $only = preg_match('/^extracurricular:\d+$/', $this->postText('only', 30)) ? $this->postText('only', 30) : '';

        $this->sendJson(['ok' => true, 'message' => $message, 'events' => CalendarFeed::around($user, $only), 'date' => $date]);
    }

    private function fail(string $message, array $errors = [], array $extra = [], int $status = 422): never
    {
        $this->sendJson(['ok' => false, 'message' => $message, 'errors' => $errors] + $extra, $status);        