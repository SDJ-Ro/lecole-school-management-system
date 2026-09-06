<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\ClassModel;
use App\Models\ComplaintModel;
use App\Models\SchoolYear;
use App\Services\Notify;
use Core\Controller;
use DateTime;

// Inquiries & Complaints
// A parent writes about one or more of their children, and management answers once
// Each inquiry keeps the school year it was sent in
class ComplaintController extends Controller
{
    // GET /parent/complaints. Only the ones about the child being viewed
    public function parent(): void
    {
        $user = $this->requireRole('parent');
        $rows = $user['child'] === null ? [] : (new ComplaintModel())->forParent($user['id'], $user['child']);

        $this->page('parent/complaints', $user, $this->board($rows, false));
    }

    // GET /management/complaints
    public function management(): void
    {
        $user = $this->requireRole('management');

        $this->page('management/complaints', $user, $this->board((new ComplaintModel())->forManagement(), true));
    }

    // Unknown filter values are dropped
    // $byClass adds the grade and class filters for management, using the class each child was in that year
    // The 'none' class filter finds children with no class that year
    private function board(array $rows, bool $byClass): array
    {
        $categories = config('complaints.categories');
        $statuses   = config('complaints.statuses');
        $current    = (new SchoolYear())->current();
        $years      = array_values(array_unique([$current, ...array_map('intval', array_column($rows, 'school_year'))]));
        rsort($years);
        $grades     = $byClass ? (new ClassModel())->grades() : [];
        $grade      = $this->queryText('grade');
        $grade      = $grade === 'none' || isset($grades[(int) $grade]) ? $grade : '';
        $classes    = $grade === '' || $grade === 'none' ? [] : array_column($grades[(int) $grade]['classes'], 'name', 'id');
        $filters    = [
            'q'        => $this->queryText('q'),
            'category' => array_key_exists($this->queryText('category'), $categories) ? $this->queryText('category') : '',
            'status'   => array_key_exists($this->queryText('status'), $statuses) ? $this->queryText('status') : '',
            'year'     => in_array((int) $this->queryText('year'), $years, true) ? (int) $this->queryText('year') : $current,
            'grade'    => $grade,
            'class'    => isset($classes[(int) $this->queryText('class')]) ? $this->queryText('class') : '',
        ];
        $search     = mb_strtolower($filters['q']);

        $matching = array_filter($rows, fn (array $row): bool =>
            (int) $row['school_year'] === $filters['year']
            && ($filters['category'] === '' || $row['category'] === $filters['category'])
            && ($filters['status'] === '' || $row['status'] === $filters['status'])
            && ($filters['grade'] === '' || in_array($filters['grade'] === 'none' ? '0' : $filters['grade'], explode(',', $row['grade_ids']), true))
            && ($filters['class'] === '' || in_array($filters['class'], explode(',', $row['class_ids']), true))
            && ($search === '' || str_contains(mb_strtolower(implode(' ', [$row['subject'], $row['body'], $row['category'], $row['students'],
                $row['parent_name']])), $search)));

        return [
            'filters'    => $filters,
            'categories' => $categories,
            'statuses'   => $statuses,
            'years'      => $years,
            'grades'     => $byClass ? array_map(fn (array $row): string => grade_name((int) $row['number']), $grades) : null,
            'classes'    => $classes,
            'complaints' => array_values(array_map([$this, 'card'], $matching)),
        ];
    }

    }
}