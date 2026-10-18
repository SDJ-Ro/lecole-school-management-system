<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// A stage is a range of grades that share one subject list, and ranges never overlap
// A grade's stage is found from its number, so changing a range needs no re-linking
// A subject with marks is never deleted or renamed
// Taken out, it is retired, so it is gone from new terms but still shows on old reports
class StageModel extends Model
{
    public function all(): array
    {
        $stages = array_column($this->db->query('SELECT * FROM stages ORDER BY first_grade')->fetchAll(), null, 'id');

        foreach ($stages as &$stage)
        {
            $stage['subjects'] = [];
            $stage['retired']  = [];
        }
        unset($stage);

        foreach ($this->db->query('SELECT id, stage_id, name, retired_on FROM stage_subjects ORDER BY sort_order, name')->fetchAll() as $subject)
        {
            $stages[$subject['stage_id']][$subject['retired_on'] === null ? 'subjects' : 'retired'][$subject['id']] = $subject['name'];
        }

        return array_values($stages);
    }

    public function find(int $id): ?array
    {
        foreach ($this->all() as $stage)
        {
            if ($stage['id'] === $id)
            {
                return $stage;
            }
        }

        return null;
    }

    // A stage needs at least one existing grade
    public function gradesIn(int $first, int $last): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM grades WHERE sort_order BETWEEN :first AND :last');
        $statement->execute(['first' => $first, 'last' => $last]);

        return (int) $statement->fetchColumn();
    }
    
    // How many marks each subject has, only for subjects that have marks
    public function marks(): array
    {
        return $this->pairs('SELECT subject_id, COUNT(*) FROM marks GROUP BY subject_id');
    }

    // Lets the editor warn before a save removes some subject teachers
    public function assignments(int $stageId): array
    {
        $statement = $this->db->prepare(
            'SELECT g.sort_order, st.subject_id FROM current_subject_teachers st
             JOIN stage_subjects ss ON ss.id = st.subject_id
             JOIN classes c ON c.id = st.class_id
             JOIN grades g ON g.id = c.grade_id
             WHERE ss.stage_id = :id'
        );
        $statement->execute(['id' => $stageId]);

        return $statement->fetchAll(\PDO::FETCH_NUM);
    }

    // A subject's replaces field names the subject with marks that it renames
    // Returns the stage id and how many subject teachers were removed
    // A subject left out is retired if it has marks, or else deleted
    // A new subject with the name of a retired one brings that one back
    // A replacement subject takes over this year's teachers
    // Classes the new range leaves out lose their subject teachers
    public function save(?int $id, array $stage, array $subjects): array
    {
        return $this->transaction(function () use ($id, $stage, $subjects): array
        {
            $before = $id === null ? 0 : count($this->assignments($id));
            $marks  = $this->marks();

            if ($id === null)
            {
                $this->db->prepare('INSERT INTO stages (first_grade, last_grade, description) VALUES (:first_grade, :last_grade, :description)')->execute($stage);
                $id = (int) $this->db->lastInsertId();
            }
            else
            {
                $this->db->prepare('UPDATE stages SET first_grade = :first_grade, last_grade = :last_grade, description = :description WHERE id = :id')
                    ->execute($stage + ['id' => $id]);
            }

            // Deleting waits until a replacement has taken over the teachers
            // Temporary names let two subjects swap names, because two subjects in a stage cannot share a name
            $leftOut = $this->db->prepare('SELECT id FROM stage_subjects WHERE stage_id = :id AND retired_on IS NULL AND id NOT IN ('
                . self::idList(array_filter(array_column($subjects, 'id'))) . ')');
            $leftOut->execute(['id' => $id]);
            $leftOut = $leftOut->fetchAll(\PDO::FETCH_COLUMN);
            $keep    = array_filter($leftOut, fn (int $subjectId): bool => isset($marks[$subjectId]));

            $this->db->exec('UPDATE stage_subjects SET retired_on = CURDATE() WHERE id IN (' . self::idList($keep) . ')');
            $this->db->prepare("UPDATE stage_subjects SET name = CONCAT('~', id) WHERE stage_id = :id AND retired_on IS NULL")->execute(['id' => $id]);

            $retired = $this->db->prepare('SELECT LOWER(name), id FROM stage_subjects WHERE stage_id = :id AND retired_on IS NOT NULL');
            $retired->execute(['id' => $id]);
            $retired = $retired->fetchAll(\PDO::FETCH_KEY_PAIR);

            $insert = $this->db->prepare('INSERT INTO stage_subjects (stage_id, name, sort_order) VALUES (:stage, :name, :position)');
            $update = $this->db->prepare('UPDATE stage_subjects SET name = :name, sort_order = :position, retired_on = NULL WHERE id = :id AND stage_id = :stage');
            $year     = (new SchoolYear())->current();
            $takeOver = $this->db->prepare('UPDATE subject_teachers SET subject_id = :new WHERE subject_id = :old AND year = :year');

            foreach (array_values($subjects) as $position => $subject)
            {
                $values    = ['stage' => $id, 'name' => $subject['name'], 'position' => $position];
                $subjectId = $subject['id'] ?? $retired[mb_strtolower($subject['name'])] ?? null;   // A retired name comes back

                if ($subjectId === null)
                {
                    $insert->execute($values);
                    $subjectId = (int) $this->db->lastInsertId();
                }
                else
                {
                    $update->execute($values + ['id' => $subjectId]);
                }

                if (($subject['replaces'] ?? null) !== null)
                {
                    $takeOver->execute(['new' => $subjectId, 'old' => $subject['replaces'], 'year' => $year]);
                }
            }

            // Earlier years' teachers of a retired subject stay
            $this->db->prepare('DELETE FROM subject_teachers WHERE year = :year AND subject_id IN (' . self::idList($keep) . ')')->execute(['year' => $year]);
            $this->db->exec('DELETE FROM stage_subjects WHERE id IN (' . self::idList(array_diff($leftOut, $keep)) . ')');
            $this->forgetOutOfRange($year);

            return [$id, $before - count($this->assignments($id))];
        });
    }

    // The caller first checks there are no marks
    public function delete(int $id): void
    {
        $this->db->prepare('DELETE FROM stages WHERE id = :id')->execute(['id' => $id]);
    }

    // After a range changes, a class may fall outside its subjects' stage
    // Earlier years stay as they were
    private function forgetOutOfRange(int $year): void
    {
        $this->db->prepare(
            'DELETE st FROM subject_teachers st
             JOIN stage_subjects ss ON ss.id = st.subject_id
             JOIN stages s ON s.id = ss.stage_id
             JOIN classes c ON c.id = st.class_id
             JOIN grades g ON g.id = c.grade_id
             WHERE st.year = :year AND g.sort_order NOT BETWEEN s.first_grade AND s.last_grade'
        )->execute(['year' => $year]);
    }
}