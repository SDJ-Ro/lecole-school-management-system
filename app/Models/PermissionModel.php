<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// A missing answer counts as No
// Who is invited is decided only in INVITED, so the organiser's list and the parent's cards always agree
class PermissionModel extends Model
{
    // Active students of the notice's group who are not leaving before the trip
    // Only approved, published notices invite anyone
    private const INVITED = "u.role = 'student' AND u.activation_status = 'ACTIVE'
        AND n.review = 'approved' AND n.publish_at <= NOW()
        AND (n.class_id IS NULL OR n.class_id = (SELECT s.class_id FROM current_class_students s WHERE s.student_id = u.id))
        AND (n.grade_id IS NULL OR n.grade_id = (SELECT c.grade_id FROM current_class_students s JOIN classes c ON c.id = s.class_id WHERE s.student_id = u.id))
        AND (n.extracurricular_id IS NULL OR EXISTS (SELECT 1 FROM extracurricular_members m
             WHERE m.extracurricular_id = n.extracurricular_id AND m.student_id = u.id AND m.status = 'member'))
        AND NOT EXISTS (SELECT 1 FROM leave_requests l WHERE l.student_id = u.id AND l.status = 'approved' AND l.leaving_on <= pr.trip_on)";

    public function invited(int $noticeId): array
    {
        $statement = $this->db->prepare(
            'SELECT u.id, p.full_name AS name, c.name AS class_name, a.answer
             FROM notices n
             JOIN permission_requests pr ON pr.notice_id = n.id
             JOIN user_accounts u
             JOIN profiles p ON p.account_id = u.id
             LEFT JOIN current_class_students cs ON cs.student_id = u.id
             LEFT JOIN classes c ON c.id = cs.class_id
             LEFT JOIN permission_answers a ON a.notice_id = n.id AND a.student_id = u.id
             WHERE n.id = :notice AND ' . self::INVITED . '
             ORDER BY c.name, p.first_name, p.last_name'
        );
        $statement->execute(['notice' => $noticeId]);

        return $statement->fetchAll();
    }

    public function forStudent(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT n.id AS notice_id, n.title, n.body, au.full_name AS author_name, pr.trip_on, pr.place, pr.cost, pr.reply_by,
                    a.answer, a.answered_at, ab.full_name AS answered_by_name
             FROM notices n
             JOIN permission_requests pr ON pr.notice_id = n.id
             JOIN user_accounts u ON u.id = :student
             LEFT JOIN profiles au ON au.account_id = n.author_id
             LEFT JOIN permission_answers a ON a.notice_id = n.id AND a.student_id = u.id
             LEFT JOIN profiles ab ON ab.account_id = a.answered_by
             WHERE ' . self::INVITED . '
             ORDER BY pr.trip_on DESC, n.id DESC'
        );
        $statement->execute(['student' => $studentId]);

        return $statement->fetchAll();
    }
    
}
