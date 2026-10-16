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

    // POST /{role}/settings. Saves the details, logo, words and marks rules together
    // Rule changes start from next school year
    public function save(string $role): never
    {
        $user   = $this->requireRole($role);
        $back   = "/{$role}/settings";
        $fields = config('settings.profile');
        $terms  = array_merge(...array_values(config('settings.terminology')));
        $words  = array_values(array_filter([...array_keys($terms), ...array_values($terms)]));
        $rules  = config('settings.rules');
        $boxes  = array_combine(array_keys($rules), array_map(fn (string $key): string => $this->ruleBox($key), array_keys($rules)));   // The form box name for each rule
        $typed  = [];

        foreach ($fields as $key => $field)
        {
            $typed[$key] = $this->postText($key, ($field[4] ?? '') === 'lines' ? 600 : 200);
        }

        foreach ($words as $key)
        {
            $typed[$key] = $this->postText($key, 30);
        }

        foreach ($boxes as $box)
        {
            $typed[$box] = $this->postText($box, 3);
        }

        $errors = Validator::check($typed,
            array_map(fn (array $field): string => $field[1], $fields) + array_fill_keys($words, 'name|max:30')
                + array_combine($boxes, array_column($rules, 1)),
            array_map(fn (array $field): string => words($field[0]), $fields) + array_combine($words, array_map('default_word', $words))
                + array_combine($boxes, array_column($rules, 0)));

        // Next year's rules, where an empty box means the file's value
        $next      = (new SchoolYear())->current() + 1;
        $ruleValue = fn (string $key): int => $typed[$boxes[$key]] === '' ? (int) config("white_label.rules.{$key}") : (int) $typed[$boxes[$key]];

        if ($errors === [] && $ruleValue('pass_mark') >= $ruleValue('commended.average'))
        {
            $errors[] = 'The pass mark must be below the Commended average.';
        }

        if ($errors === [] && $ruleValue('no_promotion.average') >= $ruleValue('pass_mark'))
        {
            $errors[] = 'The No-Promotion Mark must be below the pass mark.';
        }

        [$logo, $logoError] = Upload::image($_FILES['logo'] ?? [], 'branding', 'logo');

    //93-141
    
        $values = [];

        foreach (array_keys($fields) as $key)
        {
            // The address is a list of lines
            // An empty value, or the file's own value, removes the saved setting
            $value = $key === 'address' ? array_values(array_filter(array_map('trim', explode("\n", $typed[$key])))) : $typed[$key];

            $values["school.{$key}"] = $value === '' || $value === [] || $value === config("white_label.school.{$key}") ? null : $value;
        }

        foreach ($words as $key)
        {
            $values["wording.{$key}"] = $typed[$key] === '' || $typed[$key] === default_word($key) ? null : $typed[$key];
        }

        $oldLogo = SchoolSettings::saved('school.logo');

        if ($logo !== null || $this->postText('logo_default', 1) === '1')
        {
            $values['school.logo'] = $logo;   // Null goes back to the file's logo
        }

        // A rule that matches this year's gets no row of its own, so this year's value carries on
        $ruleValues = [];

        foreach (array_keys($rules) as $key)
        {
            $ruleValues[$key] = $ruleValue($key) === rule($key) ? null : $ruleValue($key);
        }

        $movedRules = array_filter(array_keys($rules), fn (string $key): bool => $ruleValue($key) !== rule($key, $next));
        $changed    = $this->changed($values) . ($movedRules === [] ? '' : "; from {$next}: " . implode(', ', $movedRules));

        $this->keepingUploads(fn () => (new SchoolSettings())->save($values, $user['id'], fn () => (new SchoolRules())->save($next, $ruleValues, $user['id'])),
            [$logo]);

        if (array_key_exists('school.logo', $values))
        {
            Upload::forget($oldLogo);   // Only deletes uploaded files, never the built-in logo
        }

        $this->log($user, 'SETTINGS_UPDATED', "Settings: {$changed}");
        $this->setFlash('notice', 'Settings saved.');
        $this->redirect($back);
    }

    // Lists what changed, for the Audit Log
    
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
