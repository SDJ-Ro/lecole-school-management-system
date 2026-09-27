<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\NotificationModel;
use Core\Controller;

// A parent's notifications are about the child they are viewing
class NotificationController extends Controller
{
    // GET /{role}/notifications/open. Marks it as read and opens its link
    // Someone else's notification or an unknown id goes to the dashboard
    public function open(string $role): never
    {
        $user = $this->requireRole($role);
        $link = (new NotificationModel())->open((int) $this->queryText('id'), (int) $user['id']);

        $this->redirect($link ?? "/{$role}");
    }

    }
}
