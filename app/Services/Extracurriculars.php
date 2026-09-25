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
