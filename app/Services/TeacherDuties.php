<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PeopleModel;

// A teacher's duties this year decide which tabs they see
final class TeacherDuties
{
    private static array $known = [];   // Each teacher is worked out once per page

    public static function of(int $teacherId): array
    {
        if (!isset(self::$known[$teacherId]))
        {
            $duties = (new PeopleModel())->duties($teacherId);

            self::$known[$teacherId] = array_keys(array_filter([
                'class_teacher'   => $duties['homeroom'] !== null,
                'subject_teacher' => $duties['subjects'] !== [],
                'in_charge'       => $duties['extracurriculars'] !== [],
            ]));
        }

        return self::$known[$teacherId];
    }
}
