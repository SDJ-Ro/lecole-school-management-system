<?php
// The pop-up behind a staff card's Edit button. Each one saves one part of the programme
[$staffTitle, $staffText, $staffPart] = match ($staffPopUp)
{
    'tic'     => [words('Edit {Teacher} in Charge'), 'Assign or update the faculty coordinator for this programme.', 'teacher'],
    'coach'   => ['Edit Coach / Instructor', 'Update the coach details for this program.', 'coach'],
    'details' => ['Edit Session Details', 'Update the session schedule times and physical venue.', 'details'],
};
ob_start();
?>
<form class="c-pop-up__form" method="post" action="<?= e("/{$currentRole}/extracurricular/save") ?>" data-warn-unsaved>
  <?= $csrfField ?>
  <input type="hidden" name="id" value="<?= e($programme['id']) ?>">
  <input type="hidden" name="part" value="<?= e($staffPart) ?>">

  <div class="c-pop-up__body">
    <?php if ($staffPopUp === 'details'): ?>
      <label class="c-field">
        <span class="c-label c-field__label">Schedule / Session Times</span>
        <input type="text" class="c-field__input" name="schedule" value="<?= e($programme['schedule']) ?>" placeholder="e.g. Tuesdays & Thursdays, 3:30 – 5:30 PM" maxlength="150">
      </label>
      <label class="c-field">
        <span class="c-label c-field__label">Location / Venue</span>
        <input type="text" class="c-field__input" name="venue" value="<?= e($programme['location']) ?>" placeholder="e.g. Main Sports Complex" maxlength="150">
      </label>
    <?php else: ?>
      <?php
      $staffFields = ['who' => $staffPopUp, 'programme' => $programme, 'id' => 'j-staff'];
      require __DIR__ . '/_staff_fields.php';
      ?>
    <?php endif; ?>
  </div>

  <div class="c-pop-up__footer">
    <button type="button" class="c-btn c-btn--ghost j-pop-up-close">Cancel</button>
    <button type="submit" class="c-btn c-btn--solid">Save Changes</button>
  </div>
</form>
<?php
$popUpContent     = ob_get_clean();
$popUpId          = "j-staff-{$staffPopUp}";
$popUpIcon        = 'clock';
$popUpEyebrow     = 'Schedule & Venue';
$popUpTitle       = $staffTitle;
$popUpDescription = $staffText;
require __DIR__ . '/_pop_up.php';
unset($staffPopUp, $staffTitle, $staffText, $staffPart);
