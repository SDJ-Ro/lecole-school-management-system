<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// Who may see which feedback is decided only in SEES
// A parent never sees feedback meant only for the student
class FeedbackModel extends Model
{
    // Only these names reach the SQL
    private const COLUMNS = ['student_id', 'school_year', 'teacher_id', 'kind', 'audience', 'subject', 'title', 'message'];

    private const SEES = ['student' => "('student', 'both')", 'parent' => "('parent', 'both')"];

    private const READ_COLUMN = ['student' => 'student_read_at', 'parent' => 'parent_read_at'];

    public function sentBy(int $teacherId): array
    {
        return $this->rows('f.teacher_id = :id', $teacherId);
    }

    public function forParent(int $studentId): array
    {
        return $this->rows('f.student_id = :id AND f.audience IN ' . self::SEES['parent'], $studentId);
    }

    public function forStudent(int $studentId): array
    {
        return $this->rows('f.student_id = :id AND f.audience IN ' . self::SEES['student'], $studentId);
    }

    // The student ids are the student themselves, or a parent's children
    // Someone else's feedback and an unknown id both give null
    public function find(int $id, string $reader, array $studentIds): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM feedback WHERE id = :id AND student_id IN (' . self::idList($studentIds) . ')
            AND audience IN ' . self::SEES[$reader]);
        $statement->execute(['id' => $id]);

        return $statement->fetch() ?: null;
    }

    // Someone else's feedback and an unknown id both give null
    public function writtenBy(int $id, int $teacherId): ?array
    {
        return $this->rows('f.id = :id AND f.teacher_id = :teacher', $id, $teacherId)[0] ?? null;
    }

    // The only students a class teacher may write to
    public function students(int $teacherId): array
    {
        $statement = $this->db->prepare(
            "SELECT u.id, p.full_name AS name, p.code, c.name AS class_name
             FROM current_class_teachers ct
             JOIN classes c ON c.id = ct.class_id
             JOIN current_class_students cs ON cs.class_id = ct.class_id
             JOIN user_accounts u ON u.id = cs.student_id
             JOIN profiles p ON p.account_id = u.id
             WHERE ct.teacher_id = :me AND u.activation_status <> 'INACTIVE'
             ORDER BY p.first_name, p.last_name"
        );
        $statement->execute(['me' => $teacherId]);

        return $statement->fetchAll();
    }

    // The where text is fixed in this file, never from a form
    private function rows(string $where, int $id, ?int $teacherId = null): array
    {
        $statement = $this->db->prepare(
            "SELECT f.*, s.full_name AS student_name, t.full_name AS teacher_name
             FROM feedback f
             JOIN profiles s ON s.account_id = f.student_id
             JOIN profiles t ON t.account_id = f.teacher_id
             WHERE {$where}
             ORDER BY f.created_at DESC, f.id DESC"
        );
        $statement->execute(['id' => $id] + ($teacherId === null ? [] : ['teacher' => $teacherId]));

        return $statement->fetchAll();
    }
}
