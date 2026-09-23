<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// The only place that saves each year's class places and teacher duties
// Pages read this year's rows through the current_ views
class Assignments extends Model
{
    private function currentYear(): int
    {
        return (new SchoolYear())->current();
    }

    // Must run inside the transaction that places the student
    // The row locks make two people taking the last place wait for each other
    public function hasRoom(int $classId, ?int $year = null): bool
    {
        $class = $this->db->prepare('SELECT capacity FROM classes WHERE id = :id FOR UPDATE');
        $class->execute(['id' => $classId]);
        $capacity = $class->fetchColumn();

        $students = $this->db->prepare('SELECT COUNT(*) FROM class_students WHERE class_id = :id AND year = :year FOR SHARE');
        $students->execute(['id' => $classId, 'year' => $year ?? $this->currentYear()]);

        return $capacity !== false && (int) $students->fetchColumn() < (int) $capacity;
    }

    public function yearStarted(int $year): bool
    {
        $statement = $this->db->prepare('SELECT 1 FROM year_ends WHERE year = :year');
        $statement->execute(['year' => $year]);

        return (bool) $statement->fetchColumn();
    }

    // Active students who are not leaving the school by today
    public function continuingStudents(int $year): array
    {
        $statement = $this->db->prepare(
            "SELECT cs.student_id, c.name AS class_name, g.sort_order AS grade_number
             FROM class_students cs
             JOIN classes c ON c.id = cs.class_id
             JOIN grades g ON g.id = c.grade_id
             JOIN user_accounts a ON a.id = cs.student_id AND a.activation_status = 'ACTIVE'
             WHERE cs.year = :year
               AND NOT EXISTS (SELECT 1 FROM leave_requests l WHERE l.student_id = cs.student_id AND l.status = 'approved' AND l.leaving_on <= CURDATE())
             ORDER BY g.sort_order, c.name, cs.student_id"
        );
        $statement->execute(['year' => $year]);

        return $statement->fetchAll();
    }

    }
}
