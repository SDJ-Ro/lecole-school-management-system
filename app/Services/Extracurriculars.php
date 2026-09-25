<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AchievementModel;
use App\Models\ExtracurricularModel;
use App\Models\NoticeModel;
use App\Models\TeamModel;

// Gets club and sport data ready for the pages. Who may do what is decided in the controller and JoinRules.
final class Extracurriculars
{
    // Sorts the student's own programmes first, then approved ones, then by name.
    // $student is the student or the parent's child, or null for staff.
    public static function cards(array $rows, ?array $student, array $filters): array
    {
        $model     = new ExtracurricularModel();
        $states    = $student === null ? [] : $model->statesOf($student['id']);
        $watch     = $student === null ? null : AcademicWatch::of($student['id']);
        $birthdays = $student === null ? [] : $model->memberBirthdays();
        $search    = mb_strtolower($filters['q']);
        $cards     = [];

        foreach ($rows as $row)
        {
            $card = self::card($row, $states[$row['id']] ?? null);

            if ($student !== null && $card['state'] === 'open')
            {
                $card['whyNot'] = JoinRules::whyNot($row, $student, $watch, $birthdays[$row['id']] ?? []);
            }

            $card['watched'] = $card['state'] === 'enrolled' && ($watch['locked'] ?? false);
            $cards[]         = $card;
        }

        $cards = array_filter($cards, fn (array $card): bool => ($filters['type'] === '' || $card['type'] === $filters['type'])
            && ($search === '' || str_contains(mb_strtolower("{$card['name']} {$card['category']} {$card['tic']['name']} {$card['coachName']}"), $search)));

        usort($cards, fn (array $a, array $b): int => [$a['state'] !== 'enrolled', $a['review'] !== 'approved', $a['name']]
            <=> [$b['state'] !== 'enrolled', $b['review'] !== 'approved', $b['name']]);

        return $cards;
    }

    // $member means they may see the coach's contact and the roster.
    // $studentId marks whose roster row shows "You".
    // $age is the age group filter. An unknown one shows all ages.
    public static function page(array $row, ?array $current, bool $member, ?int $studentId, string $age, array $user): array
    {
        $model     = new ExtracurricularModel();
        $card      = self::card($row, $current);
        $members   = array_map(fn (array $person): array => self::person($person), $model->people($row['id'], 'member'));
        $requests  = array_map(fn (array $person): array => self::person($person), $model->people($row['id'], 'teacher'));
        $ageGroups = $row['uses_age_groups'] ? array_keys(config('extracurricular.age_groups')) : [];
        $teams     = array_map(fn (array $team): array => self::team($team, $card['image']), (new TeamModel())->ofProgramme($row['id']));
        $placed    = array_merge([], ...array_map(fn (array $team): array => array_column($team['roster'], 'id'), $teams));

        // A team keeps its age group even after the programme stops using age groups
        $filterGroups = array_values(array_filter(array_unique([...$ageGroups, ...array_column($teams, 'ageGroup')])));
        $age          = in_array($age, $filterGroups, true) ? $age : '';
        $inAge        = fn (array $item): bool => $age === '' || $item['ageGroup'] === $age;

        // Members not in a team yet, each with the teams they may join.
        // A team with no age group takes any age.
        $unassigned = array_map(fn (array $person): array => $person + ['teams' => array_map(fn (array $team): array => ['value' => $team['id'], 'label' => $team['name']],
            array_values(array_filter($teams, fn (array $team): bool => in_array($team['ageGroup'], ['', $person['ageGroup']], true))))],
            array_values(array_filter($members, fn (array $person): bool => !in_array($person['id'], $placed, true))));

        // The student's teams, or the whole member list if they are in no team
        $theirs = array_values(array_filter($teams, fn (array $team): bool => in_array($studentId, array_column($team['roster'], 'id'), true)));
        $squad  = $theirs === [] ? [['title' => $row['name'], 'players' => $members]]
            : array_map(fn (array $team): array => ['title' => $team['name'], 'players' => $team['roster']], $theirs);

        return $card + [
            // Null hides the awards panel
            'awards'       => !feature('achievements') ? null : array_map(fn (array $award): array => self::awardCard($award, $card['image']),
                (new AchievementModel())->ofExtracurricular($row['id'])),
            'description'  => $row['description'] ?? '',
            'created'      => $row['created_at'],
            'schedule'     => $row['schedule'] ?? '',
            'location'     => $row['venue'] ?? '',
            'ageGroups'    => $ageGroups,      // Empty if the programme doesn't use age groups
            'filterGroups' => $filterGroups,
            'age'          => $age,            // Empty means all ages
            'settings'     => array_intersect_key($row, array_flip(['age_group_limit', 'uses_age_groups', 'open_to', 'lowest_grade', 'is_open'])),
            'coach'        => ['name' => $row['coach_name'] ?? '', 'specialty' => $row['coach_specialty'] ?? '', 'email' => $row['coach_email'] ?? '',
                               'phone' => $row['coach_phone'] ?? ''],
            'teams'        => $teams,
            'teamsShown'   => array_values(array_filter($teams, $inAge)),
            'members'      => $members,
            'unassigned'   => array_values(array_filter($unassigned, $inAge)),
            'joinRequests' => $requests,
            'squad'        => $member ? $squad : null,                           // Members only
            'studentId'    => $studentId,
            'noticeCards'  => feature('notices') ? self::noticeCards($user, $row['id']) : null,
            'enrolment'    => ['members' => count($members), 'capacity' => $row['age_group_limit'] ?? rule('age_group_limit')],
            'cards'        => self::staffCards($row, $current, $member),
        ];
    }

    private static function card(array $row, ?array $current): array
    {
        $status = $current['status'] ?? null;

        return [
            'id'        => $row['id'],
            'name'      => $row['name'],
            'type'      => $row['type'],
            'category'  => $row['category'] ?? config("extracurricular.types.{$row['type']}.pill"),
            'image'     => $row['cover_url'] ?? asset(config('extracurricular.default_cover')),
            'review'    => $row['review'],
            'archived'  => $row['archived_at'] !== null,
            'state'     => match (true)
            {
                $row['archived_at'] !== null                    => 'archived',
                $row['review'] !== 'approved'                   => 'waiting',
                $status === 'member'                            => 'enrolled',
                $status !== null && $status !== 'declined'      => 'requested',   // Waiting for a parent or the teacher in charge
                default                                         => 'open',        // Never asked, or was turned down and may ask again
            },
            'answer'    => $status !== 'declined' ? null : ($current['declined_by'] === 'teacher'
                ? 'Not accepted' . ($current['teacher_note'] ? ": \"{$current['teacher_note']}\"" : '') . '. You can ask again.'
                : words('A {parent} said no') . ($current['parent_note'] ? ": \"{$current['parent_note']}\"" : '') . '. You can ask again.'),
            'whyNot'    => null,    // Filled in by cards()
            'watched'   => false,   // Filled in by cards()
            'tic'       => ['name' => $row['tic_name'] ?? 'Not assigned yet', 'photo' => $row['tic_photo'] ?? '', 'assigned' => $row['tic_id'] !== null],
            'ticId'     => $row['tic_id'],
            'coachName' => $row['coach_name'] ?? '',
            'phone'     => $row['coach_phone'] ?? '',
        ];
    }

    private static function person(array $person): array
    {
        return [
            'id'        => $person['id'],
            'name'      => $person['name'],
            'photo'     => $person['photo'] ?? '',
            'grade'     => $person['grade_number'],
            'ageGroup'  => JoinRules::ageGroup($person['date_of_birth']) ?? '—',
            'role'      => $person['position'] ?? 'Member',
            'position'  => $person['position'] ?? null,
            'indexNo'   => $person['code'] ?? '',
            'submitted' => $person['asked_on'] ?? null,
        ];
    }

    // A team with no age group takes any age
    private static function team(array $team, string $programmeCover): array
    {
        return [
            'id'       => $team['id'],
            'name'     => $team['name'],
            'ageGroup' => $team['age_group'] ?? '',
            'cover'    => $team['cover_url'] ?? $programmeCover,
            'roster'   => array_map(fn (array $person): array => self::person($person), $team['members']),
        ];
    }

    // The award opened in the pop-up. $wanted is its id, or 'new' for staff who may add one.
    // Returns null if it is missing, belongs to another programme, or achievements are off.
    public static function award(array $programme, string $wanted, bool $canEdit): ?array
    {
        if ($programme['awards'] === null || $wanted === '' || ($wanted === 'new' && !$canEdit))
        {
            return null;
        }

        $row = $wanted === 'new' ? null : (new AchievementModel())->find((int) $wanted);

        if ($wanted !== 'new' && ($row === null || (int) $row['extracurricular_id'] !== (int) $programme['id']))
        {
            return null;
        }

        return [
            'id'           => $row['id'] ?? 'new',
            'title'        => $row['title'] ?? '',
            'year'         => isset($row) ? substr($row['achieved_on'], 0, 4) : '',
            'date'         => $row['achieved_on'] ?? '',
            'venue'        => $row['venue'] ?? '',
            'level'        => $row['level'] ?? '',
            'tournament'   => $row['event_name'] ?? '',
            'organisedBy'  => $row['organiser'] ?? '',
            'place'        => $row['result'] ?? '',
            'medal'        => $row['medal'] ?? '',
            'ageGroup'     => $row['age_group'] ?? '',
            'representing' => $row['team'] ?? (isset($row) ? 'Individual' : ''),
            'summary'      => $row['summary'] ?? '',
            'image'        => isset($row) ? ($row['photo_url'] ?? $programme['image']) : '',
            'participants' => $row['students'] ?? [],
            'others'       => $row['others'] ?? '',      // Names of people who are not in the portal
            'gallery'      => $row['photos'] ?? [],
            'honours'      => (bool) ($row['on_honours_board'] ?? false),
        ];
    }

    private static function awardCard(array $award, string $programmeCover): array
    {
        return [
            'id'    => $award['id'],
            'title' => $award['title'],
            'year'  => substr($award['achieved_on'], 0, 4),
            'level' => $award['level'],
            'kind'  => $award['team'] === null ? 'Individual' : 'Team',
            'image' => $award['photo_url'] ?? $programmeCover,
        ];
    }

    // Only members and staff see the coach's contact details
    private static function staffCards(array $row, ?array $current, bool $member): array
    {
        $hidden = 'Shown once you join';
        $value  = fn (?string $text): string => ($text ?? '') !== '' ? $text : '—';
        $status = $current['status'] ?? null;

        return [
            'tic'     => ['title' => words('{Teacher} in Charge'), 'person' => [
                'name' => $row['tic_name'] ?? 'Not assigned yet', 'line' => $value($row['tic_subjects']), 'photo' => $row['tic_photo'] ?? '',
                'assigned' => $row['tic_id'] !== null, 'email' => $value($row['tic_email']), 'phone' => $value($row['tic_phone'])]],
            'coach'   => ['title' => 'Coach / Instructor', 'person' => [
                'name' => $row['coach_name'] ?? 'Not assigned yet', 'line' => $value($row['coach_specialty']), 'photo' => '',
                'assigned' => ($row['coach_name'] ?? '') !== '',
                'email' => $member ? $value($row['coach_email']) : $hidden, 'phone' => $member ? $value($row['coach_phone']) : $hidden]],
            'details' => ['title' => 'Details', 'person' => null, 'items' => [
                ['clock', 'Schedule', $value($row['schedule'])],
                ['mapPin', 'Location', $value($row['venue'])],
            ]],
            'status'  => ['title' => 'Status', 'person' => null, 'items' => [
                ['check', 'Membership', match ($status)
                {
                    'member'  => 'Enrolled',
                    'parent'  => words('Waiting for your {parent}'),
                    'teacher' => words('Waiting for the {teacher} in charge'),
                    default   => 'Not Enrolled',
                }],
                ['calendar', 'Joined', $status === 'member' && $current['joined_on'] !== null ? date(country('date_format'), strtotime($current['joined_on'])) : '—'],
            ]],
            'created' => ['title' => 'Created Date', 'person' => null, 'items' => [
                ['calendar', 'Date Added', date(country('date_format'), strtotime($row['created_at']))],
            ]],
        ];
    }

    // Notices here are read only, with no pin, edit or delete
    private static function noticeCards(array $user, int $id): array
    {
        return array_map(fn (array $notice): array => $notice + ['canManage' => false, 'canReview' => false, 'isMine' => false, 'isForMe' => true],
            (new NoticeModel())->forExtracurricular($user, $id));
    }
}