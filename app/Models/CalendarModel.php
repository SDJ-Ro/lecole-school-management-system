<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

// Who may see an event is decided only in visibility()
// Who may change one is decided only in can_manage()
class CalendarModel extends Model
{
    // Joins the event's groups into one text, each as a type and an id
    // A school group has no id and means the whole school
    private const SELECT = "SELECT e.*, a.full_name AS author_name,
        (SELECT GROUP_CONCAT(CONCAT(s.scope_type, ':', COALESCE(s.scope_id, '')) ORDER BY s.id)
         FROM event_scopes s WHERE s.event_id = e.id) AS scopes
        FROM events e
        LEFT JOIN profiles a ON a.account_id = e.author_id";

    // All-day events come first each day
    public function between(array $user, string $from, string $to): array
    {
        $statement = $this->db->prepare(self::SELECT . ' WHERE e.event_date BETWEEN :from AND :to AND ' . $this->visibility($user)
            . ' ORDER BY e.event_date, e.start_time IS NOT NULL, e.start_time, e.id');
        $statement->execute(['from' => $from, 'to' => $to] + $this->roleValue($user));

        return $statement->fetchAll();
    }

    public function findFor(array $user, int $id): ?array
    {
        $statement = $this->db->prepare(self::SELECT . ' WHERE e.id = :id AND ' . $this->visibility($user));
        $statement->execute(['id' => $id] + $this->roleValue($user));

        return $statement->fetch() ?: null;
    }

    // These are also the only groups the user may save an event for
    // Teachers get their own classes and programmes, but no grades
    public function choicesFor(array $user): array
    {
        $ownOnly = !in_array($user['role'], config('permissions.posts.any_group'), true);

        return [
            'grades'           => $ownOnly ? [] : array_map('grade_name', $this->pairs('SELECT id, sort_order FROM grades ORDER BY sort_order')),
            'classes'          => $this->pairs('SELECT c.id, c.name FROM classes c JOIN grades g ON g.id = c.grade_id'
                . ($ownOnly ? ' WHERE c.id IN (' . Membership::MY_CLASSES['teacher'] . ')' : '') . ' ORDER BY g.sort_order, c.name', $ownOnly ? $user['id'] : null),
            'extracurriculars' => $this->pairs('SELECT id, name FROM extracurriculars WHERE '
                . ($ownOnly ? 'id IN (SELECT extracurricular_id FROM current_teachers_in_charge WHERE teacher_id = :me)' : "review = 'approved'")
                . ' ORDER BY type, name', $ownOnly ? $user['id'] : null),
        ];
    }
    
    public function save(?int $id, array $event, array $scopes): int
    {
        return $this->transaction(function () use ($id, $event, $scopes): int
        {
            if ($id === null)
            {
                $columns = implode(', ', array_keys($event));
                $holders = ':' . implode(', :', array_keys($event));
                $this->db->prepare("INSERT INTO events ({$columns}) VALUES ({$holders})")->execute($event);
                $id = (int) $this->db->lastInsertId();
            }
            else
            {
                $sets = implode(', ', array_map(fn (string $column): string => "{$column} = :{$column}", array_keys($event)));
                $this->db->prepare("UPDATE events SET {$sets} WHERE id = :id")->execute($event + ['id' => $id]);
                $this->db->prepare('DELETE FROM event_scopes WHERE event_id = :id')->execute(['id' => $id]);
            }

            $insert = $this->db->prepare('INSERT INTO event_scopes (event_id, scope_type, scope_id) VALUES (:event, :type, :scope)');

            foreach ($scopes as [$type, $scopeId])
            {
                $insert->execute(['event' => $id, 'type' => $type, 'scope' => $scopeId]);
            }

            return $id;
        });
    }

    public function delete(int $id): void
    {
        $this->db->prepare('DELETE FROM events WHERE id = :id')->execute(['id' => $id]);   // The database deletes its groups too
    }

    // Everyone sees events for their role that are for the whole school or one of their groups
    // Teachers also see every event for their own groups, and the events they made
    private function visibility(array $user): string
    {
        if ($this->seesAll($user))
        {
            return '1 = 1';
        }

        $in = (new Membership())->idListsOf($user);

        $mine = "EXISTS (SELECT 1 FROM event_scopes s WHERE s.event_id = e.id AND (
                    (s.scope_type = 'grade' AND s.scope_id IN ({$in['grade']}))
                    OR (s.scope_type = 'class' AND s.scope_id IN ({$in['class']}))
                    OR (s.scope_type = 'extracurricular' AND s.scope_id IN ({$in['extracurricular']}))))";

        $forTeacher = in_array($user['role'], config('permissions.calendar.create'), true) ? " OR {$mine} OR e.author_id = " . (int) $user['id'] : '';

        return "((FIND_IN_SET(:role, e.audience) AND (EXISTS (SELECT 1 FROM event_scopes s WHERE s.event_id = e.id AND s.scope_type = 'school') OR {$mine}))
                 {$forTeacher})";
    }

    private function roleValue(array $user): array
    {
        return $this->seesAll($user) ? [] : ['role' => $user['role']];
    }

    private function seesAll(array $user): bool
    {
        return in_array($user['role'], config('permissions.calendar.see_all'), true);
    }

    private function sameStudents(array $scopes): string
    {
        $wanted = ['grade' => [], 'class' => [], 'extracurricular' => []];

        foreach ($scopes as [$type, $id])
        {
            if ($type === 'school')
            {
                return '1 = 1';
            }

            $wanted[$type][] = (int) $id;
        }

        // A grade event also involves its classes
        // A class event also involves the events for its whole grade
        $classes = array_merge($wanted['class'], $this->ids('SELECT id FROM classes WHERE grade_id IN (' . self::idList($wanted['grade']) . ')'));
        $grades  = array_merge($wanted['grade'], $this->ids('SELECT grade_id FROM classes WHERE id IN (' . self::idList($wanted['class']) . ')'));

        return "(s.scope_type = 'grade' AND s.scope_id IN (" . self::idList($grades) . "))
             OR (s.scope_type = 'class' AND s.scope_id IN (" . self::idList($classes) . "))
             OR (s.scope_type = 'extracurricular' AND s.scope_id IN (" . self::idList($wanted['extracurricular']) . '))';
    }

}
