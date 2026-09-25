<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// When a member leaves, changes position or the team is deleted, the old place moves to the history
// The history keeps the team's name, so nothing that happened is lost
class TeamModel extends Model
{
    public function ofProgramme(int $extracurricularId): array
    {
        $statement = $this->db->prepare('SELECT id, name, age_group, cover_url FROM teams WHERE extracurricular_id = :id ORDER BY name');
        $statement->execute(['id' => $extracurricularId]);
        $teams = array_column(array_map(fn (array $team): array => $team + ['members' => []], $statement->fetchAll()), null, 'id');

        $members = $this->db->prepare(
            'SELECT tm.team_id, u.id, p.full_name AS name, p.photo_url AS photo, g.sort_order AS grade_number, p.date_of_birth, tm.position, tm.since
             FROM team_members tm
             JOIN teams t ON t.id = tm.team_id
             JOIN user_accounts u ON u.id = tm.student_id
             JOIN profiles p ON p.account_id = u.id
             LEFT JOIN current_class_students cs ON cs.student_id = u.id
             LEFT JOIN classes c ON c.id = cs.class_id
             LEFT JOIN grades g ON g.id = c.grade_id
             WHERE t.extracurricular_id = :id
             ORDER BY tm.position IS NULL, p.first_name, p.last_name'
        );
        $members->execute(['id' => $extracurricularId]);

        foreach ($members->fetchAll() as $member)
        {
            $teams[$member['team_id']]['members'][] = $member;
        }

        return array_values($teams);
    }

    public function find(int $teamId): ?array
    {
        $statement = $this->db->prepare('SELECT id, extracurricular_id, name, age_group, cover_url FROM teams WHERE id = :id');
        $statement->execute(['id' => $teamId]);

        return $statement->fetch() ?: null;
    }

    // Teams with no age group are open to any age
    public function forAgeGroup(int $extracurricularId, ?string $ageGroup): array
    {
        $statement = $this->db->prepare('SELECT id, name FROM teams WHERE extracurricular_id = :id AND (age_group IS NULL OR age_group = :group) ORDER BY name');
        $statement->execute(['id' => $extracurricularId, 'group' => $ageGroup ?? '']);

        return $statement->fetchAll(\PDO::FETCH_KEY_PAIR);
    }

    }
}
