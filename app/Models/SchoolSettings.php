<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// The admin's changes on the Settings page
// A saved value wins over the white-label config file
class SchoolSettings extends Model
{
    private static ?array $saved = null;   // Read once per page

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

    //74-75
     }
}