<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\LeaveRequestModel;
use App\Models\PeopleModel;
use App\Models\SchoolYear;
use App\Services\Notify;
use Core\Controller;
use Core\Validator;

// Leave School
// A student's request waits for their parent to answer it on Approvals
// A parent's own request is approved straight away
// The account is switched off on the leaving day, and nothing is ever deleted
class LeavingController extends Controller
{

        return $date;
    }
}
