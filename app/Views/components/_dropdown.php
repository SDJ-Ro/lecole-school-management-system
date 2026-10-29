<?php
// A styled dropdown instead of a native select. Needs $dropdownId and $options
// Optional $selectedValue, $placeholder, $dropdownLabel, $name, $prefix, $variant, $tone, $isMultiSelect and $required
// Every setting is cleared at the end, so the next dropdown starts fresh
// An option may have a sub line, and a disabled option uses it to say why
// An empty selected value is a real choice when one option has an empty value
// A multi-select takes a list of values and a name ending in brackets
// $required is the error shown when the form is sent with nothing chosen
// dropdown.js sends a dropdown:change event when the choice changes
$dId      = $dropdownId;
$dLabel   = $dropdownLabel ?? 'Dropdown';
$dHolder  = $placeholder ?? 'Select option';
$dVal     = $selectedValue ?? null;
$dName    = $name ?? '';
$dPrefix  = $prefix ?? '';
$dVariant = $variant ?? 'default';
$dTone    = $tone ?? '';
$isMulti  = !empty($isMultiSelect);
$dMissing = $required ?? '';

// Give every option a value and a label, and keep each value once
$formattedOptions = [];
foreach ($options ?? [] as $opt)
{
    $val = (string) (is_array($opt) ? ($opt['value'] ?? $opt['label']) : $opt);
    $formattedOptions[$val] ??= [
        'value'    => $val,
        'label'    => is_array($opt) ? ($opt['label'] ?? $val) : (string) $opt,
        'sub'      => is_array($opt) ? ($opt['sub'] ?? '') : '',
        'disabled' => is_array($opt) && !empty($opt['disabled']),
    ];
}
$formattedOptions = array_values($formattedOptions);
$labels           = array_column($formattedOptions, 'label', 'value');

$selectedValues = $isMulti ? array_map('strval', (array) ($dVal ?? [])) : [];
$hasSelected    = !$isMulti && $dVal !== null && isset($labels[(string) $dVal]);
$displayLabel   = $hasSelected ? $labels[(string) $dVal] : $dHolder;

$dClasses = 'c-dropdown c-dropdown--' . $dVariant
          . ($dTone !== '' ? ' c-dropdown--' . $dTone : '')
          . ($isMulti ? ' c-dropdown--multi' : '');
?>

<div class="<?= e($dClasses) ?>"
     id="<?= e($dId) ?>"
     aria-label="<?= e($dLabel) ?>"
     data-placeholder="<?= e($dHolder) ?>"
     <?= $isMulti ? 'data-multi="true"' : '' ?>
     <?= $dMissing !== '' ? 'data-required' : '' ?>
     <?= $dName !== '' ? 'data-name="' . e($dName) . '"' : '' ?>>

  <?php if ($isMulti): ?>
    <div class="j-dropdown-hidden-inputs">
      <?php foreach ($selectedValues as $sv): ?>
        <input type="hidden" name="<?= e($dName) ?>" value="<?= e($sv) ?>" />
      <?php endforeach; ?>
    </div>

    <div role="button" tabindex="0" class="c-dropdown__trigger" aria-haspopup="listbox" aria-expanded="false">
      <div class="c-dropdown__chips j-dropdown-chips">
        <?php foreach ($selectedValues as $sv): ?>
          <span class="c-chip">
            <span><?= e($labels[$sv] ?? $sv) ?></span>
            <span role="button" tabindex="0" class="c-chip__remove j-chip-remove" data-val="<?= e($sv) ?>" aria-label="Remove <?= e($labels[$sv] ?? $sv) ?>">
              <?= icon('close', 10) ?>
            </span>
          </span>
        <?php endforeach; ?>
      </div>
      <span class="c-dropdown__placeholder j-dropdown-placeholder" <?= $selectedValues !== [] ? 'hidden' : '' ?>><?= e($dHolder) ?></span>
      <?= icon('chevronDown', 14, 'c-dropdown__chevron') ?>
    </div>
  <?php else: ?>
    <?php if ($dName !== ''): ?>
      <input type="hidden" name="<?= e($dName) ?>" value="<?= e($hasSelected ? $dVal : '') ?>" />
    <?php endif; ?>

    <button type="button" class="c-dropdown__trigger" aria-haspopup="listbox" aria-expanded="false">
      <span class="c-dropdown__text">
        <?php if ($dPrefix !== ''): ?>
          <span class="c-dropdown__prefix"><?= e($dPrefix) ?>:</span>
        <?php endif; ?>
        <span class="c-dropdown__value<?= $hasSelected ? '' : ' c-dropdown__placeholder' ?>"><?= e($displayLabel) ?></span>
      </span>
      <?= icon('chevronDown', 14, 'c-dropdown__chevron') ?>
    </button>
  <?php endif; ?>

  <div class="c-dropdown__menu" role="listbox" aria-label="<?= e($dLabel) ?>">
    <?php foreach ($formattedOptions as $opt): ?>
      <?php $isSelected = $isMulti ? in_array($opt['value'], $selectedValues, true) : ($hasSelected && $opt['value'] === (string) $dVal); ?>
      <button type="button" class="c-dropdown__option<?= $isSelected ? ' c-is-selected' : '' ?>" <?= $opt['disabled'] ? 'disabled' : '' ?>
              data-value="<?= e($opt['value']) ?>" data-label="<?= e($opt['label']) ?>" role="option" aria-selected="<?= $isSelected ? 'true' : 'false' ?>">
        <?php if ($dVariant === 'teacher'): ?>
          <span class="c-avatar" aria-hidden="true"><?= e($opt['value'] === '' ? '–' : initials($opt['label'])) ?></span>
        <?php endif; ?>
        <span class="c-dropdown__label">
          <span><?= e($opt['label']) ?></span>
          <?php if ($opt['sub'] !== ''): ?>
            <span class="c-dropdown__sub"><?= e($opt['sub']) ?></span>
          <?php endif; ?>
        </span>
        <?= icon('check', 14, 'c-dropdown__tick') ?>
      </button>
    <?php endforeach; ?>
  </div>

  <?php if ($dMissing !== ''): ?>
    <p class="c-field__error j-dropdown-error" hidden><?= e($dMissing) ?></p>
  <?php endif; ?>
</div>
<?php unset($dropdownId, $dropdownLabel, $placeholder, $options, $selectedValue, $name, $prefix, $variant, $tone, $isMultiSelect, $required); ?>
