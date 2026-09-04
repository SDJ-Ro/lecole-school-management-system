<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\CalendarModel;
use App\Models\NoticeModel;
use App\Models\PermissionModel;
use App\Services\Notify;
use Core\Controller;
use Core\Validator;

// The notice board for every role
// Teachers' notices wait for the admin's approval
class NoticeController extends Controller
{
    private const RULES = [
        'title'      => 'required|min:3|max:200',
        'body'       => 'required|min:10|max:5000',
        'category'   => 'required|max:30',
        'publish_at' => 'date',
        'expires_at' => 'date',
    ];

    }
}
