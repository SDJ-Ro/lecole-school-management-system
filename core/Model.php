<?php

declare(strict_types=1);

namespace Core;

use PDO;

abstract class Model
{
    protected PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // Saves all the changes or none. Inside another transaction it just joins that one.
    protected function transaction(callable $work): mixed
    {
        if ($this->db->inTransaction())
        {
            return $work();
        }

        $this->db->beginTransaction();

        try
        {
            $result = $work();
            $this->db->commit();

            return $result;
        }
        catch (\Throwable $error)
        {
            $this->db->rollBack();
            throw $error;
        }
    }

    // A list of ids for SQL IN. Only whole numbers, so it is safe to put in the SQL.
    // An empty list gives 0, which matches nothing.
    protected static function idList(array $ids): string
    {
        return $ids === [] ? '0' : implode(',', array_map('intval', $ids));
    }

    // Returns the first column as ids. The SQL may use :me.
    protected function ids(string $sql, ?int $me = null): array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($me === null ? [] : ['me' => $me]);

        return array_map('intval', $statement->fetchAll(PDO::FETCH_COLUMN));
    }

    // Returns each id with its name. The SQL may use :me.
    protected function pairs(string $sql, ?int $me = null): array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($me === null ? [] : ['me' => $me]);

        return $statement->fetchAll(PDO::FETCH_KEY_PAIR);
    }
}