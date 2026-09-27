<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

class NotificationModel extends Model
{
    // A parent is told whatever their child is told
    public function parentsOf(array $studentIds): array
    {
        if ($studentIds === [])
        {
            return [];
        }

        $holders   = implode(', ', array_fill(0, count($studentIds), '?'));
        $statement = $this->db->prepare("SELECT student_account_id, parent_account_id FROM student_parents WHERE student_account_id IN ({$holders})");
        $statement->execute(array_values($studentIds));
        $parents   = [];

        foreach ($statement->fetchAll() as $row)
        {
            $parents[(int) $row['student_account_id']][] = (int) $row['parent_account_id'];
        }

        return $parents;
    }

    // For a parent, the student id is the child they are viewing
    public function unread(int $accountId, int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT id, text, link, created_at FROM notifications
             WHERE account_id = :account AND about_student = :student AND read_at IS NULL ORDER BY created_at DESC, id DESC'
        );
        $statement->execute(['account' => $accountId, 'student' => $studentId]);

        return $statement->fetchAll();
    }

    }
}
