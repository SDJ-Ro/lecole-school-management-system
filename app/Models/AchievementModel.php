<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

class AchievementModel extends Model
{
    // Only these names reach the SQL
    // extracurricular_id links the achievement to an approved sport or club request
    private const RECORD_COLUMNS = ['title', 'category', 'level', 'result', 'achieved_on', 'issued_by', 'summary', 'evidence_path',
                                    'evidence_name', 'on_honours_board', 'extracurricular_id'];

    // Joins the students' names into one text, split by commas
    private const SELECT = "SELECT a.*,
               (SELECT GROUP_CONCAT(p.full_name ORDER BY p.first_name SEPARATOR ', ')
                FROM achievement_students s JOIN profiles p ON p.account_id = s.student_id WHERE s.achievement_id = a.id) AS student_names
        FROM achievements a";

    // Only these names reach the SQL
    private const COLUMNS = ['title', 'category', 'level', 'achieved_on', 'result', 'medal', 'event_name', 'organiser', 'venue',
                             'age_group', 'team', 'summary', 'others', 'photo_url', 'on_honours_board'];

    public function honoursBoard(?int $limit = null, ?int $year = null): array
    {
        $statement = $this->db->prepare(self::SELECT . ' WHERE a.on_honours_board = 1' . ($year !== null ? ' AND YEAR(a.achieved_on) = :year' : '')
            . ' ORDER BY a.achieved_on DESC' . ($limit !== null ? ' LIMIT ' . $limit : ''));
        $statement->execute($year !== null ? ['year' => $year] : []);

        return array_map([$this, 'withParticipants'], $statement->fetchAll());
    }

    public function honoursBoardYears(): array
    {
        return $this->ids('SELECT DISTINCT YEAR(achieved_on) FROM achievements WHERE on_honours_board = 1 ORDER BY 1 DESC');
    }

    public function ofStudent(int $studentId): array
    {
        $statement = $this->db->prepare(
            'SELECT a.id, a.title, a.category, a.result, a.achieved_on, a.summary, a.extracurricular_id, x.type AS extracurricular_type,
                    a.evidence_path
             FROM achievements a
             JOIN achievement_students s ON s.achievement_id = a.id LEFT JOIN extracurriculars x ON x.id = a.extracurricular_id
             WHERE s.student_id = :id ORDER BY a.achieved_on DESC, a.id DESC'
        );
        $statement->execute(['id' => $studentId]);

        return $statement->fetchAll();
    }

    public function ofExtracurricular(int $extracurricularId): array
    {
        $statement = $this->db->prepare(
            'SELECT id, title, level, achieved_on, team, photo_url FROM achievements WHERE extracurricular_id = :id ORDER BY achieved_on DESC, id DESC'
        );
        $statement->execute(['id' => $extracurricularId]);

        return $statement->fetchAll();
    }

    // Finds likely duplicates, leaving out the achievement being edited
    public function sameAs(array $studentIds, string $title, string $date, ?int $exceptId): array
    {
        $statement = $this->db->prepare(
            'SELECT p.full_name AS name, b.full_name AS recorded_by
             FROM achievements a
             JOIN achievement_students s ON s.achievement_id = a.id JOIN profiles p ON p.account_id = s.student_id
             LEFT JOIN profiles b ON b.account_id = a.added_by
             WHERE s.student_id IN (' . self::idList($studentIds) . ') AND LOWER(a.title) = LOWER(:title) AND a.achieved_on = :date
               AND a.id <> :except
             ORDER BY p.first_name, p.last_name'
        );
        $statement->execute(['title' => $title, 'date' => $date, 'except' => $exceptId ?? 0]);

        return $statement->fetchAll();
    }

    public function admittedAfter(array $studentIds, string $date): array
    {
        $statement = $this->db->prepare(
            'SELECT p.full_name FROM student_details d JOIN profiles p ON p.account_id = d.account_id
             WHERE d.account_id IN (' . self::idList($studentIds) . ') AND d.admission_date > :date ORDER BY p.first_name, p.last_name'
        );
        $statement->execute(['date' => $date]);

        return $statement->fetchAll(\PDO::FETCH_COLUMN);
    }

    public function find(int $achievementId): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM achievements WHERE id = :id');
        $statement->execute(['id' => $achievementId]);
        $row = $statement->fetch();

        if ($row === false)
        {
            return null;
        }

        $students = $this->db->prepare(
            'SELECT s.student_id AS id, p.full_name AS name FROM achievement_students s JOIN profiles p ON p.account_id = s.student_id
             WHERE s.achievement_id = :id ORDER BY p.first_name, p.last_name'
        );
        $students->execute(['id' => $achievementId]);
        $photos = $this->db->prepare('SELECT id, url FROM achievement_photos WHERE achievement_id = :id ORDER BY sort_order, id');
        $photos->execute(['id' => $achievementId]);

        return $row + ['students' => $students->fetchAll(), 'photos' => $photos->fetchAll()];
    }
    
    // Saves a programme's achievement with its photo gallery
    // Returns the id and the old photos that can now be removed
    public function save(?int $achievementId, int $extracurricularId, array $values, array $studentIds, array $keptPhotoIds, array $newPhotos, int $by): array
    {
        return $this->transaction(function () use ($achievementId, $extracurricularId, $values, $studentIds, $keptPhotoIds, $newPhotos, $by): array
        {
            $values = array_intersect_key($values, array_flip(self::COLUMNS));
            $old    = $achievementId === null ? null : $this->find($achievementId);

            if ($achievementId === null)
            {
                $columns = array_keys($values);
                $this->db->prepare('INSERT INTO achievements (' . implode(', ', $columns) . ', extracurricular_id, added_by)
                                    VALUES (:' . implode(', :', $columns) . ', :extracurricular, :by)')
                    ->execute($values + ['extracurricular' => $extracurricularId, 'by' => $by]);
                $achievementId = (int) $this->db->lastInsertId();
            }
            else
            {
                $sets = implode(', ', array_map(fn (string $column): string => "{$column} = :{$column}", array_keys($values)));
                $this->db->prepare("UPDATE achievements SET {$sets} WHERE id = :id")->execute($values + ['id' => $achievementId]);
            }

            $this->db->prepare('DELETE FROM achievement_students WHERE achievement_id = :id')->execute(['id' => $achievementId]);
            $student = $this->db->prepare('INSERT INTO achievement_students (achievement_id, student_id) VALUES (:id, :student)');

            foreach ($studentIds as $studentId)
            {
                $student->execute(['id' => $achievementId, 'student' => $studentId]);
            }

            $gone = array_values(array_filter($old['photos'] ?? [], fn (array $photo): bool => !in_array((int) $photo['id'], $keptPhotoIds, true)));
            $drop = $this->db->prepare('DELETE FROM achievement_photos WHERE id = :photo AND achievement_id = :id');
            $move = $this->db->prepare('UPDATE achievement_photos SET sort_order = :place WHERE id = :photo AND achievement_id = :id');
            $add  = $this->db->prepare('INSERT INTO achievement_photos (achievement_id, url, sort_order) VALUES (:id, :url, :place)');

            foreach ($gone as $photo)
            {
                $drop->execute(['photo' => $photo['id'], 'id' => $achievementId]);
            }

            foreach (array_values($keptPhotoIds) as $place => $photoId)
            {
                $move->execute(['place' => $place, 'photo' => $photoId, 'id' => $achievementId]);
            }

            foreach (array_values($newPhotos) as $place => $url)
            {
                $add->execute(['id' => $achievementId, 'url' => $url, 'place' => count($keptPhotoIds) + $place]);
            }

            $unused = array_column($gone, 'url');

            if (isset($values['photo_url']) && $old !== null)
            {
                $unused[] = $old['photo_url'];   // The old cover photo
            }

            return [$achievementId, $unused];
        });
    }

    // Saves one student's achievement
    // An edit does not change the students, because an honours board one may have several
    public function record(?int $achievementId, int $studentId, array $values, int $by): int
    {
        return $this->transaction(function () use ($achievementId, $studentId, $values, $by): int
        {
            $values = array_intersect_key($values, array_flip(self::RECORD_COLUMNS));

            if ($achievementId !== null)
            {
                $sets = implode(', ', array_map(fn (string $column): string => "{$column} = :{$column}", array_keys($values)));
                $this->db->prepare("UPDATE achievements SET {$sets} WHERE id = :id")->execute($values + ['id' => $achievementId]);

                return $achievementId;
            }

            $columns = array_keys($values);
            $this->db->prepare('INSERT INTO achievements (' . implode(', ', $columns) . ', added_by) VALUES (:' . implode(', :', $columns) . ', :by)')
                ->execute($values + ['by' => $by]);
            $achievementId = (int) $this->db->lastInsertId();
            $this->db->prepare('INSERT INTO achievement_students (achievement_id, student_id) VALUES (:id, :student)')
                ->execute(['id' => $achievementId, 'student' => $studentId]);

            return $achievementId;
        });
    }

    // Returns the photo URLs so the files can be removed too
    public function delete(int $achievementId): array
    {
        $row = $this->find($achievementId);
        $this->db->prepare('DELETE FROM achievements WHERE id = :id')->execute(['id' => $achievementId]);

        return $row === null ? [] : [$row['photo_url'], ...array_column($row['photos'], 'url')];
    }

    // With no teacher given, returns every student
    // A teacher gets their class and the members of programmes they run
    // 'programme' is where the student's awards are recorded
    public function studentsOf(?int $teacherId, array $only = []): array
    {
        $mine = $teacherId === null ? '' :
            "AND (u.id IN (SELECT cs.student_id FROM current_class_students cs JOIN current_class_teachers ct ON ct.class_id = cs.class_id WHERE ct.teacher_id = :me)
                  OR u.id IN (SELECT em.student_id FROM extracurricular_members em
                              JOIN current_teachers_in_charge tic ON tic.extracurricular_id = em.extracurricular_id
                              WHERE tic.teacher_id = :me2 AND em.status = 'member'))";
        $values = [];

        if (isset($only['code']))
        {
            $mine .= ' AND p.code = :code';
            $values['code'] = $only['code'];
        }

        if (isset($only['id']))
        {
            $mine .= ' AND u.id = :id';
            $values['id'] = (int) $only['id'];
        }

        $statement = $this->db->prepare(
            "SELECT u.id, p.full_name AS name, p.code, p.photo_url AS photo,
                    EXISTS (SELECT 1 FROM current_class_teachers ct WHERE ct.class_id = cs.class_id AND ct.teacher_id = :me3) AS in_class,
                    (SELECT MIN(em.extracurricular_id) FROM extracurricular_members em
                     JOIN current_teachers_in_charge tic ON tic.extracurricular_id = em.extracurricular_id
                     WHERE em.student_id = u.id AND em.status = 'member' AND tic.teacher_id = :me4) AS programme
             FROM user_accounts u JOIN profiles p ON p.account_id = u.id
             LEFT JOIN current_class_students cs ON cs.student_id = u.id
             WHERE u.role = 'student' AND u.activation_status <> 'INACTIVE' {$mine}
             ORDER BY p.first_name, p.last_name"
        );
        $statement->execute(['me3' => $teacherId ?? 0, 'me4' => $teacherId ?? 0] + $values + ($teacherId === null ? [] : ['me' => $teacherId, 'me2' => $teacherId]));

        return array_column($statement->fetchAll(), null, 'id');
    }

    // Our own students first, then the typed names of outside students
    private function withParticipants(array $row): array
    {
        $names = array_filter(array_merge(explode(', ', (string) $row['student_names']), explode(', ', (string) $row['others'])));

        return $row + [
            'participants' => array_values($names),
            'tone'         => config("achievements.categories.{$row['category']}.tone", 'linen'),
        ];
    }
}
