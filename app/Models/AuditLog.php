<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// Keeps a record of every sign-in and every change
class AuditLog extends Model
{
    // Role and name come from the account, never from the typed ID
    // The role filter 'system' finds entries made without an account
    public function recent(array $filters, int $page, int $perPage): array
    {
        $where  = [];
        $values = [];

        if ($filters['action'] !== '')
        {
            $where[]          = 'l.action = :action';
            $values['action'] = $filters['action'];
        }

        if ($filters['role'] === 'system')
        {
            $where[] = 'u.id IS NULL';
        }
        elseif ($filters['role'] !== '')
        {
            $where[]        = 'u.role = :role';
            $values['role'] = $filters['role'];
        }

        if ($filters['q'] !== '')
        {
            $like    = '%' . addcslashes($filters['q'], '%_\\') . '%';   // A typed % or _ is not a wildcard
            $where[] = '(l.identifier LIKE :q1 OR p.full_name LIKE :q2 OR l.details LIKE :q3 OR l.ip_address LIKE :q4)';
            $values += ['q1' => $like, 'q2' => $like, 'q3' => $like, 'q4' => $like];
        }

        $from = 'FROM audit_log l
                 LEFT JOIN user_accounts u ON u.id = l.account_id
                 LEFT JOIN profiles p ON p.account_id = l.account_id'
            . ($where === [] ? '' : ' WHERE ' . implode(' AND ', $where));

        $count = $this->db->prepare("SELECT COUNT(*) {$from}");
        $count->execute($values);

        $rows = $this->db->prepare("SELECT l.id, l.identifier, l.action, l.details, l.created_at, u.role, p.full_name {$from}
                                    ORDER BY l.id DESC LIMIT :limit OFFSET :offset");

        foreach ($values as $key => $value)
        {
            $rows->bindValue($key, $value);
        }

        $rows->bindValue('limit', $perPage, \PDO::PARAM_INT);   // LIMIT needs a real number, not text
        $rows->bindValue('offset', ($page - 1) * $perPage, \PDO::PARAM_INT);
        $rows->execute();

        return [$rows->fetchAll(), (int) $count->fetchColumn()];
    }

    public function count(): int
    {
        return (int) $this->db->query('SELECT COUNT(*) FROM audit_log')->fetchColumn();
    }

    public function actions(): array
    {
        return $this->db->query('SELECT DISTINCT action FROM audit_log ORDER BY action')->fetchAll(\PDO::FETCH_COLUMN);
    }

    }
}
