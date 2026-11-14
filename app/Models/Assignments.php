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

    // A student admitted after the last term is placed for next year
    public function placeStudent(int $studentId, int $classId, ?int $year = null): void
    {
        $this->db->prepare(
            'INSERT INTO class_students (year, student_id, class_id) VALUES (:year, :student, :class)
             ON DUPLICATE KEY UPDATE class_id = VALUES(class_id)'
        )->execute(['year' => $year ?? $this->currentYear(), 'student' => $studentId, 'class' => $classId]);
    }

    public function setClassTeacher(int $classId, ?int $teacherId): void
    {
        $this->save('class_teachers', ['class_id' => $classId], $teacherId);
    }

    public function setSubjectTeacher(int $classId, int $subjectId, ?int $teacherId): void
    {
        $this->save('subject_teachers', ['class_id' => $classId, 'subject_id' => $subjectId], $teacherId);
    }

    public function setTeacherInCharge(int $extracurricularId, ?int $teacherId): void
    {
        $this->save('teachers_in_charge', ['extracurricular_id' => $extracurricularId], $teacherId);
    }

    // With no teacher given, the row is removed
    // The table and column names come from our own code, never from a form
    private function save(string $table, array $where, ?int $teacherId): void
    {
        $where   += ['year' => $this->currentYear()];
        $columns  = array_keys($where);
        $match    = implode(' AND ', array_map(fn (string $column): string => "{$column} = :{$column}", $columns));

        $this->transaction(function () use ($table, $where, $columns, $match, $teacherId): void
        {
            $this->db->prepare("DELETE FROM {$table} WHERE {$match}")->execute($where);

            if ($teacherId !== null)
            {
                $this->db->prepare("INSERT INTO {$table} (" . implode(', ', $columns) . ', teacher_id) VALUES (:' . implode(', :', $columns) . ', :teacher)')
                    ->execute($where + ['teacher' => $teacherId]);
            }
        });
    }

    public function yearStarted(int $year): bool
    {
        $statement = $this->db->prepare('SELECT 1 FROM year_ends WHERE year = :year');
        $statement->execute(['year' => $year]);

        return (bool) $statement->fetchColumn();
    }

    // The year_ends row is claimed first, so a second request at the same moment does nothing
    // Returns false when the year has already been started
    public function startYear(int $year, callable $work): bool
    {
        return $this->transaction(function () use ($year, $work): bool
        {
            $claim = $this->db->prepare('INSERT IGNORE INTO year_ends (year) VALUES (:year)');
            $claim->execute(['year' => $year]);

            if ($claim->rowCount() === 0)
            {
                return false;
            }

            $counts = $work();
            $this->db->prepare('UPDATE year_ends SET promoted = :promoted, held_back = :held, graduated = :graduated WHERE year = :year')
                ->execute(['promoted' => $counts['promoted'], 'held' => $counts['held_back'], 'graduated' => $counts['graduated'], 'year' => $year]);

            return true;
        });
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

    // Teachers already set for this year by hand are kept
    // Inactive teachers are not copied, so their place stays empty
    public function carryOverTeachers(int $from): void
    {
        $to     = $this->currentYear();
        $active = "teacher_id NOT IN (SELECT id FROM user_accounts WHERE activation_status = 'INACTIVE')";

        $this->db->prepare("INSERT IGNORE INTO class_teachers (year, class_id, teacher_id) SELECT :to, class_id, teacher_id FROM class_teachers WHERE year = :from AND {$active}")
            ->execute(['to' => $to, 'from' => $from]);
        $this->db->prepare("INSERT IGNORE INTO subject_teachers (year, class_id, subject_id, teacher_id) SELECT :to, class_id, subject_id, teacher_id FROM subject_teachers WHERE year = :from AND {$active}")
            ->execute(['to' => $to, 'from' => $from]);
        $this->db->prepare("INSERT IGNORE INTO teachers_in_charge (year, extracurricular_id, teacher_id) SELECT :to, extracurricular_id, teacher_id FROM teachers_in_charge WHERE year = :from AND {$active}")
            ->execute(['to' => $to, 'from' => $from]);
    }
}
