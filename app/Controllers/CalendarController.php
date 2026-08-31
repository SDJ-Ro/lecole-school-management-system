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
