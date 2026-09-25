<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TermMarkModel;

// A student's record book has one book per school year, with published terms only.
// A repeated grade gets its own book.
// A term with no marks for the student is left out, for example if they joined later.
final class RecordBook
{
    // The student's books by year, oldest first
    public static function forStudent(int $studentId): array
    {
        $model = new TermMarkModel();
        $books = [];
        $seen  = [];

        foreach ($model->yearsOf($studentId) as $year)
        {
            $terms = [];

            foreach ($model->publishedTerms($year['class_id'], $year['year']) as $term => $publication)
            {
                $results = TermResults::forGrade($year['year'], $term, $year['grade_number']);
                $me      = $results['students'][$studentId] ?? null;

                if ($me !== null)
                {
                    $terms[$term] = self::term($me, $results, $model->comment($studentId, $year['year'], $term), $publication['published_at']);
                }
            }

            if ($terms !== [])
            {
                $books[$year['year']] = [
                    'grade' => $year['grade_number'],
                    'label' => grade_name($year['grade_number']) . (isset($seen[$year['grade_number']]) ? ' (Repeat)' : ''),
                    'class' => $year['class_name'],
                    'terms' => $terms,
                    'year'  => TermResults::forYear($year['year'], $year['grade_number'])[$studentId] ?? ['awards' => [], 'subjects' => []],
                ];
                $seen[$year['grade_number']] = true;
            }
        }

        return $books;
    }

    // Opens on the newest term. A null $exportUrl hides the Export PDF button.
    public static function shown(array $books, ?string $exportUrl): array
    {
        $year = array_key_last($books);

        return ['records' => $books, 'year' => $year, 'term' => $year === null ? null : array_key_last($books[$year]['terms']), 'exportUrl' => $exportUrl];
    }

    // Automatic achievements from the marks, dated the day each term was published
    public static function awards(array $books): array
    {
        $titles = ['commended' => 'Commended', 'top_of_class' => 'Top of ' . word('class'), 'top_of_grade' => 'Top of ' . word('grade')];
        $items  = self::yearAwards($books);

        foreach ($books as $book)
        {
            foreach ($book['terms'] as $term => $record)
            {
                foreach ($record['awards'] as $award)
                {
                    $items[] = [
                        'group'       => 'academic',
                        'title'       => "{$titles[$award]} — {$book['label']}, " . word('term') . " {$term}",
                        'date'        => $record['publishedOn'],
                        'description' => word('term') . " average {$record['average']}" . match ($award)
                        {
                            'top_of_class' => ", the best in {$book['class']}.",
                            'top_of_grade' => ', the best in ' . grade_name($book['grade']) . '.',
                            default        => '.',
                        },
                    ];
                }
            }
        }

        return $items;
    }

    // Awards for the whole year, dated the day its last term was published
    public static function yearAwards(array $books): array
    {
        $items = [];

        foreach ($books as $book)
        {
            $yearDate = end($book['terms'])['publishedOn'];
            $grade    = grade_name($book['grade']);

            foreach ($book['year']['awards'] as $award)
            {
                $items[] = [
                    'group'       => 'academic',
                    'title'       => match ($award)
                    {
                        'year_commended'    => 'Commended Every ' . word('term') . " — {$book['label']}",
                        'year_top_of_class' => "Top of {$book['class']} for the Year — {$book['label']}",
                        'year_top_of_grade' => "Top of {$grade} for the Year",
                    },
                    'date'        => $yearDate,
                    'description' => match ($award)
                    {
                        'year_commended'    => 'Commended in every ' . strtolower(word('term')) . ' of the year.',
                        'year_top_of_class' => 'The best in ' . $book['class'] . ' in every ' . strtolower(word('term')) . ' of the year.',
                        'year_top_of_grade' => "The best year average in {$grade}.",
                    },
                ];
            }

            foreach ($book['year']['subjects'] as $subject)
            {
                $items[] = [
                    'group'       => 'academic',
                    'title'       => "Top in {$subject} — {$book['label']}",
                    'date'        => $yearDate,
                    'description' => "The best year average in {$subject} in {$grade}.",
                ];
            }
        }

        return $items;
    }

    private static function term(array $me, array $results, ?array $comment, string $publishedAt): array
    {
        $class = $results['classes'][$me['class_id']];
        $rows  = [];

        foreach ($me['marks'] as $subject => $mark)
        {
            $rows[] = ['subject' => $subject, 'mark' => $mark ?? 'AB', 'highest' => $class['highest'][$subject] ?? '—', 'classAverage' => $class['average'][$subject] ?? 0];
        }

        return [
            'marks'        => $rows,
            'total'        => $me['average'] === null ? '—' : $me['total'],
            'outOf'        => $me['average'] === null ? '—' : $me['outOf'],
            'average'      => $me['average'] === null ? '—' : number_format($me['average'], 1) . '%',
            'placement'    => $me['position'] === null ? '—' : ordinal($me['position']),
            'mine'         => (int) round($me['average'] ?? 0),                    // For the trend chart bars
            'gradeAverage' => (int) round($results['gradeAverage'] ?? 0),
            'awards'       => $me['awards'],
            'teacher'      => $comment['teacher'] ?? '—',
            'feedback'     => $comment['comment'] ?? '',
            'publishedOn'  => substr($publishedAt, 0, 10),
            'date'         => date(country('date_format'), strtotime($publishedAt)),
        ];
    }
}
