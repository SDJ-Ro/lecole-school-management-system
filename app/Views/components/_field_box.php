<?php
// One input box, picked by the field's kind. Needs $fieldBox, $fieldBoxVariant, $fieldBoxTone and $fieldBoxForm
// The caller draws the label, and every setting is cleared at the end
// $fieldBoxForm is only set when the box sits outside its form
$fbName  = $fieldBox['name'];
$fbBox   = $fieldBox['box'];
$fbCard  = $fieldBoxVariant === 'card';
$fbId    = "j-{$fieldBoxVariant}-" . str_replace('_', '-', $fbName);
$fbClass = 'c-field__input' . ($fbCard ? ' c-field__input--small c-info-card__input' : '');
$fbType  = str_contains($fbName, 'phone') ? 'tel' : (str_contains($fbName, 'email') ? 'email' : 'text');
?>
<?php if ($fbBox === 'date'): ?>
  <?php
  $datepickerId  = $fbId;
  $name          = $fbName;
  $selectedValue = $fieldBox['value'];
  $tone          = $fbCard ? 'sky' : $fieldBoxTone;
  $minAge        = $fieldBox['minAge'] ?? '';
  $maxAge        = $fieldBox['maxAge'] ?? '';
  require __DIR__ . '/_datepicker.php';
  ?>
    <?php if (($fieldBox['minAge'] ?? '') !== ''): ?>
    <?php // For an unusual age, this lifts the picker's limits and the save allows it ?>
    <label class="c-field__choice c-field__unlock">
      <input type="checkbox" class="c-field__checkbox" name="<?= e(str_replace('date_of_birth', 'age_unlocked', $fbName)) ?>" value="1"
             data-unlock-ages="<?= e($fbId) ?>"<?php if ($fieldBoxForm !== ''): ?> form="<?= e($fieldBoxForm) ?>"<?php endif; ?>>
      Unlock age range
    </label>
  <?php endif; ?>
<?php elseif ($fbBox === 'choice' || $fbBox === 'class'): ?>
  <?php
  $dropdownId    = $fbId;
  $dropdownLabel = $fieldBox['label'];
  $options       = $fieldBox['options'];
  $selectedValue = $fieldBox['value'];
  $placeholder   = 'Select';
  $name          = $fbName;
  $variant       = $fbCard ? 'small' : 'tinted';
  $tone          = $fbCard ? '' : $fieldBoxTone;
  require __DIR__ . '/_dropdown.php';
  ?>
<?php elseif ($fbBox === 'parent'): ?>
  <?php
  $parentPicker = ['name' => $fbName] + $fieldBox['value'];
  require __DIR__ . '/_parent_picker.php';
  ?>
<?php elseif ($fbBox === 'qualifications'): ?>
  <?php
  $qualificationRows  = $fieldBox['value'];
  $qualificationSmall = $fbCard;
  require __DIR__ . '/_qualification_rows.php';
  ?>
<?php elseif ($fbBox === 'photo'): ?>
  <label class="c-field__photo">
    <input class="c-field__hidden-input j-photo-input" type="file" name="<?= e($fbName) ?>" accept="<?= e(accept_types('photo')) ?>">
    <span class="c-field__photo-button"><?= icon('upload', 14) ?>Choose File</span>
    <span class="c-field__photo-name j-photo-name">No file chosen</span>
  </label>
<?php elseif ($fbBox === 'lines' || ($fbBox === 'area' && !$fbCard)): ?>
  <textarea class="<?= e("{$fbClass} c-field__input--area") ?>" id="<?= e($fbId) ?>" name="<?= e($fbName) ?>" rows="3"
            placeholder="<?= e($fieldBox['placeholder'] ?? '') ?>" aria-label="<?= e($fieldBox['label']) ?>"<?php if ($fieldBoxForm !== ''): ?> form="<?= e($fieldBoxForm) ?>"<?php endif; ?>><?= e($fieldBox['value']) ?></textarea>
<?php elseif ($fbBox === 'phone' && !$fbCard): ?>
  <span class="c-field__prefixed">
    <span class="c-field__prefix"><?= e(country('phone.code')) ?></span>
    <input class="<?= e($fbClass) ?>" type="tel" id="<?= e($fbId) ?>" name="<?= e($fbName) ?>" value="<?= e($fieldBox['value']) ?>" aria-label="<?= e($fieldBox['label']) ?>">
  </span>
<?php else: ?>
  <input class="<?= e($fbClass) ?>" type="<?= e($fbType) ?>" id="<?= e($fbId) ?>" name="<?= e($fbName) ?>" value="<?= e($fieldBox['value']) ?>"
         placeholder="<?= e($fieldBox['placeholder'] ?? '') ?>" aria-label="<?= e($fieldBox['label']) ?>"<?php if ($fieldBoxForm !== ''): ?> form="<?= e($fieldBoxForm) ?>"<?php endif; ?>>
<?php endif; ?>
<?php unset($fieldBox, $fbName, $fbBox, $fbCard, $fbId, $fbClass, $fbType); ?>
