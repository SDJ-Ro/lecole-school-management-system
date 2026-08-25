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

    }
}
