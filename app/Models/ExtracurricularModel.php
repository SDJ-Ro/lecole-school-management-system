<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// A programme made by management waits for the admin, but the admin's own is approved at once
// A rejected programme is removed
// An approved programme is never deleted, only archived with its history kept, and it can be restored
// A join request first waits for a parent to say yes
// After that, a student the school asked becomes a member at once
// A student who asked to join waits for the teacher in charge next
class ExtracurricularModel extends Model
{
    // Only these names reach the SQL
    private const COLUMNS = ['name', 'type', 'category', 'description', 'cover_url', 'coach_name', 'coach_specialty', 'coach_email',
        'coach_phone', 'schedule', 'venue', 'age_group_limit', 'uses_age_groups', 'open_to', 'lowest_grade', 'is_open'];

    // tic_email is the teacher's sign-in identifier
    private const SELECT = 'SELECT x.*, tic.teacher_id AS tic_id, t.full_name AS tic_name, t.photo_url AS tic_photo, tu.identifier AS tic_email,
                                   t.phone AS tic_phone, ts.subjects AS tic_subjects
                            FROM extracurriculars x
                            LEFT JOIN current_teachers_in_charge tic ON tic.extracurricular_id = x.id
                            LEFT JOIN profiles t ON t.account_id = tic.teacher_id
                            LEFT JOIN user_accounts tu ON tu.id = tic.teacher_id
                            LEFT JOIN staff_details ts ON ts.account_id = tic.teacher_id';

    public function all(bool $withWaiting, bool $archived): array
    {
        return $this->db->query(self::SELECT
            . ' WHERE x.archived_at IS ' . ($archived ? 'NOT NULL' : 'NULL')
            . ($withWaiting ? '' : " AND x.review = 'approved'")
            . ' ORDER BY x.name')->fetchAll();
    }

    public function find(int $id): ?array
    {
        $statement = $this->db->prepare(self::SELECT . ' WHERE x.id = :id');
        $statement->execute(['id' => $id]);

        return $statement->fetch() ?: null;
    }

    public function runBy(int $teacherId): array
    {
        $statement = $this->db->prepare(
            'SELECT x.id, x.name FROM current_teachers_in_charge tic JOIN extracurriculars x ON x.id = tic.extracurricular_id
             WHERE tic.teacher_id = :me AND x.archived_at IS NULL ORDER BY x.name'
        );
        $statement->execute(['me' => $teacherId]);

        return $statement->fetchAll();
    }

    // The student's membership row for each programme
    public function statesOf(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT extracurricular_id, status, declined_by, parent_note, teacher_note, joined_on
             FROM extracurricular_members WHERE student_id = :id'
        );
        $statement->execute(['id' => $studentId]);

        return array_column($statement->fetchAll(), null, 'extracurricular_id');
    }

    // The status 'teacher' gives the requests waiting for the teacher in charge
    public function people(int $id, string $status): array
    {
        $statement = $this->db->prepare(
            'SELECT u.id, p.full_name AS name, p.code, p.photo_url AS photo, p.date_of_birth, g.sort_order AS grade_number,
                    m.joined_on, COALESCE(m.parent_answered_at, m.updated_at) AS asked_on
             FROM extracurricular_members m
             JOIN user_accounts u ON u.id = m.student_id
             JOIN profiles p ON p.account_id = u.id
             LEFT JOIN current_class_students cs ON cs.student_id = u.id
             LEFT JOIN classes c ON c.id = cs.class_id
             LEFT JOIN grades g ON g.id = c.grade_id
             WHERE m.extracurricular_id = :id AND m.status = :status
             ORDER BY p.first_name, p.last_name'
        );
        $statement->execute(['id' => $id, 'status' => $status]);

        return $statement->fetchAll();
    }

    // The members' dates of birth for each programme, used to count age groups
    public function memberBirthdays(): array
    {
        $birthdays = [];

        foreach ($this->db->query("SELECT m.extracurricular_id, p.date_of_birth FROM extracurricular_members m
                                   JOIN profiles p ON p.account_id = m.student_id WHERE m.status = 'member'")->fetchAll() as $row)
        {
            $birthdays[$row['extracurricular_id']][] = $row['date_of_birth'];
        }

        return $birthdays;
    }

    // Running programmes and members only
    public function classActivity(int $classId): array
    {
        $statement = $this->db->prepare(
            "SELECT
                SUM(sport > 0 AND club = 0) AS sports, SUM(club > 0 AND sport = 0) AS clubs, SUM(sport > 0 AND club > 0) AS both_kinds,
                SUM(sport = 0 AND club = 0) AS none_of_them
             FROM (SELECT cs.student_id,
                          COUNT(CASE WHEN x.type = 'sport' THEN 1 END) AS sport, COUNT(CASE WHEN x.type = 'club' THEN 1 END) AS club
                   FROM current_class_students cs
                   LEFT JOIN extracurricular_members m ON m.student_id = cs.student_id AND m.status = 'member'
                   LEFT JOIN extracurriculars x ON x.id = m.extracurricular_id AND x.review = 'approved' AND x.archived_at IS NULL
                   WHERE cs.class_id = :class
                   GROUP BY cs.student_id) AS kinds"
        );
        $statement->execute(['class' => $classId]);
        $row = $statement->fetch();

        return ['Sports only' => (int) $row['sports'], 'Clubs only' => (int) $row['clubs'], 'Both' => (int) $row['both_kinds'], 'None' => (int) $row['none_of_them']];
    }

    public function classProgrammes(int $classId): array
    {
        $statement = $this->db->prepare(
            "SELECT x.name, COUNT(*) AS members
             FROM current_class_students cs
             JOIN extracurricular_members m ON m.student_id = cs.student_id AND m.status = 'member'
             JOIN extracurriculars x ON x.id = m.extracurricular_id AND x.review = 'approved' AND x.archived_at IS NULL
             WHERE cs.class_id = :class
             GROUP BY x.id, x.name ORDER BY members DESC, x.name"
        );
        $statement->execute(['class' => $classId]);

        return $statement->fetchAll();
    }

    // Students still in a programme or waiting to join, although their leaving date has passed
    public function membersWhoLeft(): array
    {
        return array_map('intval', $this->db->query(
            "SELECT DISTINCT m.student_id FROM extracurricular_members m
             JOIN leave_requests l ON l.student_id = m.student_id AND l.status = 'approved' AND l.leaving_on <= CURDATE()"
        )->fetchAll(\PDO::FETCH_COLUMN));
    }

    // Requests waiting for any parent of their children, plus the ones this parent already answered
    public function forParent(int $parentId): array
    {
        $statement = $this->db->prepare(
            "SELECT m.extracurricular_id, m.student_id, m.status, m.requested_by, m.parent_note, m.declined_by, m.teacher_note, m.updated_at,
                    m.parent_answered_at, x.name AS extracurricular_name, x.description, x.schedule,
                    t.full_name AS teacher_name, s.full_name AS student_name
             FROM extracurricular_members m
             JOIN student_parents sp ON sp.student_account_id = m.student_id AND sp.parent_account_id = :parent
             JOIN extracurriculars x ON x.id = m.extracurricular_id
             JOIN profiles s ON s.account_id = m.student_id
             LEFT JOIN current_teachers_in_charge tic ON tic.extracurricular_id = x.id
             LEFT JOIN profiles t ON t.account_id = tic.teacher_id
             WHERE m.status = 'parent' OR m.parent_id = :answeredBy
             ORDER BY COALESCE(m.parent_answered_at, m.updated_at) DESC"
        );
        $statement->execute(['parent' => $parentId, 'answeredBy' => $parentId]);

        return $statement->fetchAll();
    }
    }
}