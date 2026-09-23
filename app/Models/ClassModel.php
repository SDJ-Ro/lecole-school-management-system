<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// A grade stores only its number
// A class stores its full name, such as 6-A
class ClassModel extends Model
{
    private const STUDENTS = '(SELECT COUNT(*) FROM current_class_students s WHERE s.class_id = c.id)';

    // Empty grades are included too
    public function grades(): array
    {
        $grades = [];

        foreach ($this->db->query('SELECT id, sort_order AS number FROM grades ORDER BY sort_order')->fetchAll() as $grade)
        {
            $grades[$grade['id']] = $grade + ['students' => 0, 'past_students' => 0, 'classes' => []];
        }

        // A class or grade with past students is never deleted
        $classes = $this->db->query(
            'SELECT c.id, c.grade_id, c.name, c.capacity, ct.teacher_id AS class_teacher_id, t.full_name AS class_teacher, ' . self::STUDENTS . ' AS students,
                    (SELECT COUNT(*) FROM class_students s WHERE s.class_id = c.id AND s.year < (SELECT year FROM current_school_year)) AS past_students
             FROM classes c
             JOIN grades g ON g.id = c.grade_id
             LEFT JOIN current_class_teachers ct ON ct.class_id = c.id
             LEFT JOIN profiles t ON t.account_id = ct.teacher_id
             ORDER BY g.sort_order, LENGTH(c.name), c.name'
        )->fetchAll();

        foreach ($classes as $class)
        {
            $grades[$class['grade_id']]['classes'][]       = $class;
            $grades[$class['grade_id']]['students']      += $class['students'];
            $grades[$class['grade_id']]['past_students'] += $class['past_students'];
        }

        return array_values($grades);
    }

    // Past students keep their grade, because their records point to it
    public function findGrade(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT g.id, g.sort_order AS number,
                    (SELECT COUNT(*) FROM current_class_students s JOIN classes c ON c.id = s.class_id WHERE c.grade_id = g.id) AS students,
                    (SELECT COUNT(*) FROM class_students s JOIN classes c ON c.id = s.class_id WHERE c.grade_id = g.id AND s.year < :year) AS past_students
             FROM grades g WHERE g.id = :id'
        );
        $statement->execute(['id' => $id, 'year' => (new SchoolYear())->current()]);

        return $statement->fetch() ?: null;
    }

    // Past students keep their class, because their records point to it
    public function find(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT c.id, c.grade_id, c.name, c.capacity, ct.teacher_id AS class_teacher_id, g.sort_order AS grade_number,
                    ' . self::STUDENTS . ' AS students,
                    (SELECT COUNT(*) FROM class_students s WHERE s.class_id = c.id AND s.year < :year) AS past_students
             FROM classes c
             JOIN grades g ON g.id = c.grade_id
             LEFT JOIN current_class_teachers ct ON ct.class_id = c.id
             WHERE c.id = :id'
        );
        $statement->execute(['id' => $id, 'year' => (new SchoolYear())->current()]);

        return $statement->fetch() ?: null;
    }

    // For each class, the teacher of each subject
    public function subjectTeachers(): array
    {
        $teachers = [];

        foreach ($this->db->query('SELECT class_id, subject_id, teacher_id FROM current_subject_teachers')->fetchAll() as $row)
        {
            $teachers[$row['class_id']][$row['subject_id']] = $row['teacher_id'];
        }

        return $teachers;
    }

    public function subjectsTaughtBy(int $teacherId): array
    {
        $statement = $this->db->prepare(
            'SELECT ss.name AS subject, c.id AS class_id, c.name AS class_name, g.sort_order AS grade_number
             FROM current_subject_teachers st
             JOIN stage_subjects ss ON ss.id = st.subject_id
             JOIN classes c ON c.id = st.class_id
             JOIN grades g ON g.id = c.grade_id
             WHERE st.teacher_id = :me
             ORDER BY ss.name, g.sort_order, c.name'
        );
        $statement->execute(['me' => $teacherId]);

        return $statement->fetchAll();
    }

    // Counts students in every class they teach, as class or subject teacher
    public function studentsTaughtBy(int $teacherId): int
    {
        $statement = $this->db->prepare(
            'SELECT COUNT(DISTINCT cs.student_id) FROM current_teaching t JOIN current_class_students cs ON cs.class_id = t.class_id WHERE t.teacher_id = :me'
        );
        $statement->execute(['me' => $teacherId]);

        return (int) $statement->fetchColumn();
    }

    // Active teachers only, with the class they lead this year if they have one
    public function teachers(): array
    {
        $rows = $this->db->query(
            "SELECT u.id, p.full_name AS name, sd.subjects AS qualification, c.name AS class_name
             FROM user_accounts u
             JOIN profiles p ON p.account_id = u.id
             LEFT JOIN staff_details sd ON sd.account_id = u.id
             LEFT JOIN current_class_teachers ct ON ct.teacher_id = u.id
             LEFT JOIN classes c ON c.id = ct.class_id
             WHERE u.role = 'teacher' AND u.activation_status <> 'INACTIVE'
             ORDER BY p.first_name, p.last_name"
        )->fetchAll();

        return array_column($rows, null, 'id');
    }

    // For each teacher, the subjects and classes they teach and the programmes they run
    public function workloads(): array
    {
        $workloads = [];

        $taught = $this->db->query(
            'SELECT st.teacher_id, ss.name AS subject, c.name AS class_name
             FROM current_subject_teachers st
             JOIN stage_subjects ss ON ss.id = st.subject_id
             JOIN classes c ON c.id = st.class_id
             ORDER BY ss.name, LENGTH(c.name), c.name'
        )->fetchAll();

        foreach ($taught as $row)
        {
            $workloads[$row['teacher_id']]['subjects'][$row['subject']][] = $row['class_name'];
        }

        $inCharge = $this->db->query(
            'SELECT tic.teacher_id, x.name FROM current_teachers_in_charge tic JOIN extracurriculars x ON x.id = tic.extracurricular_id ORDER BY x.name'
        )->fetchAll();

        foreach ($inCharge as $row)
        {
            $workloads[$row['teacher_id']]['extracurriculars'][] = $row['name'];
        }

        return $workloads;
    }

    public function classTeacherOf(int $teacherId, ?int $exceptClassId = null): ?string
    {
        $statement = $this->db->prepare(
            'SELECT c.name FROM current_class_teachers ct JOIN classes c ON c.id = ct.class_id
             WHERE ct.teacher_id = :teacher AND ct.class_id <> :except'
        );
        $statement->execute(['teacher' => $teacherId, 'except' => $exceptClassId ?? 0]);

        return $statement->fetchColumn() ?: null;
    }

    // The different subjects the teacher would teach if they also took this subject in this class
    public function subjectsWith(int $teacherId, int $classId, int $subjectId): array
    {
        $statement = $this->db->prepare(
            'SELECT DISTINCT LOWER(ss.name) FROM stage_subjects ss
             WHERE ss.id = :subject
                OR ss.id IN (SELECT subject_id FROM current_subject_teachers WHERE teacher_id = :teacher AND NOT (class_id = :class AND subject_id = :same))'
        );
        $statement->execute(['subject' => $subjectId, 'teacher' => $teacherId, 'class' => $classId, 'same' => $subjectId]);

        return $statement->fetchAll(\PDO::FETCH_COLUMN);
    }

    }
}
