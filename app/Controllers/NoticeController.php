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

    // Shows the notice board, or the post form when the link has ?post or ?edit
    // Opening the board marks its notices as read
    public function board(string $role): void
    {
        $user      = $this->requireRole($role);
        $board     = config("notices.board.{$role}");
        $canPost   = can('notices.post');
        $wantsForm = $canPost && (isset($_GET['post']) || $this->queryText('edit') !== '');   // The ?post link has no value, so only check that it is there
        $editing   = $wantsForm && $this->queryText('edit') !== '' ? $this->manageable($user, (int) $this->queryText('edit')) : null;
        $notices   = $wantsForm ? [] : array_map(fn (array $notice): array => $this->card($notice, $user), (new NoticeModel())->board($user));

        if (!$wantsForm)
        {
            (new NoticeModel())->markRead(array_column(array_filter($notices, fn (array $n): bool => $n['state'] === 'live'), 'id'), $user['id']);
        }

        $this->page("{$role}/notice", $user, [
            'boardUrl'       => $board['url'],
            'subtitle'       => words($board['subtitle']),
            'searchText'     => $board['search'],
            'notices'        => $notices,
            'noticeForm'     => $wantsForm ? $this->form($user, $role, $editing) : null,
            'canPost'        => $canPost,
            'tabs'           => in_array($role, config('notices.tabs'), true),
            'waitingCount'   => $this->approves() ? count(array_filter($notices, fn (array $n): bool => $n['review'] === 'pending')) : null,
            'audienceFilter' => $canPost ? config("notices.audience.{$role}") : null,
            'categories'     => config('notices.categories.admin'),               // The admin's list holds every category
        ]);
    }

    // POST {board}/save. Without an id it adds a new notice
    public function save(string $role): never
    {
        $user     = $this->requireRole($role);
        $id       = (int) $this->postText('id') ?: null;
        $existing = $id === null ? null : $this->manageable($user, $id);
        $values   = $this->typedValues();
        $notice   = $this->checked($user, $role, $values, $existing);

        // A teacher's notice needs admin approval again after every edit
        // Anyone else's edit keeps the notice's state
        // Only approved notices stay pinned
        if ($this->waits())
        {
            $notice += ['review' => 'pending', 'review_note' => null, 'reviewed_by' => null, 'reviewed_at' => null];
        }
        elseif ($existing === null)
        {
            $notice += ['review' => 'approved'];
        }

        if (($notice['review'] ?? $existing['review']) !== 'approved')
        {
            $notice['pinned'] = 0;
        }

        if ($existing === null)
        {
            $notice += ['author_id' => $user['id'], 'author_role' => $role];
        }

        // A permission request's trip details are saved with the notice
        $permission = $values['permission']
            ? ['trip_on' => $values['trip_on'], 'place' => $values['place'], 'cost' => $values['cost'] ?: null, 'reply_by' => $values['reply_by']]
            : null;

        $id = (new NoticeModel())->save($id, $notice, $permission);
        $this->log($user, $existing === null ? 'NOTICE_POSTED' : 'NOTICE_UPDATED', "#{$id} {$notice['title']}" . ($permission !== null ? ' (permission request)' : ''));

        $this->done($role, $existing === null ? 'Notice published.' : 'Notice updated.');
    }

    // POST {board}/pin. Pins or unpins the notice
    public function pin(string $role): never
    {
        $user   = $this->requireRole($role);
        $notice = $this->manageable($user, (int) $this->postText('id'));
        $pin    = !$notice['pinned'];



        (new NoticeModel())->setPinned((int) $notice['id'], $pin);
        $this->log($user, $pin ? 'NOTICE_PINNED' : 'NOTICE_UNPINNED', "#{$notice['id']} {$notice['title']}");

        $this->done($role, $pin ? 'Notice pinned.' : 'Notice unpinned.');
    }

    // POST {board}/delete. The notice can't be brought back, but the Audit Log keeps who deleted what
    public function delete(string $role): never
    {
        $user   = $this->requireRole($role);
        $notice = $this->manageable($user, (int) $this->postText('id'));
        // Deleting cancels a trip still to come
        // Read who was invited first, because the delete removes that list too
        $invited = $notice['trip_on'] !== null && $notice['trip_on'] >= date('Y-m-d') ? array_column((new PermissionModel())->invited((int) $notice['id']), 'id') : [];

        (new NoticeModel())->delete((int) $notice['id']);
        $this->log($user, 'NOTICE_DELETED', "#{$notice['id']} {$notice['title']}");
        Notify::students($invited, "The trip \"{$notice['title']}\" on " . date(country('date_format'), strtotime((string) $notice['trip_on'])) . ' is cancelled.', 'notices');

        $this->done($role, 'Notice deleted.');
    }

    // POST {board}/review
    // Rejecting needs a reason, which the author sees on their card
    }
}
