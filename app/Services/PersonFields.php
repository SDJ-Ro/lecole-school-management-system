<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ClassModel;
use App\Models\PeopleModel;
use DateTime;

// The person detail rules shared by the Edit Profile and Add forms
final class PersonFields
{
    // $required lists fields this form needs even when the field itself is optional
    public static function rules(array $fields, array $required = []): array
    {
        $rules = [];

        foreach ($fields as $field)
        {
            $own           = config('people.fields')[$field][1];
            $rules[$field] = in_array($field, $required, true) && !str_contains($own, 'required') ? rtrim("required|{$own}", '|') : $own;
        }

        return array_filter($rules, fn (string $rule): bool => $rule !== '');   // A photo has no text rules
    }

    // "Not given" is only offered when the field may stay empty.
    // A full class is greyed out, except the person's own class.
    public static function options(string $field, ?int $ownClassId = null, bool $required = false): array
    {
        [$box, $rules] = config('people.fields')[$field];
        $options       = [];

        if ($box === 'choice')
        {
            preg_match('/(?:^|\|)in:([^|]*)/', $rules, $list);
            $options = array_merge($required || str_contains($rules, 'required') ? [] : [['value' => '', 'label' => 'Not given']], explode(',', $list[1]));
        }

        if ($box === 'class')
        {
            foreach ((new ClassModel())->grades() as $grade)
            {
                foreach ($grade['classes'] as $class)
                {
                    $full      = $class['students'] >= $class['capacity'] && (int) $class['id'] !== $ownClassId;
                    $options[] = ['value' => (string) $class['id'], 'label' => $class['name'], 'sub' => $full ? 'Full' : '', 'disabled' => $full];
                }
            }
        }

        return $options;
    }

    // The allowed age range. A student's range comes from the grades, and "Unlock age range" lifts it.
    public static function ages(string $role): array
    {
        if ($role !== 'student')
        {
            return config("people.ages.{$role}");
        }

        $grades = config('white_label.academic.grade_numbers');
        $age    = rule('student_age');

        return ['min' => $grades['first'] + $age['offset'] - $age['range'], 'max' => $grades['last'] + $age['offset'] + $age['range']];
    }

    // Checks that need more than one field or the database.
    // $id is the person being edited, or 0 for someone new.
    // $agesUnlocked allows a rare age, but the date of birth must still be in the past.
    public static function problems(string $role, int $id, array $values, PeopleModel $people, bool $agesUnlocked = false): array
    {
        $today    = date('Y-m-d');
        $value    = fn (string $field): string => $values[$field] ?? '';
        $birth    = $value('date_of_birth');
        $age      = $birth === '' ? null : (new DateTime($birth))->diff(new DateTime($today))->y;
        $ages     = self::ages($role);
        $idLabel  = country('national_id.label');
        $email    = strtolower($value('personal_email'));
        $problems = [];

        if ($birth !== '' && $birth >= $today)
        {
            $problems[] = 'Date of birth must be in the past.';
        }
        elseif (!$agesUnlocked && $age !== null && ($age < $ages['min'] || $age > ($ages['max'] ?? $age)))
        {
            $problems[] = 'Date of birth: the age must be ' . (isset($ages['max']) ? "{$ages['min']}–{$ages['max']}" : "at least {$ages['min']}")
                . '. For a rare case, tick "Unlock age range".';
        }

        if (in_array($role, config('people.national_id_required'), true) && $value('national_id') === '')
        {
            $problems[] = "{$idLabel} is required.";
        }

        if (in_array($role, config('people.national_id_or_passport'), true) && $value('national_id') === '' && $value('passport') === '')
        {
            $problems[] = "Please give a {$idLabel} or a passport number.";
        }

        if ($value('national_id') !== '' && $people->nationalIdTaken($value('national_id'), $id))
        {
            $problems[] = "That {$idLabel} is already registered to someone else.";
        }

        if ($value('birth_certificate') !== '' && $people->birthCertificateTaken($value('birth_certificate'), $id))
        {
            $problems[] = 'That birth certificate number is already registered.';
        }

        // A parent signs in with their email, so for them it is checked against the sign-in names
        if ($email !== '' && ($role === 'parent' ? $people->identifierTaken($email, $id) : $people->personalEmailTaken($email, $id)))
        {
            $problems[] = 'That email is already used by another account.';
        }

        // Staff get mail at their personal email, so it can't be the school's own address
        if ($email !== '' && $role !== 'parent' && str_ends_with($email, '@' . school('email_domain')))
        {
            $problems[] = 'Please give a personal email, not one of the ' . strtolower(word('institution')) . "'s.";
        }

        if ($value('emergency_phone') !== '' && preg_replace('/\D/', '', $value('emergency_phone')) === preg_replace('/\D/', '', $value('phone')))
        {
            $problems[] = "The emergency contact must be someone else's number.";
        }

        if ($value('experience_years') !== '' && $age !== null && (int) $value('experience_years') > max(0, $age - 18))
        {
            $problems[] = 'Experience can be at most ' . max(0, $age - 18) . ' years at this age.';
        }

        if ($value('join_date') !== '' && $value('join_date') > date('Y-m-d', strtotime('+' . config('people.join_months_ahead') . ' months')))
        {
            $problems[] = 'Join date can be at most ' . config('people.join_months_ahead') . ' months ahead.';
        }

        if ($value('join_date') !== '' && $birth !== '' && $value('join_date') < date('Y-m-d', strtotime("{$birth} +18 years")))
        {
            $problems[] = 'Join date must be after their 18th birthday.';
        }

        if ($value('admission_date') !== '' && ($value('admission_date') > $today || $value('admission_date') < $birth))
        {
            $problems[] = 'Admission date must be between the date of birth and today.';
        }

        if ($value('class_id') !== '' && (new ClassModel())->find((int) $value('class_id')) === null)
        {
            $problems[] = 'Please choose a ' . strtolower(word('class')) . ' from the list.';
        }

        return $problems;
    }

    // Returns the filled-in rows, and an error message or null
    public static function qualifications(array $degrees, array $institutions, array $years): array
    {
        $rows = [];

        foreach ($degrees as $index => $degree)
        {
            $row = ['degree' => trim($degree), 'institution' => trim($institutions[$index] ?? ''), 'year_obtained' => trim($years[$index] ?? '')];

            if ($row['degree'] === '' && $row['institution'] === '' && $row['year_obtained'] === '')
            {
                continue;
            }

            if ($row['degree'] === '' || mb_strlen($row['degree']) > 150 || mb_strlen($row['institution']) > 150)
            {
                return [[], 'Each qualification needs its name (150 characters at most), and the institution 150 at most.'];
            }

            if ($row['year_obtained'] !== '' && (!ctype_digit($row['year_obtained']) || (int) $row['year_obtained'] < 1950 || (int) $row['year_obtained'] > (int) date('Y')))
            {
                return [[], 'A qualification year must be between 1950 and ' . date('Y') . '.'];
            }

            $rows[] = $row;
        }

        return [$rows, null];
    }
}
