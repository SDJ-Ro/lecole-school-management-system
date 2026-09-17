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
    public function review(string $role): never
    {
        $user  = $this->requireRole($role);
        $board = config("notices.board.{$role}.url");

        $notice  = (new NoticeModel())->findFor($user, (int) $this->postText('id'));
        $decision = $this->postText('decision', 10);
        $note     = $this->postText('note', 255);




        $approve = $decision === 'approve';


        $this->log($user, $approve ? 'NOTICE_APPROVED' : 'NOTICE_REJECTED', "#{$notice['id']} {$notice['title']}" . ($approve ? '' : ": {$note}"));

        $this->done($role, $approve ? 'Notice approved.' : 'Notice rejected.');
    }

    private function waits(): bool
    {
        return feature('approvals') && can('notices.wait_for_approval');
    }

    private function approves(): bool
    {
        return feature('approvals') && can('notices.approve');
    }

    // A notice they can't see gets 404, and one they can see but not change gets 403
    private function manageable(array $user, int $id): array
    {
        $board  = config("notices.board.{$user['role']}.url");
        $notice = (new NoticeModel())->findFor($user, $id);



        return $notice;
    }

    private function card(array $notice, array $user): array
    {
        $isMine = (int) $notice['author_id'] === (int) $user['id'];

        return $notice + [
            'canManage' => can_manage($notice),
            'canReview' => $notice['review'] === 'pending' && $this->approves(),
            'isMine'    => $isMine,
            'isForMe'   => in_array($user['role'], explode(',', $notice['audience']), true),
            'trip'      => $notice['trip_on'] === null ? null : $this->permissionView($notice, $user, $isMine),
        ];
    }

    // Only the author and those who see everything get the list of answers
    // A student gets 'mine', which is their parent's answer
    private function permissionView(array $notice, array $user, bool $isMine): array
    {
        $day   = fn (string $date): string => date(country('date_format'), strtotime($date));
        $open  = $notice['reply_by'] >= date('Y-m-d');
        $words = ['yes' => 'Going', 'no' => 'Not going'];
        $view  = [
            'line' => implode(' · ', array_filter([$day($notice['trip_on']), $notice['place'], $notice['cost'], 'Reply by ' . $day($notice['reply_by'])])),
        ];

        if ($isMine || in_array($user['role'], config('permissions.notices.see_all'), true))
        {
            $view['answers'] = ['Going' => [], 'Not going' => [], 'No answer' => []];

            foreach ((new PermissionModel())->invited((int) $notice['id']) as $student)
            {
                $view['answers'][$words[$student['answer']] ?? 'No answer'][] = $student['name'] . ($student['class_name'] !== null ? " ({$student['class_name']})" : '');
            }
        }

        if ($user['role'] === 'student')
        {
            $mine         = array_values(array_filter((new PermissionModel())->forStudent((int) $user['id']), fn (array $row): bool => (int) $row['notice_id'] === (int) $notice['id']))[0] ?? null;
            $view['mine'] = match (true)
            {
                $mine === null           => null,   // Not invited
                $mine['answer'] !== null => 'Your ' . strtolower(word('parent')) . ': ' . $words[$mine['answer']],
                $open                    => 'Waiting for your ' . strtolower(word('parent')) . "'s answer: ask them to answer on Approvals.",
                default                  => 'No answer was given, so it counts as Not going.',
            };
        }

        if ($user['role'] === 'parent')
        {
            $view['approvals'] = '/parent/approvals';
        }

        return $view;
    }

    // Fills the form with what was typed before a refusal, or the notice being edited, or the defaults
    private function form(array $user, string $role, ?array $editing): array
    {
        $typed    = $this->getFlash('notice_form');
        $anyGroup = can('posts.any_group');   // Otherwise only their own classes and clubs, with nothing ticked

        return [
            'id'        => $editing['id'] ?? null,
            'values'    => $typed ?? ($editing !== null ? $this->savedValues($editing, $role) : [
                'title' => '', 'body' => '', 'category' => config("notices.categories.{$role}")[0], 'audience' => ['all'],
                'target' => $anyGroup ? 'all' : '', 'extracurricular' => $anyGroup ? 'all' : '',
                'publish_at' => '', 'expires_at' => '', 'pinned' => false,
                'permission' => false, 'trip_on' => '', 'place' => '', 'cost' => '', 'reply_by' => '',
            ]),
            'choices'   => [
                'categories' => config("notices.categories.{$role}"),
                'audience'   => config("notices.audience.{$role}"),
                'schoolWide' => $anyGroup,
            ] + (new CalendarModel())->choicesFor($user),   // The groups this person may post to
            'banner'    => $this->waits()
                ? 'Your notice appears on the central board once an administrator approves it.'
                : 'Notices appear immediately on the central board for the selected audience.',
            'canPin'    => !$this->waits() && ($editing['review'] ?? 'approved') === 'approved',
            'error'     => $typed !== null ? $this->getFlash('error') : null,
        ];
    }

    // The audience shows as "all" when it covers every role this poster may write to
    private function savedValues(array $notice, string $role): array
    {
        $everyone = array_values(array_diff(config("notices.audience.{$role}"), ['all']));
        $audience = explode(',', $notice['audience']);

        return [
            'title'           => $notice['title'],
            'body'            => $notice['body'],
            'category'        => $notice['category'],
            'audience'        => array_diff($everyone, $audience) === [] ? ['all'] : $audience,
            'target'          => $notice['class_id'] !== null ? "class:{$notice['class_id']}" : ($notice['grade_id'] !== null ? "grade:{$notice['grade_id']}" : 'all'),
            'extracurricular' => $notice['extracurricular_id'] !== null ? (string) $notice['extracurricular_id'] : 'all',
            'publish_at'      => substr($notice['publish_at'], 0, 10),
            'expires_at'      => $notice['expires_at'] !== null ? substr($notice['expires_at'], 0, 10) : '',
            'pinned'          => (bool) $notice['pinned'],
            'permission'      => $notice['trip_on'] !== null,
            'trip_on'         => $notice['trip_on'] ?? '',
            'place'           => $notice['place'] ?? '',
            'cost'            => $notice['cost'] ?? '',
            'reply_by'        => $notice['reply_by'] ?? '',
        ];
    }

    private function typedValues(): array
    {
        return [
            'title'           => $this->postText('title', 200),
            'body'            => $this->postText('body', 5000),
            'category'        => $this->postText('category', 30),
            'audience'        => $this->postList('audience'),
            'target'          => $this->postText('target', 20),
            'extracurricular' => $this->postText('extracurricular', 20),
            'publish_at'      => $this->postText('publish_at', 10),
            'expires_at'      => $this->postText('expires_at', 10),
            'pinned'          => $this->postText('pinned') === '1',
            // The "Ask Parents for Permission" trip fields
            'permission'      => $this->postText('permission') === '1',
            'trip_on'         => $this->postText('trip_on', 10),
            'place'           => $this->postText('place', 150),
            'cost'            => $this->postText('cost', 50),
            'reply_by'        => $this->postText('reply_by', 10),
        ];
    }

    // Returns the row to save, or goes back to the form with the reason and what was typed
    private function checked(array $user, string $role, array $values, ?array $existing): array
    {
        $choices = (new CalendarModel())->choicesFor($user);
        $offered = config("notices.audience.{$role}");
        $today   = date('Y-m-d');
        $wasDay  = $existing !== null ? substr($existing['publish_at'], 0, 10) : null;

        $errors   = array_values(Validator::check($values, self::RULES, [
            'title' => 'Notice title', 'body' => 'Notice body', 'publish_at' => 'Publish date', 'expires_at' => 'Expiration date',
        ]));
        $category = $values['category'];

        if (!in_array($category, config("notices.categories.{$role}"), true))
        {
            $errors[] = 'Please choose a category from the list.';
        }

        // Choosing "all" means every role this poster may write to
        // A permission request is always for students and parents
        $picked   = array_values(array_intersect($values['audience'], $offered));
        $audience = $values['permission'] ? ['student', 'parent']
            : (in_array('all', $picked, true) ? array_values(array_diff($offered, ['all'])) : $picked);

        if ($values['permission'])
        {
            $errors = [...$errors, ...$this->permissionProblems($values, $existing)];
        }
        elseif (in_array('management', $values['audience'], true) && !in_array('management', $offered, true))
        {
            $errors[] = $role === 'management'
                ? words('{Management} cannot post notices to {Management}. Please select {Teachers}, {Parents}, or {Students}.')
                : 'Please choose the audience from the list.';
        }
        elseif ($audience === [])
        {
            $errors[] = 'Please choose who the notice is for.';
        }

        // An Academic notice goes to everyone, a grade or a class
        // An Extracurricular notice goes to every club or just one
        // Any other category goes to everyone
        // Only groups the form offered are allowed, so a teacher can only pick their own classes and clubs
        [$type, $groupId] = array_pad(explode(':', $category === 'Academic' ? $values['target'] : ($category === 'Extracurricular' ? "extracurricular:{$values['extracurricular']}" : 'all')), 2, null);
        $groupId  = $groupId === 'all' ? null : $groupId;
        $offeredGroups = ['grade' => $choices['grades'], 'class' => $choices['classes'], 'extracurricular' => $choices['extracurriculars']];
        $schoolWide    = $type === 'all' || ($type === 'extracurricular' && $groupId === null);

        if ($schoolWide ? !can('posts.any_group') : !isset($offeredGroups[$type][(int) $groupId]))
        {
            $errors[] = !can('posts.any_group')
                ? 'Please choose one of your ' . strtolower(plural('class')) . ' or clubs.'
                : 'Please choose who the notice is for from the list.';
        }

        // The publish day must be today or later, but an edited notice may keep its old day
        // The expiry day must be on or after the publish day
        $publishDay = $values['publish_at'] !== '' ? $values['publish_at'] : ($wasDay ?? $today);

        if ($publishDay < $today && $publishDay !== $wasDay)
        {
            $errors[] = 'The publish date can\'t be in the past.';
        }

        if ($values['expires_at'] !== '' && $values['expires_at'] < max($publishDay, $today))
        {
            $errors[] = 'Notice expiration date must be later than the publish date.';
        }

        if ($values['pinned'] && !($existing['pinned'] ?? false)
            && (new NoticeModel())->countPinned($existing['id'] ?? null) >= config('notices.max_pinned'))
        {
            $errors[] = 'Maximum of ' . config('notices.max_pinned') . ' notices can be pinned at a time. Please unpin an older notice first.';
        }


        return [
            'title'              => $values['title'],
            'body'               => $values['body'],
            'category'           => $category,
            'audience'           => implode(',', $audience),
            'class_id'           => $type === 'class' ? (int) $groupId : null,
            'grade_id'           => $type === 'grade' ? (int) $groupId : null,
            'extracurricular_id' => $type === 'extracurricular' && $groupId !== null ? (int) $groupId : null,
            'publish_at'         => $publishDay === $wasDay ? $existing['publish_at'] : ($publishDay === $today ? date('Y-m-d H:i:s') : "{$publishDay} 00:00:00"),
            'expires_at'         => $values['expires_at'] !== '' ? "{$values['expires_at']} 23:59:59" : null,
            'pinned'             => (int) $values['pinned'],
        ];
    }

    // The trip must be after today
    // The reply-by date must be from today and before the trip
    // An edit may keep a date that has already passed
    private function permissionProblems(array $values, ?array $existing): array
    {
        $today    = date('Y-m-d');
        $problems = array_values(Validator::check($values,
            ['trip_on' => 'required|date', 'place' => 'required|max:150', 'cost' => 'max:50', 'reply_by' => 'required|date'],
            ['trip_on' => 'Trip date', 'place' => 'Place', 'cost' => 'Cost', 'reply_by' => 'Reply-by date']));
        $moved    = fn (string $key): bool => $values[$key] !== ($existing[$key] ?? null);

        if ($problems !== [])
        {
            return $problems;
        }

        return array_values(array_filter([
            $moved('trip_on') && $values['trip_on'] <= $today ? 'The trip date must be after today.' : null,
            $moved('reply_by') && $values['reply_by'] < $today ? 'The reply-by date can\'t be in the past.' : null,
            $values['reply_by'] >= $values['trip_on'] ? words('{Parents} must reply before the trip: the reply-by date comes before the trip date.') : null,
        ]));
    }

    private function done(string $role, string $message): never
    {
        $this->setFlash('notice', $message);
        $this->redirect(config("notices.board.{$role}.url"));
    }
}
