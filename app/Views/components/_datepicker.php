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

  <div class="c-datepicker__calendar" id="<?= e($dpCalendarId) ?>" popover>
    <div class="c-datepicker__head">
      <button type="button" class="c-datepicker__nav j-datepicker-prev" aria-label="Previous month"><?= icon('chevronLeft') ?></button>

      <div class="c-datepicker__month-year">
        <div class="c-datepicker__pick">
          <button type="button" class="c-datepicker__pick-btn j-datepicker-month-btn">
            <span class="j-datepicker-month"></span><?= icon('chevronDown', 12) ?>
          </button>
          <div class="c-datepicker__menu j-datepicker-month-menu" hidden>
            <?php for ($month = 1; $month <= 12; $month++): ?>
              <button type="button" class="c-datepicker__menu-item" data-month="<?= $month - 1 ?>"><?= e(date('F', mktime(0, 0, 0, $month, 1))) ?></button>
            <?php endfor; ?>
          </div>
        </div>

        <div class="c-datepicker__pick">
          <button type="button" class="c-datepicker__pick-btn c-datepicker__pick-btn--year j-datepicker-year-btn">
            <span class="j-datepicker-year"></span><?= icon('chevronDown', 12) ?>
          </button>
          <div class="c-datepicker__menu c-datepicker__menu--years j-datepicker-year-menu" hidden></div><!-- Filled in by JS -->
        </div>
      </div>

      <button type="button" class="c-datepicker__nav c-datepicker__nav--next j-datepicker-next" aria-label="Next month"><?= icon('chevronRight') ?></button>
    </div>

    <div class="c-datepicker__weekdays">
      <?php // Weekday letters from 1-7 January 2024, which starts on a Monday ?>
      <?php for ($day = 1; $day <= 7; $day++): ?>
        <span class="c-label c-datepicker__weekday"><?= e(substr(date('D', mktime(0, 0, 0, 1, $day, 2024)), 0, 2)) ?></span>
      <?php endfor; ?>
    </div>

    <!-- Always 42 days, six weeks of seven, filled in by JS -->
    <div class="c-datepicker__days j-datepicker-days">
      <?php for ($day = 0; $day < 42; $day++): ?>
        <button type="button" class="c-datepicker__day"></button>
      <?php endfor; ?>
    </div>

    <div class="c-datepicker__foot">
      <span class="c-datepicker__hint j-datepicker-hint">Select a date</span>
      <button type="button" class="c-datepicker__today j-datepicker-today">Today</button>
    </div>
  </div>
</div>
<?php unset($datepickerId, $name, $selectedValue, $placeholder, $tone, $minDate, $maxDate, $minAge, $maxAge, $dpValue, $dpPlaceholder, $dpCalendarId, $month, $day); ?>

