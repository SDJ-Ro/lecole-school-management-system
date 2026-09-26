<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// A student can have only one open request, either waiting for the parent or approved
// Declined and cancelled requests are kept as history
class LeaveRequestModel extends Model
{
    public function latest(int $studentId): ?array
    {
        $statement = $this->db->prepare(
            "SELECT r.*, p.full_name AS asked_by_name FROM leave_requests r JOIN profiles p ON p.account_id = r.asked_by
             WHERE r.student_id = :id AND r.status <> 'cancelled' ORDER BY r.id DESC LIMIT 1"
        );
        $statement->execute(['id' => $studentId]);

        return $statement->fetch() ?: null;
    }

 
    public function hasParent(int $studentId): bool
    {
        $statement = $this->db->prepare('SELECT 1 FROM student_parents WHERE student_account_id = :id LIMIT 1');
        $statement->execute(['id' => $studentId]);

        return $statement->fetchColumn() !== false;
    }

    public function forParent(int $parentId): array
    {
        $statement = $this->db->prepare(
            "SELECT r.*, s.full_name AS student_name, a.full_name AS asked_by_name
             FROM leave_requests r JOIN student_parents sp ON sp.student_account_id = r.student_id
             JOIN profiles s ON s.account_id = r.student_id JOIN profiles a ON a.account_id = r.asked_by
             WHERE sp.parent_account_id = :me AND r.status <> 'cancelled' ORDER BY r.created_at DESC, r.id DESC"
        );
        $statement->execute(['me' => $parentId]);

        return $statement->fetchAll();
    }
}
