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
    
// The extra lists shown on one page of the directory, such as a student's programmes or a parent's children
    public function rowLists(string $role, array $ids): array
    {
        $lists = array_fill_keys($ids, []);
        $in    = self::idList($ids);   // Whole numbers only

        if ($role === 'student')
        {
            $rows = $this->db->query(
                "SELECT em.student_id AS id, x.name, x.type FROM extracurricular_members em JOIN extracurriculars x ON x.id = em.extracurricular_id
                 WHERE em.status = 'member' AND em.student_id IN ({$in}) ORDER BY x.name"
            );

            foreach ($rows->fetchAll() as $row)
            {
                $lists[$row['id']]['extracurriculars'][] = $row;
            }
        }

        if ($role === 'teacher')
        {
            $rows = $this->db->query(
                "SELECT cst.teacher_id AS id, ss.name AS subject, c.name AS class_name FROM current_subject_teachers cst
                 JOIN stage_subjects ss ON ss.id = cst.subject_id JOIN classes c ON c.id = cst.class_id
                 WHERE cst.teacher_id IN ({$in}) ORDER BY ss.name, LENGTH(c.name), c.name"
            );

            foreach ($rows->fetchAll() as $row)
            {
                $lists[$row['id']]['subjects'][$row['subject']][] = $row['class_name'];
            }

            $homerooms = $this->db->query(
                "SELECT ct.teacher_id AS id, c.name FROM current_class_teachers ct JOIN classes c ON c.id = ct.class_id WHERE ct.teacher_id IN ({$in})"
            );

            foreach ($homerooms->fetchAll() as $row)
            {
                $lists[$row['id']]['homeroom'] = $row['name'];
            }
        }

        if ($role === 'parent')
        {
            $rows = $this->db->query(
                "SELECT sp.parent_account_id AS id, p.full_name AS name, c.name AS class_name FROM student_parents sp
                 JOIN profiles p ON p.account_id = sp.student_account_id
                 LEFT JOIN current_class_students cs ON cs.student_id = p.account_id LEFT JOIN classes c ON c.id = cs.class_id
                 WHERE sp.parent_account_id IN ({$in}) ORDER BY p.first_name"
            );

            foreach ($rows->fetchAll() as $row)
            {
                $lists[$row['id']]['children'][] = $row;
            }
        }

        return $lists;
    }

    // Includes the ids the handover needs
    // If all three lists are empty, there is nothing to hand over
    public function duties(int $teacherId): array
    {
        $find = function (string $sql) use ($teacherId): array
        {
            $statement = $this->db->prepare($sql);
            $statement->execute(['me' => $teacherId]);

            return $statement->fetchAll();
        };

        return [
            'homeroom'         => $find('SELECT c.id, c.name FROM current_class_teachers ct JOIN classes c ON c.id = ct.class_id WHERE ct.teacher_id = :me')[0] ?? null,
            'subjects'         => $find(
                'SELECT cst.class_id, cst.subject_id, c.name AS class_name, ss.name AS subject
                 FROM current_subject_teachers cst
                 JOIN classes c ON c.id = cst.class_id
                 JOIN stage_subjects ss ON ss.id = cst.subject_id
                 WHERE cst.teacher_id = :me
                 ORDER BY ss.name, LENGTH(c.name), c.name'
            ),
            'extracurriculars' => $find(
                'SELECT x.id, x.name, x.type FROM current_teachers_in_charge tic JOIN extracurriculars x ON x.id = tic.extracurricular_id
                 WHERE tic.teacher_id = :me ORDER BY x.name'
            ),
        ];
    }

    public function extracurricularChoices(): array
    {
        return $this->pairs('SELECT id, name FROM extracurriculars ORDER BY name');
    }

    public function subjectChoices(): array
    {
        return $this->db->query('SELECT DISTINCT name FROM stage_subjects ORDER BY name')->fetchAll(PDO::FETCH_COLUMN);
    }

    // Also matches a child's name
    public function searchParents(string $search): array
    {
        $like = self::like($search);

        return $this->parentRows(
            '(p.full_name LIKE :a OR p.code LIKE :b OR u.identifier LIKE :c OR p.phone LIKE :d OR p.national_id LIKE :e
              OR EXISTS (SELECT 1 FROM student_parents sp2 JOIN profiles cp2 ON cp2.account_id = sp2.student_account_id
                         WHERE sp2.parent_account_id = u.id AND cp2.full_name LIKE :f))',
            ['a' => $like, 'b' => $like, 'c' => $like, 'd' => $like, 'e' => $like, 'f' => $like]
        );
    }

    // Null for an unknown or inactive parent
    public function parentRow(int $id): ?array
    {
        return $this->parentRows('u.id = :id', ['id' => $id])[0] ?? null;
    }
