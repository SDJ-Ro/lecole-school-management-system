<?php

declare(strict_types=1);

namespace App\Services;

// In a class teacher picker, a teacher who already has a class is greyed out.
// The page still lets the class being edited keep its own teacher.
final class TeacherChoices
{
    public static function options(array $teachers, bool $forClassTeacher): array
    {
        $options = [['value' => '', 'label' => 'Assignment pending']];

        foreach ($teachers as $id => $teacher)
        {
            $busy      = $forClassTeacher && $teacher['class_name'] !== null;
            $options[] = [
                'value'    => (string) $id,
                'label'    => $teacher['name'],
                'sub'      => $busy ? words('{Class} {teacher} of ') . $teacher['class_name'] : ($teacher['qualification'] ?? ''),
                'disabled' => $busy,
            ];
        }

        return $options;
    }
}
