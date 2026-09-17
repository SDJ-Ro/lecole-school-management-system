    // GET /student/academic
    public function student(): void
    {
        $user = $this->requireRole('student');

        $this->page('student/academic', $user, RecordBook::shown(RecordBook::forStudent($user['id']), '/student/academic/print'));
    }

    // GET /student/academic/print and /parent/child-profile/print
    // Only published terms can be printed
    public function recordPrint(string $role): void
    {
        $user      = $this->requireRole($role);
        $studentId = $role === 'parent' ? $user['child'] : $user['id'];
        $back      = $role === 'parent' ? '/parent/child-profile?tab=academics' : '/student/academic';
        $student   = $studentId === null ? null : (new PeopleModel())->find($studentId);
        $books     = $student === null ? [] : RecordBook::forStudent($studentId);
        $year      = (int) $this->queryText('year');
        $term      = (int) $this->queryText('term');
        $record    = $books[$year]['terms'][$term] ?? $this->refuse('That record does not exist.', $back, 404);

        $this->view('print/record_book', [
            'student' => ['name' => $student['full_name'], 'code' => $student['identifier']],
            'book'    => $books[$year],
            'term'    => $term,
            'record'  => $record,
        ]);
    }

    // This year and next year
    // 'suggested' means next year isn't saved yet, so the usual dates are shown
    // 'usual' means the usual dates were filled in at year-end and still need checking
    // 'box' is what the pop-up shows, including what was typed before a refusal
    private function schoolYear(?array $typed): array
    {
        $years   = new SchoolYear();
        $current = $years->current();
        $today   = date('Y-m-d');
        $list    = [];

        foreach ([$current, $current + 1] as $year)
        {
            $saved     = $years->terms($year);
            $suggested = $saved === [] && $year > $current;
            $shown     = $suggested ? YearEnd::usualTerms($year) : $saved;
            $locks     = TermDates::locks($saved, $years->publishedTerms($year), $today);
            $terms     = [];

            foreach (range(1, (int) config('white_label.academic.terms_per_year')) as $number)
            {
                $dates          = $shown[$number] ?? ['starts_on' => '', 'ends_on' => ''];
                $terms[$number] = [
                    'starts_on' => $dates['starts_on'],
                    'ends_on'   => $dates['ends_on'],
                    'state'     => match (true)
                    {
                        $dates['starts_on'] === ''    => null,
                        $suggested                    => 'Usual',
                        $dates['ends_on'] < $today    => 'Finished',
                        $dates['starts_on'] <= $today => 'Now',
                        default                       => 'Coming',
                    },
                    'lock'      => $locks[$number] ?? ['start' => false, 'end' => false],
                    'box'       => $typed[$year][$number] ?? ['starts_on' => $dates['starts_on'], 'ends_on' => $dates['ends_on']],
                ];
            }

            $list[$year] = ['label' => $year === $current ? 'Current' : 'Next', 'set' => $shown !== [], 'suggested' => $suggested,
                            'terms' => $terms, 'usual' => $years->datesFromUsual($year)];
        }

        return ['years' => $list, 'past' => $this->pastYears($years->termsBefore($current)), 'reopen' => $typed !== null];
    }

    // A grade may be without a stage for a while
    private function stageFor(int $gradeNumber, array $stages): ?array
    {
        foreach ($stages as $stage)
        {
            if ($gradeNumber >= $stage['first_grade'] && $gradeNumber <= $stage['last_grade'])
            {
                return $stage;
            }
        }

        return null;
    }

    // Chart data for one grade's classes, one subject and one term of this year
    // Returns null when there is no chart to show
    private function chart(array $grades): ?array
    {
        if (!feature('term_marks'))
        {
            return null;
        }

        $withClasses = array_values(array_filter($grades, fn (array $grade): bool => $grade['classes'] !== []));

        if ($withClasses === [])
        {
            return null;
        }

        $years    = new SchoolYear();
        $terms    = $years->startedTerms() ?: [1];
        $byId     = array_column($withClasses, null, 'id');
        $grade    = $byId[(int) $this->queryText('grade')] ?? $withClasses[0];
        $subjects = array_values($grade['stage']['subjects'] ?? []);
        $subject  = in_array($this->queryText('subject'), $subjects, true) ? $this->queryText('subject') : ($subjects[0] ?? '');
        $term     = in_array((int) $this->queryText('term'), $terms, true) ? (int) $this->queryText('term') : end($terms);
        $results  = TermResults::forGrade($years->current(), $term, $grade['number'])['classes'];
        $rows     = [];

        // Shows 0 until the term is published
        foreach ($grade['classes'] as $class)
        {
            $rows[] = ['label' => $class['name'], 'average' => $results[$class['id']]['average'][$subject] ?? 0, 'best' => $results[$class['id']]['highest'][$subject] ?? 0];
        }

        return [
            'variant'    => 'counts',
            'id'         => 'j-academic-chart',
            'title'      => words('{Class} Section Performance'),
            'yAxisTitle' => 'Score',
            'xAxisTitle' => words('{Class} Section'),
            'ticks'      => [0, 20, 40, 60, 80, 100],
            'series'     => [
                ['key' => 'average', 'label' => words('{Class} Average'), 'color' => 'skyblue'],
                ['key' => 'best', 'label' => 'Highest Mark', 'color' => 'maroon'],
            ],
            'data'       => $rows,
            'filters'    => [
                ['name' => 'grade', 'label' => word('grade'), 'value' => (string) $grade['id'],
                 'options' => array_map(fn (array $g): array => ['value' => (string) $g['id'], 'label' => grade_name($g['number'])], $withClasses)],
                ['name' => 'subject', 'label' => word('subject'), 'value' => $subject, 'options' => $subjects],
                ['name' => 'term', 'label' => word('term'), 'value' => (string) $term,
                 'options' => array_map(fn (int $t): array => ['value' => (string) $t, 'label' => word('term') . " {$t}"], $terms)],
            ],
        ];
