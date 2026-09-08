<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\SchoolRules;
use App\Models\SchoolSettings;
use App\Models\SchoolYear;
use Core\Controller;
use Core\Upload;
use Core\Validator;

// A saved setting is used instead of the value in config/white_label/
// Saving an empty box, or the file's own value, removes the saved setting
class SettingsController extends Controller
{
    // After a refused save the page opens in edit mode with what was typed
    public function show(string $role): void
    {
        $user  = $this->requireRole($role);
        $typed = $this->getFlash('settings_form') ?? [];

        $this->page("{$role}/settings", $user, [
            'editing'  => $typed !== [],
            'error'    => $this->getFlash('error'),
            'sections' => $this->sections($typed),
            'logo'     => [
                'now'   => school('logo'),
                'own'   => SchoolSettings::saved('school.logo') !== null,   // Offers the "Use the default logo" choice
                'types' => config('uploads.logo.types'),
                'kb'    => (int) config('uploads.logo.kb'),
            ],
        ]);
    }

    //175-203
    // 'beside' is the card that shares the logo's row
    private function sections(array $typed): array
    {
        $cards    = $this->profileCards($typed) + $this->terminologyCards($typed) + ['System Information' => $this->systemCards()];

        foreach ($this->ruleCards($typed) as $name => $ruleCards)
        {
            $cards[$name] = [...($cards[$name] ?? []), ...$ruleCards];
        }

        $isBeside = fn (array $card): bool => $card['edit'] === config('settings.logo.beside');
        $sections = [];

        foreach (config('settings.sections') as $name => [$icon, $line])
        {
            $logo   = $name === config('settings.logo.section');
            $beside = $logo ? (array_values(array_filter($cards[$name], $isBeside))[0] ?? null) : null;

            $sections[] = [
                'header' => ['icon' => $icon, 'title' => words($name), 'subtitle' => words($line), 'tone' => ''],
                'logo'   => $logo,
                'cards'  => $logo ? array_values(array_filter($cards[$name], fn (array $card): bool => !$isBeside($card))) : $cards[$name],
                'beside' => $beside === null ? null : ['wide' => false] + $beside,
            ];
        }

        return $sections;
    }
//277-278
    }
}
