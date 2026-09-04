<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// Who may see a notice is decided only in visibility()
// Who may change one is decided only in can_manage()
class NoticeModel extends Model
{
    // Trip details are null when the notice isn't a permission request
    private const SELECT = "SELECT n.*, a.full_name AS author_name, c.name AS class_name, g.sort_order AS grade_number, x.name AS extracurricular_name,
               IF(n.publish_at > NOW(), 'scheduled', 'live') AS state, pr.trip_on, pr.place, pr.cost, pr.reply_by
        FROM notices n
        LEFT JOIN profiles a ON a.account_id = n.author_id
        LEFT JOIN classes c ON c.id = n.class_id
        LEFT JOIN grades g ON g.id = n.grade_id
        LEFT JOIN extracurriculars x ON x.id = n.extracurricular_id
        LEFT JOIN permission_requests pr ON pr.notice_id = n.id";

    public function board(array $user): array
    {
        return $this->find($user, '1 = 1', []);
    }

    public function unread(array $user): array
    {
        return $this->find($user, 'n.publish_at <= NOW() AND NOT EXISTS
            (SELECT 1 FROM notice_reads r WHERE r.notice_id = n.id AND r.account_id = :reader)', ['reader' => $user['id']]);
    }

    public function forExtracurricular(array $user, int $extracurricularId): array
    {
        return $this->find($user, 'n.extracurricular_id = :extracurricular AND n.publish_at <= NOW()', ['extracurricular' => $extracurricularId]);
    }

    public function findFor(array $user, int $id): ?array
    {
        return $this->find($user, 'n.id = :id', ['id' => $id])[0] ?? null;
    }

    // The pin limit only counts live, approved notices, not the one being edited
    public function countPinned(?int $exceptId = null): int
    {
        $statement = $this->db->prepare("SELECT COUNT(*) FROM notices WHERE pinned = 1 AND id <> :except AND review = 'approved'
            AND publish_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())");
        $statement->execute(['except' => $exceptId ?? 0]);

        return (int) $statement->fetchColumn();
    }

    // Pinned live notices first, then the newest
    private function find(array $user, string $where, array $values): array
    {
        [$visible, $visibleValues] = $this->visibility($user);

        $statement = $this->db->prepare(self::SELECT . " WHERE {$visible} AND {$where}
            ORDER BY (n.pinned = 1 AND n.publish_at <= NOW()) DESC, n.publish_at DESC, n.id DESC");
        $statement->execute($visibleValues + $values);

        return $statement->fetchAll();
    }

    // Nobody sees an expired notice, and only its author sees a rejected one
    // Roles with see_all also see scheduled notices and ones waiting for approval
    // Everyone else sees approved, live notices for their role and their groups
    // A poster also sees their own notices
    // A model does not read the session, so this checks the given user's role instead of can()
    private function visibility(array $user): array
    {
        $notExpired = '(n.expires_at IS NULL OR n.expires_at > NOW())';

        if (in_array($user['role'], config('permissions.notices.see_all'), true))
        {
            return ["({$notExpired} AND (n.review <> 'rejected' OR n.author_id = :me))", ['me' => $user['id']]];
        }

        $in   = (new Membership())->idListsOf($user);
        $live = "n.review = 'approved' AND n.publish_at <= NOW() AND FIND_IN_SET(:role, n.audience)
                 AND (COALESCE(n.class_id, n.grade_id, n.extracurricular_id) IS NULL
                      OR n.class_id IN ({$in['class']}) OR n.grade_id IN ({$in['grade']}) OR n.extracurricular_id IN ({$in['extracurricular']}))";
        $own  = in_array($user['role'], config('permissions.notices.post'), true) ? ' OR n.author_id = ' . (int) $user['id'] : '';

        return ["({$notExpired} AND (({$live}){$own}))", ['role' => $user['role']]];
    }
}
