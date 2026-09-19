<?php
// The View All Years pop-up with the term dates of earlier years. Needs $schoolYear
// Years in a row with the same dates are shown together on one line
ob_start();
?>
<div class="c-pop-up__body">
  <?php foreach ($schoolYear['past'] as $group): ?>
    <section class="c-school-year c-school-year--past">
      <h3 class="c-panel__title"><?= e($group['years']) ?></h3>
      <?php foreach ($group['terms'] as $number => $dates): ?>
        <div class="c-school-year__term">
          <span class="c-label"><?= e(word('term') . " {$number}") ?></span>
          <span class="c-school-year__dates"><?= e($dates) ?></span>
        </div>
      <?php endforeach; ?>
    </section>
  <?php endforeach; ?>
</div>
<?php
$popUpContent     = ob_get_clean();
$popUpId          = 'j-past-years';
$popUpIcon        = 'calendar';
$popUpEyebrow     = 'Academic Year';
$popUpTitle       = 'All Years';
$popUpDescription = words('The {term} dates of the years before this one.');
require __DIR__ . '/_pop_up.php';
unset($group, $number, $dates);
