<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// A mark is from 0 to 100, and a null mark means the student was absent
// Totals, averages, positions and awards are worked out in a service
class TermMarkModel extends Model
{
    public function classOf(int $teacherId): ?array
    {
        $statement = $this->db->prepare(
            'SELECT c.id, c.name, g.sort_order AS grade_number
             FROM current_class_teachers ct JOIN classes c ON c.id = ct.class_id JOIN grades g ON g.id = c.grade_id
             WHERE ct.teacher_id = :me'
        );
        $statement->execute(['me' => $teacherId]);

        return $statement->fetch() ?: null;
    }

    // Retired subjects are left out
    public function subjectsFor(int $gradeNumber): array
    {
        $statement = $this->db->prepare(
            'SELECT ss.id, ss.name FROM stage_subjects ss JOIN stages s ON s.id = ss.stage_id
             WHERE :grade BETWEEN s.first_grade AND s.last_grade AND ss.retired_on IS NULL
             ORDER BY ss.sort_order, ss.name'
        );
        $statement->execute(['grade' => $gradeNumber]);

        return array_column($statement->fetchAll(), 'name', 'id');
    }

    // A student who left after sitting the term still counts
    public function sheet(int $classId, int $year, int $term): array
    {
        $statement = $this->db->prepare(
            "SELECT u.id, p.full_name AS name, p.code, p.photo_url AS photo, sd.admission_date
             FROM class_students cs
             JOIN user_accounts u ON u.id = cs.student_id
             JOIN profiles p ON p.account_id = u.id
             JOIN student_details sd ON sd.account_id = u.id
             WHERE cs.class_id = :class AND cs.year = :year
               AND (u.activation_status <> 'INACTIVE'
                    OR EXISTS (SELECT 1 FROM marks m WHERE m.student_id = u.id AND m.year = :year2 AND m.term = :term))
             ORDER BY p.first_name, p.last_name"
        );
        $statement->execute(['class' => $classId, 'year' => $year, 'year2' => $year, 'term' => $term]);
        $students = [];

        foreach ($statement->fetchAll() as $student)
        {
            $students[$student['id']] = $student + ['marks' => [], 'comment' => ''];
        }

        $in = self::idList(array_keys($students));

        $marks = $this->db->prepare("SELECT student_id, subject_id, mark FROM marks WHERE student_id IN ({$in}) AND year = :year AND term = :term");
        $marks->execute(['year' => $year, 'term' => $term]);

        foreach ($marks->fetchAll() as $row)
        {
            $students[$row['student_id']]['marks'][$row['subject_id']] = $row['mark'];
        }

        $comments = $this->db->prepare("SELECT student_id, comment FROM term_comments WHERE student_id IN ({$in}) AND year = :year AND term = :term");
        $comments->execute(['year' => $year, 'term' => $term]);

        foreach ($comments->fetchAll() as $row)
        {
            $students[$row['student_id']]['comment'] = $row['comment'];
        }

        return $students;
    }

    // Null means the marks are still a draft
    public function publication(int $classId, int $year, int $term): ?array
    {
        $statement = $this->db->prepare('SELECT published_at, published_by FROM term_publications WHERE class_id = :class AND year = :year AND term = :term');
        $statement->execute(['class' => $classId, 'year' => $year, 'term' => $term]);

        return $statement->fetch() ?: null;
    }

    // Once true, the class's students stay in it for the rest of the year
    public function anyPublished(int $classId, int $year): bool
    {
        $statement = $this->db->prepare('SELECT 1 FROM term_publications WHERE class_id = :class AND year = :year LIMIT 1');
        $statement->execute(['class' => $classId, 'year' => $year]);

        return (bool) $statement->fetchColumn();
    }

    // Published marks only, across all the grade's classes