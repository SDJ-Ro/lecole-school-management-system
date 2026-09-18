<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AchievementModel;
use Core\Controller;

class LandingController extends Controller
{
    public function index(): void
    {
        $this->view('landing_page/landing', [
            'pathways'   => $this->pathways(),
            'highlights' => (new AchievementModel())->honoursBoard(3),   // The 3 newest
        ]);
    }

    // The public honours board, one year at a time
    // Shows the chosen year, or else the newest year that has any
    public function achievements(): void
    {
        $board = new AchievementModel();
        $years = $board->honoursBoardYears();
        $year  = in_array((int) $this->queryText('year'), $years, true) ? (int) $this->queryText('year') : ($years[0] ?? null);

        $this->view('landing_page/achievements', [
            'years'        => $years,
            'year'         => $year,
            'achievements' => $year === null ? [] : $board->honoursBoard(null, $year),
        ]);
    }

    private function pathways(): array
    {
        return [
            [
                'title' => word('students'),
                'tone'  => 'tan',
                'photo' => school('photos.student.src'),
                'alt'   => school('photos.student.alt'),
                'text'  => words('Your timetable, {grades}, and report cards sit beside the clubs, teams, and creative work you take part in. Track achievements and never miss a notice or deadline.'),
            ],
            [
                'title' => word('teachers'),
                'tone'  => 'maroon',
                'photo' => school('photos.teacher.src'),
                'alt'   => school('photos.teacher.alt'),
                'text'  => words('Plan lessons, record {grades}, and run the clubs and teams you lead from one place. Log {student} progress and character notes, and post notices straight to your {classes}.'),
            ],
            [
                'title' => word('parents'),
                'tone'  => 'lightblue',
                'photo' => school('photos.parent.src'),
                'alt'   => school('photos.parent.alt'),
                'text'  => words('See academic progress as it happens and follow the activities, teams, and achievements shaping your child. Approve {institution} forms and stay in touch with {teachers}.'),
            ],
            [
                'title' => word('management'),
                'tone'  => 'terracotta',
                'photo' => school('photos.management.src'),
                'alt'   => school('photos.management.alt'),
                'text'  => words('Review enrolment and approval queues, oversee staffing, {classes}, and curriculum, and read {institution}-wide performance at a glance — then publish notices to everyone.'),
            ],
        ];
    }
}
