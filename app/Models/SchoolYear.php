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

    // Gives next year once this year's last term has ended
    // A student admitted then starts with everyone when the new year begins
    // So the year end does not move them up a grade again
    public function placementYear(): int
    {
        $year = $this->current();
        $ends = $this->lastDay($year);

        return $ends !== null && $ends < date('Y-m-d') ? $year + 1 : $year;
    }

    // Today comes from PHP's date, not the database's
    public function startedTerms(): array
    {
        $today = date('Y-m-d');

        return array_keys(array_filter($this->terms($this->current()), fn (array $term): bool => $term['starts_on'] <= $today));
    }

    // The dates of a published term cannot change any more
    public function publishedTerms(int $year): array
    {
        $statement = $this->db->prepare('SELECT DISTINCT term FROM term_publications WHERE year = :year ORDER BY term');
        $statement->execute(['year' => $year]);

        return array_map('intval', $statement->fetchAll(\PDO::FETCH_COLUMN));
    }

    // True when the dates were filled in automatically, so the admin is asked to check them
    public function datesFromUsual(int $year): bool
    {
        $statement = $this->db->prepare('SELECT dates_from_usual FROM school_years WHERE year = :year');
        $statement->execute(['year' => $year]);

        return (bool) $statement->fetchColumn();
    }
    
    // Dates filled in by the year end are marked, and dates the admin types clear the mark
    public function saveTerms(array $years, bool $fromUsual = false): void
    {
        $this->transaction(function () use ($years, $fromUsual): void
        {
            $mark      = $this->db->prepare('UPDATE school_years SET dates_from_usual = :usual WHERE year = :year');
            $addYear   = $this->db->prepare('INSERT IGNORE INTO school_years (year) VALUES (:year)');
            $saveTerm  = $this->db->prepare(
                'INSERT INTO school_terms (year, term, starts_on, ends_on) VALUES (:year, :term, :starts, :ends)
                 ON DUPLICATE KEY UPDATE starts_on = VALUES(starts_on), ends_on = VALUES(ends_on)'
            );

            foreach ($years as $year => $terms)
            {
                $addYear->execute(['year' => $year]);
                $mark->execute(['usual' => (int) $fromUsual, 'year' => $year]);

                foreach ($terms as $term => $dates)
                {
                    $saveTerm->execute(['year' => $year, 'term' => $term, 'starts' => $dates['starts_on'], 'ends' => $dates['ends_on']]);
                }
            }
        });
    }
}
