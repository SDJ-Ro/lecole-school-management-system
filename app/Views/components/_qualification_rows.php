<?php
// A teacher's qualifications, one row of three boxes each
// The server drops empty rows. With no qualifications yet, one empty row is shown
$qrRows  = $qualificationRows !== [] ? $qualificationRows : [['degree' => '', 'institution' => '', 'year_obtained' => '']];
$qrClass = 'c-field__input' . ($qualificationSmall ? ' c-field__input--small c-info-card__input' : '');
?>
<div class="c-qualifications j-qualifications">
  <?php // Tells the server the list was sent, so a form with no rows means all were removed ?>
  <input type="hidden" name="qualifications_sent" value="1">
  <div class="c-qualifications__rows j-qualification-list">
    <?php foreach ($qrRows as $qrRow): ?>
      <div class="c-qualifications__row j-qualification-row">
        <input class="<?= e($qrClass) ?>" type="text" name="qualification_degree[]" value="<?= e($qrRow['degree']) ?>" placeholder="e.g. B.Sc. in Physics" aria-label="Qualification">
        <input class="<?= e($qrClass) ?>" type="text" name="qualification_institution[]" value="<?= e($qrRow['institution'] ?? '') ?>" placeholder="Institution" aria-label="Institution">
        <input class="<?= e($qrClass) ?>" type="text" name="qualification_year[]" value="<?= e($qrRow['year_obtained'] ?? '') ?>" placeholder="Year" inputmode="numeric" maxlength="4" aria-label="Year">
        <button type="button" class="c-btn c-btn--maroon c-btn--small j-qualification-remove">Remove</button>
      </div>
    <?php endforeach; ?>
  </div>
  <button type="button" class="c-btn c-btn--sunshine c-btn--small j-qualification-add"><?= icon('plus', 14) ?>Add Qualification</button>
</div>
<?php unset($qualificationRows, $qualificationSmall, $qrRows, $qrClass, $qrRow); ?>
