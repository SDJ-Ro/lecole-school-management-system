<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// A parent's inquiry about one or more of their children, with one answer from the school
// Each one is kept with the school year it was sent in
class ComplaintModel extends Model
{
    // Children are shown with the class they were in that year
    // A class id of 0 means the child had left or graduated
    private const SELECT = "SELECT c.*, parent.full_name AS parent_name,
               GROUP_CONCAT(CONCAT(s.full_name, ' (', COALESCE(cl.name, '—'), ')') ORDER BY s.first_name, s.last_name SEPARATOR ', ') AS students,
               GROUP_CONCAT(cs.student_id) AS student_ids, GROUP_CONCAT(COALESCE(cl.id, 0)) AS class_ids,
               GROUP_CONCAT(COALESCE(cl.grade_id, 0)) AS grade_ids
        FROM complaints c
        JOIN profiles parent ON parent.account_id = c.parent_id
        JOIN complaint_students cs ON cs.complaint_id = c.id
        JOIN profiles s ON s.account_id = cs.student_id
        LEFT JOIN class_students placement ON placement.student_id = cs.student_id AND placement.year = c.school_year
        LEFT JOIN classes cl ON cl.id = placement.class_id";

    // Open ones first with the longest waiting at the top, then resolved ones with the newest first
    private const ORDER = " GROUP BY c.id ORDER BY c.status = 'resolved', IF(c.status = 'in_progress', c.created_at, NULL), c.created_at DESC, c.id DESC";

    public function forParent(int $parentId, int $studentId): array
    {
        $statement = $this->db->prepare(self::SELECT . ' WHERE c.parent_id = :parent
            AND c.id IN (SELECT complaint_id FROM complaint_students WHERE student_id = :student)' . self::ORDER);
        $statement->execute(['parent' => $parentId, 'student' => $studentId]);

        return $statement->fetchAll();
    }

    public function forManagement(): array
    {
        return $this->db->query(self::SELECT . self::ORDER)->fetchAll();
    }

    public function find(int $id): ?array
    {
        $statement = $this->db->prepare(self::SELECT . ' WHERE c.id = :id GROUP BY c.id');
        $statement->execute(['id' => $id]);

        return $statement->fetch() ?: null;
    }

    }
}