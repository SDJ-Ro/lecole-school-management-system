<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// Shared by the calendar and the notice board, so both decide who sees what the same way
// A parent gets the groups of the child they are viewing, or else of all their children
class Membership extends Model
{
    public const MY_CLASSES = [
        'student' => 'SELECT class_id FROM current_class_students WHERE student_id = :me',
        'parent'  => 'SELECT cs.class_id FROM student_parents sp JOIN current_class_students cs ON cs.student_id = sp.student_account_id
                      WHERE sp.parent_account_id = :me',
        'teacher' => 'SELECT class_id FROM current_teaching WHERE teacher_id = :me',
    ];

    private const MY_EXTRACURRICULARS = [
        'student' => "SELECT extracurricular_id FROM extracurricular_members WHERE status = 'member' AND student_id = :me",
        'parent'  => "SELECT em.extracurricular_id FROM extracurricular_members em JOIN student_parents sp ON sp.student_account_id = em.student_id
                      WHERE em.status = 'member' AND sp.parent_account_id = :me",
        'teacher' => 'SELECT extracurricular_id FROM current_teachers_in_charge WHERE teacher_id = :me',
    ];

    // Admin and management are in no groups, because they see everything anyway
    public function groupsOf(array $user): array
    {
        if ($user['role'] === 'parent' && ($user['child'] ?? null) !== null)
        {
            $user = ['role' => 'student', 'id' => $user['child']];
        }

        if (!isset(self::MY_CLASSES[$user['role']]))
        {
            return ['class' => [], 'grade' => [], 'extracurricular' => []];
        }

        $classes = array_values(array_unique($this->ids(self::MY_CLASSES[$user['role']], $user['id'])));   // A class the teacher teaches twice counts once

        return [
            'class'           => $classes,
            'grade'           => $classes === [] ? [] : $this->ids('SELECT DISTINCT grade_id FROM classes WHERE id IN (' . self::idList($classes) . ')'),
            'extracurricular' => $this->ids(self::MY_EXTRACURRICULARS[$user['role']], $user['id']),
        ];
    }

    // The same groups as comma lists for an SQL IN check
    public function idListsOf(array $user): array
    {
        return array_map([self::class, 'idList'], $this->groupsOf($user));
    }
}
