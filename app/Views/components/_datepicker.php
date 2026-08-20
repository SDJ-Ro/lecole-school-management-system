<?php
// Date picker. Needs $datepickerId and $name, and sends the date as YYYY-MM-DD
// Optional $selectedValue, $placeholder, $tone, $minDate, $maxDate, and $minAge and $maxAge for a date of birth
// The calendar is a popover, so the browser keeps it above pop-ups and closes it on Esc or an outside click
// PHP draws it once, and datepicker.js fills in the month, the days and the limits
$dpValue       = $selectedValue ?? '';
$dpPlaceholder = $placeholder ?? 'Select date';
$dpCalendarId  = "{$datepickerId}-calendar";
?>
<div class="c-datepicker c-datepicker--<?= e($tone ?? 'sky') ?>" id="<?= e($datepickerId) ?>"
     data-min-date="<?= e($minDate ?? '') ?>" data-max-date="<?= e($maxDate ?? '') ?>"
     data-min-age="<?= e($minAge ?? '') ?>" data-max-age="<?= e($maxAge ?? '') ?>">
  <input type="hidden" class="j-datepicker-input" name="<?= e($name) ?>" value="<?= e($dpValue) ?>">

  <button type="button" class="c-datepicker__trigger" popovertarget="<?= e($dpCalendarId) ?>" data-placeholder="<?= e($dpPlaceholder) ?>">
    <span class="j-datepicker-label<?= $dpValue === '' ? ' c-datepicker__label--empty' : '' ?>">
      <?= e($dpValue === '' ? $dpPlaceholder : date(country('date_format'), strtotime($dpValue))) ?>
    </span>
    <?= icon('calendar', 16) ?>
  </button>
