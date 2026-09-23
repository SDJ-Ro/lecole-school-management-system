<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\ExtracurricularModel;
use App\Models\LeaveRequestModel;
use App\Models\PermissionModel;
use App\Services\Notify;
use Core\Controller;

// A parent says yes or no before their child joins a club or sport, goes on a trip, or leaves the school
// Leave requests are answered in LeavingController::answer()
class ApprovalController extends Controller
{
    // Each status has a label, a card colour and an icon
    private const STATUSES = [
        'pending'  => ['Awaiting Your Decision', 'sunshine', 'clock'],
        'approved' => ['Approved by You', 'moss', 'checkCircle2'],
        'declined' => ['Declined by You', 'maroon', 'close'],
    ];

    // GET /parent/approvals
    public function index(): void
    {
        $user     = $this->requireRole('parent');
        $status   = array_key_exists($this->queryText('status'), self::STATUSES) ? $this->queryText('status') : 'pending';
        // Only the child being viewed, with leave requests first
        $mine     = fn (array $row): bool => (int) $row['student_id'] === $user['child'];
        $requests = [
            ...array_map([$this, 'leaveCard'], array_filter((new LeaveRequestModel())->forParent($user['id']), $mine)),
            ...array_map([$this, 'tripCard'], (new PermissionModel())->forStudent((int) $user['child'])),
            ...array_map([$this, 'card'], array_filter((new ExtracurricularModel())->forParent($user['id']), $mine)),
        ];
        $tabs     = [];

        foreach (self::STATUSES as $key => [$label, $color, $icon])
        {
            $tabs[] = [
                'label'  => $label,
                'color'  => $color,
                'icon'   => $icon,
                'value'  => count(array_filter($requests, fn (array $request): bool => $request['status'] === $key)),
                'href'   => "/parent/approvals?status={$key}",
                'chosen' => $key === $status,
            ];
        }

        $this->page('parent/approvals', $user, [
            'subtitle' => words('Review consent requests from the {institution} — approve or decline trips, club and sport enrolments and leaving for ')
                . ($this->children($user)[$user['child']] ?? words('your {student}')) . '.',
            'tabs'     => $tabs,
            'status'   => $status,
            'requests' => array_values(array_filter($requests, fn (array $request): bool => $request['status'] === $status)),
        ]);
    }

    }
}
