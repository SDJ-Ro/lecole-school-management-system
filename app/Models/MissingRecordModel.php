<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// A programme's request goes to its teacher in charge, and any other to the class teacher
// Management sees every request, and the first answer wins
class MissingRecordModel extends Model
{
    // Only these names reach the SQL
    private const COLUMNS = ['record_type', 'extracurricular_id', 'school_year', 'title', 'details', 'evidence_path', 'evidence_name'];

    private const FOR_TEACHER =
        '((r.extracurricular_id IS NULL AND r.student_id IN (SELECT cs.student_id FROM current_class_students cs
                                                             JOIN current_class_teachers ct ON ct.class_id = cs.class_id WHERE ct.teacher_id = :me))
          OR r.extracurricular_id IN (SELECT extracurricular_id FROM current_teachers_in_charge WHERE teacher_id = :me2))';

    public function send(int $studentId, array $values): void
    {
        $values  = array_intersect_key($values, array_flip(self::COLUMNS));
        $columns = array_keys($values);

        $this->db->prepare('INSERT INTO missing_record_requests (student_id, ' . implode(', ', $columns) . ') VALUES (:student, :' . implode(', :', $columns) . ')')
            ->execute($values + ['student' => $studentId]);
    }

    public function waitingCount(int $studentId): int
    {
        $statement = $this->db->prepare("SELECT COUNT(*) FROM missing_record_requests WHERE student_id = :id AND status = 'pending'");
        $statement->execute(['id' => $studentId]);

        return (int) $statement->fetchColumn();
    }

    // With no teacher given, returns every waiting request for management
    public function waiting(?int $teacherId): array
    {
        $statement = $this->db->prepare(
            "SELECT r.*, x.name AS programme, x.type AS programme_type FROM missing_record_requests r
             LEFT JOIN extracurriculars x ON x.id = r.extracurricular_id
             WHERE r.status = 'pending'" . ($teacherId === null ? '' : ' AND ' . self::FOR_TEACHER) . '
             ORDER BY r.created_at, r.id'
        );
        $statement->execute($teacherId === null ? [] : ['me' => $teacherId, 'me2' => $teacherId]);

        return $statement->fetchAll();
    }

    public function ofStudent(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT r.*, x.name AS programme, x.type AS programme_type, a.full_name AS answered_by_name FROM missing_record_requests r
             LEFT JOIN extracurriculars x ON x.id = r.extracurricular_id LEFT JOIN profiles a ON a.account_id = r.answered_by
             WHERE r.student_id = :id ORDER BY r.created_at DESC, r.id DESC'
        );
        $statement->execute(['id' => $studentId]);

        return $statement->fetchAll();
    }

    // Answered requests too, so their evidence can still be opened
    public function find(int $requestId): ?array
    {
        $statement = $this->db->prepare(
            'SELECT r.*, x.name AS programme, x.type AS programme_type FROM missing_record_requests r
             LEFT JOIN extracurriculars x ON x.id = r.extracurricular_id WHERE r.id = :id'
        );
        $statement->execute(['id' => $requestId]);

        return $statement->fetch() ?: null;
    }

    // Returns false when someone else answered first
    public function answer(int $requestId, bool $approved, ?int $achievementId, ?string $reason, int $by): bool
    {
        $statement = $this->db->prepare(
            "UPDATE missing_record_requests SET status = :status, achievement_id = :achievement, reason = :reason, answered_by = :by, answered_at = NOW()
             WHERE id = :id AND status = 'pending'"
        );
        $statement->execute(['status' => $approved ? 'approved' : 'rejected', 'achievement' => $achievementId, 'reason' => $reason, 'by' => $by, 'id' => $requestId]);

        return $statement->rowCount() === 1;
    }

    // Marked as answered first, so a second approver gets false and no duplicate achievement is made
    public function approve(int $requestId, int $studentId, array $values, int $by): bool
    {
        return $this->transaction(function () use ($requestId, $studentId, $values, $by): bool
        {
            if (!$this->answer($requestId, true, null, null, $by))
            {
                return false;
            }

            $achievementId = (new AchievementModel())->record(null, $studentId, $values, $by);
            $this->db->prepare('UPDATE missing_record_requests SET achievement_id = :achievement WHERE id = :id')
                ->execute(['achievement' => $achievementId, 'id' => $requestId]);

            return true;
        });
    }

    public function programmesOf(int $studentId): array
    {
        return $this->pairs(
            "SELECT x.id, x.name FROM extracurricular_members em JOIN extracurriculars x ON x.id = em.extracurricular_id
             WHERE em.student_id = :me AND em.status = 'member' AND x.archived_at IS NULL ORDER BY x.name",
            $studentId
        );
    }

    public function classTeacherOf(int $studentId): ?string
    {
        $statement = $this->db->prepare(
            'SELECT p.full_name FROM current_class_students cs JOIN current_class_teachers ct ON ct.class_id = cs.class_id
             JOIN profiles p ON p.account_id = ct.teacher_id WHERE cs.student_id = :id'
        );
        $statement->execute(['id' => $studentId]);

        return $statement->fetchColumn() ?: null;
    }
}
