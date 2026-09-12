<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;
use DomainException;
use PDO;

class PeopleModel extends Model
{
    private const DETAILS_TABLE = [
        'student'    => 'student_details',
        'parent'     => 'parent_details',
        'teacher'    => 'staff_details',
        'management' => 'staff_details',
    ];

    // Fields every role has, and any other field lives in the role's DETAILS_TABLE
    public const PROFILE_COLUMNS = ['first_name', 'last_name', 'date_of_birth', 'gender', 'national_id', 'personal_email',
                                    'phone', 'address', 'emergency_name', 'emergency_phone'];

    public function find(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT u.id, u.identifier, u.role, u.activation_status, u.last_login_at, u.created_at,
                    p.*, cs.class_id, sd.birth_certificate, sd.admission_date, sd.previous_school, sd.blood_group,
                    sd.medical_notes, sd.religion, sd.nationality, sd.address_area, sd.address_district, sd.address_region,
                    c.name AS class_name, g.sort_order AS grade_number, ct.full_name AS class_teacher,
                    pd.relationship, pd.occupation, pd.employer, pd.passport, pd.home_phone, pd.office_phone,
                    st.job_title, st.subjects, st.join_date, st.experience_years,
                    COALESCE(pd.office_address, st.office_address) AS office_address
             FROM user_accounts u
             JOIN profiles p ON p.account_id = u.id
             LEFT JOIN student_details sd ON sd.account_id = u.id
             LEFT JOIN current_class_students cs ON cs.student_id = u.id
             LEFT JOIN classes c ON c.id = cs.class_id
             LEFT JOIN grades g ON g.id = c.grade_id
             LEFT JOIN current_class_teachers cct ON cct.class_id = c.id
             LEFT JOIN profiles ct ON ct.account_id = cct.teacher_id
             LEFT JOIN parent_details pd ON pd.account_id = u.id
             LEFT JOIN staff_details st ON st.account_id = u.id
             WHERE u.id = :id'
        );
        $statement->execute(['id' => $id]);
        $person = $statement->fetch();

        if ($person === false)
        {
            return null;
        }

        $person['parents']        = $this->linked('student_account_id', 'parent_account_id', $id);
        $person['children']       = $this->linked('parent_account_id', 'student_account_id', $id);
        $person['qualifications'] = $person['role'] === 'teacher' ? $this->qualifications($id) : [];

        return $person;
    }

    // Returns one page of rows and the total count
    // Every filter is optional, and some only apply to one role
    public function directory(string $role, array $filters, int $page, int $perPage): array
    {
        $where  = ['u.role = :role'];
        $params = ['role' => $role];

        if (($filters['q'] ?? '') !== '')
        {
            $where[] = '(p.full_name LIKE :q OR p.code LIKE :q2 OR u.identifier LIKE :q3)';
            $params += ['q' => self::like($filters['q']), 'q2' => self::like($filters['q']), 'q3' => self::like($filters['q'])];
        }

        // The on status includes accounts added but not activated yet
        if (($filters['status'] ?? '') !== '')
        {
            $where[] = $filters['status'] === 'off' ? "u.activation_status = 'INACTIVE'" : "u.activation_status <> 'INACTIVE'";
        }

        if ($role === 'student' && ($filters['class_id'] ?? null) !== null)
        {
            $where[]            = 'cs.class_id = :class_id';
            $params['class_id'] = $filters['class_id'];
        }

        if ($role === 'student' && ($filters['grade_id'] ?? null) !== null)
        {
            $where[]            = 'c.grade_id = :grade_id';
            $params['grade_id'] = $filters['grade_id'];
        }

        if ($role === 'student' && ($filters['extracurricular_id'] ?? null) !== null)
        {
            $where[]                   = "u.id IN (SELECT student_id FROM extracurricular_members WHERE extracurricular_id = :extracurricular AND status = 'member')";
            $params['extracurricular'] = $filters['extracurricular_id'];
        }

        if ($role === 'student' && ($filters['teacher_id'] ?? null) !== null)
        {
            $where[]           = 'cs.class_id IN (SELECT class_id FROM current_teaching WHERE teacher_id = :teacher)';
            $params['teacher'] = $filters['teacher_id'];
        }

        // A subject they teach this year, or one they are qualified to teach
        if ($role === 'teacher' && ($filters['subject'] ?? '') !== '')
        {
            $where[]            = '(u.id IN (SELECT cst.teacher_id FROM current_subject_teachers cst JOIN stage_subjects ss ON ss.id = cst.subject_id
                                             WHERE ss.name = :subject) OR st.subjects LIKE :subject2)';
            $params['subject']  = $filters['subject'];
            $params['subject2'] = self::like($filters['subject']);
        }

        if ($role === 'parent' && ($filters['relationship'] ?? '') !== '')
        {
            $where[]                = 'pd.relationship = :relationship';
            $params['relationship'] = $filters['relationship'];
        }

        $from = 'FROM user_accounts u
                 JOIN profiles p ON p.account_id = u.id
                 LEFT JOIN current_class_students cs ON cs.student_id = u.id
                 LEFT JOIN classes c ON c.id = cs.class_id
                 LEFT JOIN parent_details pd ON pd.account_id = u.id
                 LEFT JOIN staff_details st ON st.account_id = u.id
                 WHERE ' . implode(' AND ', $where);

        $count = $this->db->prepare("SELECT COUNT(*) {$from}");
        $count->execute($params);

        // A student's row shows their primary parent
        $parent = 'SELECT pp.%s FROM student_parents sp JOIN profiles pp ON pp.account_id = sp.parent_account_id
                   WHERE sp.student_account_id = u.id ORDER BY sp.is_primary DESC LIMIT 1';
        $rows   = $this->db->prepare(
            "SELECT u.id, u.identifier, u.activation_status, u.closed_on, p.code, p.full_name, p.first_name, p.last_name,
                    p.personal_email, p.phone, p.photo_url, c.name AS class_name, pd.relationship, st.job_title, st.subjects,
                    (SELECT l.leaving_on FROM leave_requests l WHERE l.student_id = u.id AND l.status = 'approved' LIMIT 1) AS leaving_on,
                    (" . sprintf($parent, 'personal_email') . ") AS parent_email,
                    (" . sprintf($parent, 'full_name') . ") AS parent_name,
                    (" . sprintf($parent, 'phone') . ") AS parent_phone
             {$from}
             ORDER BY p.first_name, p.last_name
             LIMIT :limit OFFSET :offset"
        );

        foreach ($params as $key => $value)
        {
            $rows->bindValue($key, $value);
        }

        $rows->bindValue('limit', $perPage, PDO::PARAM_INT);              // LIMIT needs a real number, not text
        $rows->bindValue('offset', ($page - 1) * $perPage, PDO::PARAM_INT);
        $rows->execute();

        return [$rows->fetchAll(), (int) $count->fetchColumn()];
    }
