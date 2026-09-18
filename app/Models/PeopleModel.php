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

    // No account closes before its certificate is issued
    // The caller then checks each leaving or graduating day
    public function closingDue(string $issuedBy): array
    {
        $statement = $this->db->prepare(
            "SELECT u.id FROM user_accounts u JOIN certificates c ON c.student_id = u.id AND c.status = 'issued'
             WHERE u.role = 'student' AND u.closed_on IS NULL AND u.activation_status <> 'INACTIVE' AND DATE(c.issued_at) <= :issued"
        );
        $statement->execute(['issued' => $issuedBy]);

        return array_map('intval', $statement->fetchAll(PDO::FETCH_COLUMN));
    }
//309-333
// A parent with active children cannot be switched off, so every student keeps an active parent
    public function activeChildren(int $parentId): int
    {
        $statement = $this->db->prepare(
            "SELECT COUNT(*) FROM student_parents sp JOIN user_accounts u ON u.id = sp.student_account_id
             WHERE sp.parent_account_id = :parent AND u.activation_status <> 'INACTIVE'"
        );
        $statement->execute(['parent' => $parentId]);

        return (int) $statement->fetchColumn();
    }

    // The number of active accounts for each role
    public function activeCounts(): array
    {
        return $this->db->query("SELECT role, COUNT(*) FROM user_accounts WHERE activation_status = 'ACTIVE' GROUP BY role")->fetchAll(PDO::FETCH_KEY_PAIR);
    }

    // The first name of each account
    public function childrenOf(int $parentId): array
    {
        return $this->pairs('SELECT p.account_id, p.first_name FROM student_parents sp
            JOIN profiles p ON p.account_id = sp.student_account_id WHERE sp.parent_account_id = :me ORDER BY p.first_name', $parentId);
    }
//355-466
public function teaching(int $teacherId): array
    {
        $statement = $this->db->prepare(
            'SELECT c.name, ct.class_id IS NOT NULL AS is_mine
             FROM current_teaching t
             JOIN classes c ON c.id = t.class_id
             LEFT JOIN current_class_teachers ct ON ct.class_id = t.class_id AND ct.teacher_id = t.teacher_id
             WHERE t.teacher_id = :me
             ORDER BY c.name'
        );
        $statement->execute(['me' => $teacherId]);
        $classes = $statement->fetchAll();

        return [
            'homeroom' => array_column(array_filter($classes, fn (array $class): bool => (bool) $class['is_mine']), 'name')[0] ?? null,
            'classes'  => array_values(array_unique(array_column($classes, 'name'))),
        ];
    }

    // The programmes a teacher runs, or the ones a student is a member of
    public function extracurriculars(array $person): array
    {
        $sql = $person['role'] === 'teacher'
            ? 'SELECT x.type, x.name FROM current_teachers_in_charge tic JOIN extracurriculars x ON x.id = tic.extracurricular_id WHERE tic.teacher_id = :me ORDER BY x.name'
            : "SELECT x.type, x.name FROM extracurriculars x JOIN extracurricular_members em ON em.extracurricular_id = x.id
               WHERE em.student_id = :me AND em.status = 'member' ORDER BY x.name";
        $statement = $this->db->prepare($sql);
        $statement->execute(['me' => $person['id']]);
        $names = ['sport' => [], 'club' => []];

        foreach ($statement->fetchAll() as $extracurricular)
        {
            $names[$extracurricular['type']][] = $extracurricular['name'];
        }

        return $names;
    }

    // The position field lists their teams and positions, if they have any
    public function memberships(int $studentId): array
    {
        $statement = $this->db->prepare(
            "SELECT x.name, x.type, em.status, em.joined_on,
                    (SELECT GROUP_CONCAT(CONCAT(t.name, IFNULL(CONCAT(' · ', tm.position), '')) ORDER BY t.name SEPARATOR ', ')
                     FROM team_members tm JOIN teams t ON t.id = tm.team_id
                     WHERE t.extracurricular_id = x.id AND tm.student_id = em.student_id) AS position
             FROM extracurricular_members em JOIN extracurriculars x ON x.id = em.extracurricular_id
             WHERE em.student_id = :id ORDER BY x.name"
        );
        $statement->execute(['id' => $studentId]);

        return $statement->fetchAll();
    }

    // Ended programme memberships and team positions, kept for the character certificate
    public function pastMemberships(int $studentId): array
    {
        $statement = $this->db->prepare(
            "SELECT x.name, h.joined_on AS from_on, h.left_on AS to_on FROM extracurricular_member_history h
             JOIN extracurriculars x ON x.id = h.extracurricular_id WHERE h.student_id = :id
             UNION ALL
             SELECT CONCAT(h.position, ', ', h.team_name, ' — ', x.name), h.from_on, h.to_on FROM team_member_history h
             JOIN extracurriculars x ON x.id = h.extracurricular_id WHERE h.student_id = :id2 AND h.position IS NOT NULL
             ORDER BY from_on"
        );
        $statement->execute(['id' => $studentId, 'id2' => $studentId]);

        return $statement->fetchAll();
    }

    // As class teacher or for a subject in their class
    public function teaches(int $teacherId, int $studentId): bool
    {
        $statement = $this->db->prepare(
            'SELECT 1 FROM current_class_students cs JOIN current_teaching t ON t.class_id = cs.class_id
             WHERE cs.student_id = :student AND t.teacher_id = :teacher'
        );
        $statement->execute(['student' => $studentId, 'teacher' => $teacherId]);

        return $statement->fetchColumn() !== false;
    }

    public function isClassTeacherOf(int $teacherId, int $studentId): bool
    {
        $statement = $this->db->prepare(
            'SELECT 1 FROM current_class_students cs JOIN current_class_teachers ct ON ct.class_id = cs.class_id
             WHERE cs.student_id = :student AND ct.teacher_id = :teacher'
        );
        $statement->execute(['student' => $studentId, 'teacher' => $teacherId]);

        return $statement->fetchColumn() !== false;
    }

    public function qualifications(int $teacherId): array
    {
        $statement = $this->db->prepare('SELECT degree, institution, year_obtained FROM staff_qualifications WHERE account_id = :id ORDER BY sort_order, id');
        $statement->execute(['id' => $teacherId]);

        return $statement->fetchAll();
    }

    // Adds a PENDING account with no password, which they activate on the sign-up page
    // A student added after this year's last term is placed for next year
    public function add(string $role, array $profile, array $details, ?int $parentId = null, array $qualifications = []): int
    {
        return $this->transaction(function () use ($role, $profile, $details, $parentId, $qualifications): int
        {
            $assignments = new Assignments();
            $classId     = $role === 'student' ? (int) $details['class_id'] : null;
            $year        = (new SchoolYear())->placementYear();
            unset($details['class_id']);   // The class is a place, not a detail

        //471-517
        
            // Students sign in with their code, staff with a school email and parents with their own email
            $identifier = match ($role)
            {
                'student' => 'new-' . bin2hex(random_bytes(6)),   // Replaced by the real code below, once the id is known
                'parent'  => strtolower($profile['personal_email']),
                default   => $this->schoolEmail($profile['first_name'], $profile['last_name']),
            };

            $this->db->prepare("INSERT INTO user_accounts (identifier, role, activation_status) VALUES (:identifier, :role, 'PENDING')")
                ->execute(['identifier' => $identifier, 'role' => $role]);

            $id   = (int) $this->db->lastInsertId();
            $code = $this->code($role, $id);

            if ($role === 'student')
            {
                $this->db->prepare('UPDATE user_accounts SET identifier = :code WHERE id = :id')->execute(['code' => $code, 'id' => $id]);
            }

            $this->insert('profiles', ['account_id' => $id, 'code' => $code] + $profile);
            $this->insert(self::DETAILS_TABLE[$role], ['account_id' => $id] + $details);
            $this->saveQualifications($id, $qualifications);

            if ($classId !== null)
            {
                $assignments->placeStudent($id, $classId, $year);
                $this->db->prepare('INSERT INTO student_parents (student_account_id, parent_account_id, is_primary) VALUES (:student, :parent, 1)')
                    ->execute(['student' => $id, 'parent' => $parentId]);
            }

            return $id;
        });
    }

    // Returns the new student id and parent id
    public function addStudentWithNewParent(array $student, array $studentDetails, array $parent, array $parentDetails): array
    {
        return $this->transaction(function () use ($student, $studentDetails, $parent, $parentDetails): array
        {
            $parentId  = $this->add('parent', $parent, $parentDetails);
            $studentId = $this->add('student', $student, $studentDetails, $parentId);

            return [$studentId, $parentId];
        });
    }
//573-599
// Each duty goes to the teacher taking it over, or to nobody yet
    // Then the account is switched off
    public function handOver(int $teacherId, array $duties): void
    {
        $this->transaction(function () use ($teacherId, $duties): void
        {
            $assignments = new Assignments();

            if ($duties['homeroom'] !== null)
            {
                $assignments->setClassTeacher((int) $duties['homeroom']['id'], $duties['homeroom']['to']);
            }

            foreach ($duties['subjects'] as $subject)
            {
                $assignments->setSubjectTeacher((int) $subject['class_id'], (int) $subject['subject_id'], $subject['to']);
            }

            foreach ($duties['extracurriculars'] as $extracurricular)
            {
                $assignments->setTeacherInCharge((int) $extracurricular['id'], $extracurricular['to']);
            }

            $this->switchAccount($teacherId, false);
        });
    }
 //632-654
 private function code(string $role, int $id): string
    {
        $format = config("white_label.academic.id_formats.{$role}", strtoupper(substr($role, 0, 3)) . '-{year}-{number}');

        return str_replace(['{year}', '{number}'], [date('Y'), str_pad((string) $id, 4, '0', STR_PAD_LEFT)], $format);
    }

    // Made from the first and last name, with a number added when it is taken
    private function schoolEmail(string $firstName, string $lastName): string
    {
        $tidy   = fn (string $name): string => preg_replace('/[^a-z]/', '', strtolower($name));
        $base   = $tidy($firstName) . '_' . $tidy($lastName);
        $domain = school('email_domain');
        $email  = "{$base}@{$domain}";

        for ($number = 2; $this->identifierTaken($email); $number++)
        {
            $email = "{$base}{$number}@{$domain}";
        }

        return $email;
    }
//669-732
// A student's parents or a parent's children
    // Both column names are fixed in this file, never from a form
    private function linked(string $myColumn, string $theirColumn, int $id): array
    {
        $statement = $this->db->prepare(
            "SELECT u.id, u.identifier, u.role, u.activation_status, p.code, p.first_name, p.full_name, p.phone, p.emergency_phone,
                    c.name AS class_name
             FROM student_parents link
             JOIN user_accounts u ON u.id = link.{$theirColumn}
             JOIN profiles p ON p.account_id = u.id
             LEFT JOIN current_class_students cs ON cs.student_id = u.id
             LEFT JOIN classes c ON c.id = cs.class_id
             WHERE link.{$myColumn} = :id
             ORDER BY link.is_primary DESC, p.full_name"
        );
        $statement->execute(['id' => $id]);

        return $statement->fetchAll();
    }

    // A typed % or _ is matched literally, not as a wildcard
    private static function like(string $text): string
    {
        return '%' . addcslashes($text, '%_\\') . '%';
    }

    // The where text is fixed in this file, never from a form
    private function parentRows(string $where, array $params): array
    {
        $statement = $this->db->prepare(
            "SELECT u.id, u.identifier, p.code, p.full_name, p.phone, pd.relationship,
                    (SELECT GROUP_CONCAT(CONCAT(cp.full_name, ' (', COALESCE(c.name, '—'), ')') ORDER BY cp.full_name SEPARATOR ', ')
                     FROM student_parents sp JOIN profiles cp ON cp.account_id = sp.student_account_id
                     LEFT JOIN current_class_students cs ON cs.student_id = sp.student_account_id LEFT JOIN classes c ON c.id = cs.class_id
                     WHERE sp.parent_account_id = u.id) AS children
             FROM user_accounts u
             JOIN profiles p ON p.account_id = u.id
             JOIN parent_details pd ON pd.account_id = u.id
             WHERE u.role = 'parent' AND u.activation_status <> 'INACTIVE' AND {$where}
             ORDER BY p.full_name
             LIMIT 20"
        );
        $statement->execute($params);

        return $statement->fetchAll();
    }

    private function switchAccount(int $id, bool $active): void
    {
        $this->db->prepare(
            "UPDATE user_accounts
             SET activation_status = IF(:active, IF(password_hash IS NULL, 'PENDING', 'ACTIVE'), 'INACTIVE')
             WHERE id = :id"
        )->execute(['active' => (int) $active, 'id' => $id]);
    }

    private function exists(string $sql, string $value, ?int $exceptId): bool
    {
        $statement = $this->db->prepare($sql . ' LIMIT 1');
        $statement->execute(['value' => $value, 'except' => $exceptId ?? 0]);

        return $statement->fetchColumn() !== false;
    }

    //753-754
     }
}