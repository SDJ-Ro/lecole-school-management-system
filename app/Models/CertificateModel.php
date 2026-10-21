<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// The draft certificate is built from the student's records each time
// A row only holds what people chose, such as saved wording and the final issued text
class CertificateModel extends Model
{
    // Only these names reach the SQL
    private const SECTIONS = ['academic', 'activities', 'conduct'];

    // A section is null when its wording was never saved
    public function find(int $studentId): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM certificates WHERE student_id = :id');
        $statement->execute(['id' => $studentId]);
        $row = $statement->fetch();

        if ($row === false)
        {
            return null;
        }

        foreach ([...self::SECTIONS, 'details'] as $column)
        {
            $row[$column] = $row[$column] === null ? null : json_decode($row[$column], true);
        }

        return $row;
    }

    public function studentId(string $code): ?int
    {
        $statement = $this->db->prepare("SELECT u.id FROM user_accounts u JOIN profiles p ON p.account_id = u.id WHERE p.code = :code AND u.role = 'student'");
        $statement->execute(['code' => $code]);
        $id = $statement->fetchColumn();

        return $id === false ? null : (int) $id;
    }

    // Students in the last grade, plus everyone with an approved leaving date
    // An empty status means the certificate is still a draft
    public function roster(int $lastGrade): array
    {
        $statement = $this->db->prepare(
            "SELECT u.id, p.full_name AS name, p.code, u.activation_status, c.name AS class_name, g.sort_order AS grade_number,
                    cs.year AS class_year, lr.leaving_on, lr.reason AS leaving_reason, ce.status,
                    (SELECT COUNT(*) FROM certificate_requests cr WHERE cr.student_id = u.id AND cr.status = 'pending') AS waiting_requests,
                    (SELECT COUNT(*) FROM missing_record_requests mr WHERE mr.student_id = u.id AND mr.status = 'pending') AS waiting_records
             FROM user_accounts u
             JOIN profiles p ON p.account_id = u.id
             -- their latest class (a graduate has none this year: the year-end gave them no new one)
             LEFT JOIN class_students cs ON cs.student_id = u.id AND cs.year = (SELECT MAX(x.year) FROM class_students x WHERE x.student_id = u.id)
             LEFT JOIN classes c ON c.id = cs.class_id
             LEFT JOIN grades g ON g.id = c.grade_id
             LEFT JOIN leave_requests lr ON lr.student_id = u.id AND lr.status = 'approved'
             LEFT JOIN certificates ce ON ce.student_id = u.id
             WHERE u.role = 'student' AND (g.sort_order = :last OR lr.id IS NOT NULL)
             ORDER BY p.first_name, p.last_name"
        );
        $statement->execute(['last' => $lastGrade]);

        return $statement->fetchAll();
    }

    // With no points given, the section goes back to the wording from the records
    // Returns false when the certificate is already issued
    public function saveWording(int $studentId, string $section, ?array $points): bool
    {
        if (!in_array($section, self::SECTIONS, true))
        {
            return false;
        }

        return $this->transaction(function () use ($studentId, $section, $points): bool
        {
            if (($this->locked($studentId)['status'] ?? 'draft') === 'issued')
            {
                return false;
            }

            $this->db->prepare(
                "INSERT INTO certificates (student_id, {$section}, edited_at) VALUES (:id, :points, NOW())
                 ON DUPLICATE KEY UPDATE {$section} = VALUES({$section}), edited_at = NOW()"
            )->execute(['id' => $studentId, 'points' => $points === null ? null : json_encode(array_values($points))]);

            return true;
        });
    }

    public function waitingRequests(): int
    {
        return (int) $this->db->query("SELECT COUNT(*) FROM certificate_requests WHERE status = 'pending'")->fetchColumn();
    }

    public function requestsOf(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT r.*, p.full_name AS decided_by_name FROM certificate_requests r LEFT JOIN profiles p ON p.account_id = r.decided_by
             WHERE r.student_id = :id ORDER BY r.created_at DESC, r.id DESC'
        );
        $statement->execute(['id' => $studentId]);

        return $statement->fetchAll();
    }

    // Returns false when the student already has a request waiting
    public function ask(int $studentId, string $purpose, int $copies, string $delivery, ?string $notes): bool
    {
        return $this->transaction(function () use ($studentId, $purpose, $copies, $delivery, $notes): bool
        {
            $waiting = $this->db->prepare("SELECT COUNT(*) FROM certificate_requests WHERE student_id = :id AND status = 'pending' FOR UPDATE");
            $waiting->execute(['id' => $studentId]);

            if ((int) $waiting->fetchColumn() > 0)
            {
                return false;
            }

            $this->db->prepare('INSERT INTO certificate_requests (student_id, purpose, copies, delivery, notes) VALUES (:id, :purpose, :copies, :delivery, :notes)')
                ->execute(['id' => $studentId, 'purpose' => $purpose, 'copies' => $copies, 'delivery' => $delivery, 'notes' => $notes]);

            return true;
        });
    }

    // Locked until the transaction ends, so two saves at once wait for each other
    private function locked(int $studentId): ?array
    {
        $statement = $this->db->prepare('SELECT status FROM certificates WHERE student_id = :id FOR UPDATE');
        $statement->execute(['id' => $studentId]);

        return $statement->fetch() ?: null;

    }
}