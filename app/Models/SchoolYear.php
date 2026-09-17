<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// The current year is the newest one whose first term has started
// So next year's dates can be saved early, and the year changes by itself on its first day
class SchoolYear extends Model
{
    public function current(): int
    {
        return (int) $this->db->query('SELECT year FROM current_school_year')->fetchColumn();
    }

    // The start and end dates of each term
    public function terms(int $year): array
    {
        $statement = $this->db->prepare('SELECT term, starts_on, ends_on FROM school_terms WHERE year = :year ORDER BY term');
        $statement->execute(['year' => $year]);

        return array_column($statement->fetchAll(), null, 'term');
    }

    // The term dates of every year
    public function termsBefore(int $year): array
    {
        $statement = $this->db->prepare('SELECT year, term, starts_on, ends_on FROM school_terms WHERE year < :year ORDER BY year, term');
        $statement->execute(['year' => $year]);
        $years = [];

        foreach ($statement->fetchAll() as $row)
        {
            $years[(int) $row['year']][(int) $row['term']] = ['starts_on' => $row['starts_on'], 'ends_on' => $row['ends_on']];
        }

        return $years;
    }

    // Graduates' certificates are finalised from the end of the year
    // Null when the terms are not set
    public function lastDay(int $year): ?string
    {
        $terms = $this->terms($year);

        return $terms === [] ? null : end($terms)['ends_on'];
    }

    // True when the dates were filled in automatically, so the admin is asked to check them
    public function datesFromUsual(int $year): bool
    {
        $statement = $this->db->prepare('SELECT dates_from_usual FROM school_years WHERE year = :year');
        $statement->execute(['year' => $year]);

        return (bool) $statement->fetchColumn();
    }

    }
}
