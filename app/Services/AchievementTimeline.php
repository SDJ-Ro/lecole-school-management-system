<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AchievementModel;

final class AchievementTimeline
{
    // Recorded achievements plus the automatic ones from marks, newest first.
    // Pass $books if the record books were already read.
    public static function forStudent(int $studentId, ?array $books = null): array
    {
        $books ??= feature('term_marks') ? RecordBook::forStudent($studentId) : [];
        $items   = [...self::items((new AchievementModel())->ofStudent($studentId)), ...RecordBook::awards($books)];

        usort($items, fn (array $a, array $b): int => $b['date'] <=> $a['date']);

        return $items;
    }

    // "Earned in Last Year" counts this year and last year
    public static function metrics(array $items): array
    {
        $count = fn (callable $test): string => (string) count(array_filter($items, $test));

        return [
            ['color' => 'sand',      'icon' => 'trophy',          'label' => 'Total Achievements', 'value' => (string) count($items)],
            ['color' => 'moss',      'icon' => 'award',           'label' => 'Earned in Last Year',
             'value' => $count(fn (array $item): bool => (int) substr($item['date'], 0, 4) >= (int) date('Y') - 1)],
            ['color' => 'maroon',    'icon' => 'extracurricular', 'label' => 'Extracurriculars',
             'value' => $count(fn (array $item): bool => in_array($item['group'], ['sports', 'clubs'], true))],
            ['color' => 'lightblue', 'icon' => 'graduationCap',   'label' => 'Academic Honours',
             'value' => $count(fn (array $item): bool => $item['group'] === 'academic')],
        ];
    }

    // Groups the items by year, newest year first
    public static function byYear(array $items): array
    {
        $years = [];

        foreach ($items as $item)
        {
            $years[(int) substr($item['date'], 0, 4)][] = $item + ['month' => date(country('month_format'), strtotime($item['date']))];
        }

        krsort($years);

        return $years;
    }

    // A club's or sport's achievement is edited on its own page, so it is not editable here
    public static function items(array $achievements): array
    {
        return array_map(fn (array $achievement): array => [
            'group'       => self::groupOf($achievement),
            'title'       => $achievement['title'],
            'date'        => $achievement['achieved_on'],
            'description' => $achievement['summary'],
            'id'          => (int) $achievement['id'],
            'editable'    => $achievement['extracurricular_id'] === null,
            'evidence'    => $achievement['evidence_path'] !== null,
        ], $achievements);
    }

    public static function groupOf(array $achievement): string
    {
        return ($achievement['extracurricular_type'] ?? null) !== null
            ? config("extracurricular.types.{$achievement['extracurricular_type']}.group")
            : config("achievements.categories.{$achievement['category']}.group", 'clubs');
    }
}
