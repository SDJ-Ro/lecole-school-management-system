<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// The admin's changes on the Settings page
// A saved value wins over the white-label config file
class SchoolSettings extends Model
{
    private static ?array $saved = null;   // Read once per page

    // Null means use the config file's value
    // If the database is down, for example on the error page, it acts as if nothing was saved
    public static function saved(string $key): mixed
    {
        if (self::$saved === null)
        {
            try
            {
                self::$saved = (new self())->all();
            }
            catch (\Throwable)
            {
                self::$saved = [];
            }
        }

        return self::$saved[$key] ?? null;
    }


    //34-46
    // A value is a text, or a list for the address
    public function all(): array
    {
        $values = [];

        foreach ($this->db->query('SELECT setting_key, value FROM school_settings')->fetchAll() as $row)
        {
            $values[$row['setting_key']] = json_decode($row['value'], true);
        }

        return $values;
    }
     // An empty value goes back to the config file's value
    // The keys come from the settings config only, never from the form
    // The extra save for the marks rules runs in the same transaction
    public function save(array $values, int $adminId, ?callable $also = null): void
    {
        $this->transaction(function () use ($values, $adminId, $also): void
        {
            if ($also !== null)
            {
                $also();   // Its own transaction joins this one
            }

            $forget = $this->db->prepare('DELETE FROM school_settings WHERE setting_key = :key');
            $keep   = $this->db->prepare(
                'INSERT INTO school_settings (setting_key, value, updated_by) VALUES (:key, :value, :by)
                 ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by)'
            );

            foreach ($values as $key => $value)
            {
                $value === null
                    ? $forget->execute(['key' => $key])
                    : $keep->execute(['key' => $key, 'value' => json_encode($value, JSON_UNESCAPED_UNICODE), 'by' => $adminId]);
            }
        });

        self::$saved = null;   // So the next read sees the new values
    }

    //74-75
     }
}