<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// The admin's changes to the marks rules
// A change counts from the start of next year, so results already worked out never change
class SchoolRules extends Model
{
    private static ?array $rows    = null;   // Read once per page
    private static ?int   $current = null;   // Read once per page

    // The newest change from that year or before, or null to use the config file's value
    // With no year given, it uses this year
    // If the database or table is missing, it acts as if nothing was changed
    public static function inForce(string $key, ?int $year): mixed
    {
        if (self::$rows === null)
        {
            try
            {
                self::$rows = (new self())->all();
            }
            catch (\Throwable)
            {
                self::$rows = [];
            }
        }

        if (!isset(self::$rows[$key]))
        {
            return null;
        }

        $year ??= self::$current ??= (new SchoolYear())->current();
        $from   = array_filter(array_keys(self::$rows[$key]), fn (int $from): bool => $from <= $year);

        return $from === [] ? null : self::$rows[$key][max($from)];
    }

    // For each rule, its value from each year it changed
    public function all(): array
    {
        $rows = [];

        foreach ($this->db->query('SELECT rule_key, from_year, value FROM school_rules ORDER BY from_year')->fetchAll() as $row)
        {
            $rows[$row['rule_key']][(int) $row['from_year']] = json_decode($row['value'], true);
        }

        return $rows;
    }
    // An empty value removes that year's row, so the year before's value carries on
    // The keys come from the settings config only, never from the form
    public function save(int $year, array $values, int $adminId): void
    {
        $this->transaction(function () use ($year, $values, $adminId): void
        {
            $forget = $this->db->prepare('DELETE FROM school_rules WHERE from_year = :year AND rule_key = :key');
            $keep   = $this->db->prepare(
                'INSERT INTO school_rules (from_year, rule_key, value, updated_by) VALUES (:year, :key, :value, :by)
                 ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by)'
            );

            foreach ($values as $key => $value)
            {
                $value === null
                    ? $forget->execute(['year' => $year, 'key' => $key])
                    : $keep->execute(['year' => $year, 'key' => $key, 'value' => json_encode($value), 'by' => $adminId]);
            }
        });

        self::$rows = null;   // So the next read sees the new values
    
    }
}
