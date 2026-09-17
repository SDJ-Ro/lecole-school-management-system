<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\LeaveRequestModel;
use App\Models\PeopleModel;
use App\Services\AchievementTimeline;
use App\Services\CertificateDraft;
use App\Services\RequestCards;

// The parent's Child profile, and the "Viewing" switch that picks which child the parent portal shows
// It extends ExtracurricularController to reuse the club and sport pages for the Sports & Clubs tab
class ChildProfileController extends ExtracurricularController
{
    // Each tab has a label and the module it needs, if any
    private const TABS = [
        'information'  => ['Information', null],
        'academics'    => ['Academics', 'term_marks'],
        'clubs'        => ['Sports & Clubs', 'extracurricular'],
        'achievements' => ['Achievements', 'achievements'],
        'certificate'  => ['Certificate', 'certificates'],
    ];

    // GET /parent/child-profile
    public function show(): void
    {
        $user  = $this->requireRole('parent');
        $tabs  = array_map(fn (array $tab): string => $tab[0], array_filter(self::TABS, fn (array $tab): bool => $tab[1] === null || feature($tab[1])));
        $tab   = array_key_exists($this->queryText('tab'), $tabs) ? $this->queryText('tab') : 'information';
        $child = $user['child'] === null ? null : (new PeopleModel())->find($user['child']);
        $data  = ['tabs' => $tabs, 'tab' => $tab, 'profile' => null];

        if ($child !== null)
        {
            $data['profile'] = (new PeopleController())->profileData($child, null);
            $data += match ($tab)
            {
                'academics'    => ['exportUrl' => '/parent/child-profile/print'] + $data['profile']['student']['book'],
                'clubs'        => (int) $this->queryText('id') !== 0
                    ? $this->programmePage($user, 'student', (int) $this->queryText('id'), '/parent/child-profile', ['tab' => 'clubs'])
                    : $this->listPage($user, 'student', '/parent/child-profile', ['tab' => 'clubs']),
                'achievements' => $this->achievements($child),
                'certificate'  => $this->certificate($child),
                // The Information tab also holds the Leave School form
                default       => ['leaving' => feature('parent_consent') ? ['request' => (new LeaveRequestModel())->latest($child['id']), 'name' => $child['first_name']] : null],
            };
        }

        $this->page('parent/child_profile', $user, $data);
    }

    private function achievements(array $child): array
    {
        $items = AchievementTimeline::forStudent($child['id']);

        return [
            'metrics'  => AchievementTimeline::metrics($items),
            'timeline' => AchievementTimeline::byYear($items),
        ];
    }

    // Read only, because the child sends the requests
    private function certificate(array $child): array
    {
        $sheet = CertificateDraft::of($child['id']);

        return ['certificate' => $sheet, 'requests' => RequestCards::ofStudent($child['id'], $sheet['name'])];
    }
}
