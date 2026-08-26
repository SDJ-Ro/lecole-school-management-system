<?php
// The month calendar on every dashboard. Needs $calendarConfig
// The script draws the month from the events given here
$canAdd    = $calendarConfig['canAdd'];
$firstYear = $calendarConfig['firstYear'];
$lastYear  = $calendarConfig['lastYear'];

$monthOptions = [];
for ($month = 1; $month <= 12; $month++)
{
    $monthOptions[] = ['value' => (string) ($month - 1), 'label' => date('F', mktime(0, 0, 0, $month, 1))];   // JavaScript counts months from 0
}
?>

<section class="c-calendar" id="j-calendar" aria-label="<?= e(word('institution')) ?> calendar"
         data-can-add="<?= $canAdd ? 'true' : 'false' ?>"
         data-first-year="<?= e($firstYear) ?>"
         data-last-year="<?= e($lastYear) ?>"
         data-only="<?= e($calendarConfig['only'] ?? '') ?>"
         data-events="<?= e(json_encode($calendarConfig['events'])) ?>">

  <header class="c-calendar__header">
    <div class="c-calendar__header-row">
      <div class="c-calendar__nav">
        <button type="button" class="c-calendar__nav-btn" id="j-calendar-prev" aria-label="Previous month">
          <?= icon('chevronLeft', 14) ?>
        </button>
        <button type="button" class="c-calendar__nav-btn" id="j-calendar-next" aria-label="Next month">
          <?= icon('chevronRight', 14) ?>
        </button>
      </div>

      <div class="c-calendar__month-year">
        <?php
        $dropdownId    = 'j-select-month';
        $variant       = 'calendar';
        $options       = $monthOptions;
        $selectedValue = (string) (date('n') - 1);
        $dropdownLabel = 'Choose calendar month';
        require dirname(__DIR__) . '/_dropdown.php';

        $dropdownId    = 'j-select-year';
        $variant       = 'calendar';
        $options       = array_map('strval', range($firstYear, $lastYear));
        $selectedValue = date('Y');
        $dropdownLabel = 'Choose calendar year';
        require dirname(__DIR__) . '/_dropdown.php';
        ?>
      </div>
    </div>
  </header>

  <div class="c-calendar__weekdays">
    <?php // The weekday names start from 1 January 2024, which was a Monday ?>
    <?php for ($day = 1; $day <= 7; $day++): ?>
      <span class="c-label c-label--light"><?= e(substr(date('D', mktime(0, 0, 0, 1, $day, 2024)), 0, 2)) ?></span>
    <?php endfor; ?>
  </div>

  <div class="c-calendar__days" id="j-calendar-days"></div>

  <div class="c-calendar__footer">
    <div class="c-calendar__footer-row">
      <p class="c-label c-label--light c-calendar__event-count" id="j-calendar-event-count" aria-live="polite">0 events scheduled</p>
      <div class="c-calendar__footer-actions">
        <button type="button" class="c-label c-calendar__view-all-btn" id="j-open-day-schedule" hidden>View All</button>
      </div>
    </div>
    <div class="c-calendar__day-detail" id="j-calendar-day-detail"></div>
  </div>
</section>

<?php require __DIR__ . '/_day_card_template.php'; ?>
<?php require __DIR__ . '/_day_card_popup_template.php'; ?>

<?php if ($canAdd): ?>
  <?php require __DIR__ . '/_event_editor.php'; ?>
<?php endif; ?>
