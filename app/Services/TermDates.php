<?php

declare(strict_types=1);

namespace App\Services;

use Core\Validator;

// Checks the term dates typed on the school year form.
// A locked date keeps its saved value whatever is sent.
// Dates are 'Y-m-d' strings, so they can be compared as text.
final class TermDates
{
    // A started term can't change its start date. An ended or published term can't change either date.
    public static function locks(array $saved, array $published, string $today): array
    {
        $locks = [];

        foreach ($saved as $term => $dates)
        {
            $done          = $dates['ends_on'] < $today || in_array($term, $published, true);
            $locks[$term] = ['start' => $done || $dates['starts_on'] <= $today, 'end' => $done];
        }

        return $locks;
    }

    // Returns the dates to save, or an error message. An empty list means there is nothing to save yet.
    // $before is the last day of the year before, because Term 1 must start after it.
    public static function check(int $year, array $typed, array $saved, array $published, ?string $before, string $today): array
    {
        $locks = self::locks($saved, $published, $today);
        $terms = [];

        foreach ($typed as $term => $dates)
        {
            $terms[$term] = [
                'starts_on' => ($locks[$term]['start'] ?? false) ? $saved[$term]['starts_on'] : $dates['starts_on'],
                'ends_on'   => ($locks[$term]['end'] ?? false) ? $saved[$term]['ends_on'] : $dates['ends_on'],
            ];
        }

        $all = array_merge(...array_map('array_values', array_values($terms)));

        if ($saved === [] && implode('', $all) === '')
        {
            return [[], null];
        }

        if (in_array('', $all, true))
        {
            return [null, "Please fill in every date of {$year}."];
        }

        $term = words('{Term}');
        $last = $before;

        foreach ($terms as $number => $dates)
        {
            $name   = "{$year} {$term} {$number}";
            $errors = Validator::check($dates, ['starts_on' => 'date', 'ends_on' => 'date'], ['starts_on' => "{$name}'s start", 'ends_on' => "{$name}'s end"]);
            $moved  = fn (string $key, string $lock): bool => !($locks[$number][$lock] ?? false) && ($saved[$number][$key] ?? null) !== $dates[$key];

            $refusal = match (true)
            {
                $errors !== []                                                        => reset($errors),
                $dates['ends_on'] <= $dates['starts_on']                              => "{$name} must end after it starts.",
                $last !== null && $dates['starts_on'] <= $last                        => $number === 1
                    ? "{$year}'s {$term} 1 must start after the year before ends."
                    : "{$name} must start after {$term} " . ($number - 1) . ' ends.',
                ($moved('starts_on', 'start') && $dates['starts_on'] < $today)
                    || ($moved('ends_on', 'end') && $dates['ends_on'] < $today)       => "{$name} can't be moved into the past.",
                default                                                               => null,
            };

            if ($refusal !== null)
            {
                return [null, $refusal];
            }

            $last = $dates['ends_on'];
        }

        // Catches a mistyped year such as 2072
        if ($last >= date('Y-m-d', strtotime($terms[1]['starts_on'] . ' +1 year')))
        {
            return [null, "{$year}'s {$term} dates span more than a year."];
        }

        return [$terms, null];
    }
}
