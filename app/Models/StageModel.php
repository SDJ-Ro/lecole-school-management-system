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

    }
}