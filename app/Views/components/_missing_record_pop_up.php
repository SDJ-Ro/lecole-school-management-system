<?php
// Pop-up to report a missing record. Needs $classTeacher and $programmes
// A request about a sport or club goes to its teacher in charge, any other goes to the class teacher
$types         = config('achievements.request_types');
$programmeType = array_keys(array_filter($types, fn (array $type): bool => $type['programme']));
ob_start();
?>
<form class="c-pop-up__form" method="post" action="/student/achievements/missing-record" enctype="multipart/form-data">
  <?= $csrfField ?>
  <div class="c-pop-up__body">
    <div class="c-field">
      <span class="c-label c-field__label">Record Type <span class="c-field__required c-field__required--terracotta">*</span></span>
      <?php
      $dropdownId    = 'j-missing-record-type';
      $dropdownLabel = 'Record type';
      $name          = 'type';
      $options       = array_keys($types);
      $placeholder   = 'Select a record type…';
      $required      = 'Please select a record type.';
      require __DIR__ . '/_dropdown.php';
      ?>
    </div>

    <div class="c-field" id="j-missing-record-programme" data-types="<?= e(json_encode($programmeType)) ?>" hidden>
      <span class="c-label c-field__label">Sport / Club <span class="c-field__required c-field__required--terracotta">*</span></span>
      <?php
      $dropdownId    = 'j-missing-record-programme-choice';
      $dropdownLabel = 'Sport or club';
      $name          = 'programme';
      $options       = array_map(fn (int $id, string $label): array => ['value' => (string) $id, 'label' => $label], array_keys($programmes), $programmes);
      $placeholder   = $programmes === [] ? 'You are not a member of any yet' : 'Select a sport or club…';
      require __DIR__ . '/_dropdown.php';
      ?>
      </div>

    <div class="c-field-pair">
      <label class="c-field">
        <span class="c-label c-field__label"><?= e(words('Academic Year / {Grade}')) ?> <span class="c-field__required c-field__required--terracotta">*</span></span>
        <input type="text" class="c-field__input" name="year" maxlength="40" required placeholder="<?= e(words('e.g. 2025 or {Grade} 12')) ?>">
      </label>

      <label class="c-field">
        <span class="c-label c-field__label">Title / Role <span class="c-field__required c-field__required--terracotta">*</span></span>
        <input type="text" class="c-field__input" name="title" maxlength="150" required placeholder="e.g. Under-17 Captain">
      </label>
    </div>

    <label class="c-field">
      <span class="c-label c-field__label">Details &amp; Reason <span class="c-field__required c-field__required--terracotta">*</span></span>
      <textarea class="c-field__input c-field__input--area" name="details" rows="3" maxlength="1000" required
                placeholder="Explain what is missing and why it should appear on your character certificate…"></textarea>
    </label>

    <div class="c-field c-fields--sand">
      <span class="c-label c-field__label">Evidence <span class="c-field__required c-field__required--terracotta">*</span></span>
      <?php
      $fileBoxName     = 'evidence';
      $fileBoxRequired = true;
      $fileBoxTypes    = config('uploads.evidence.types');
      $fileBoxKb       = (int) config('uploads.evidence.kb');
      require __DIR__ . '/_file_box.php';
      ?>
    </div>

    <p class="c-banner c-banner--info"><?= icon('info', 16) ?>
      <span><?= e(words('This request will be routed to your {Class} {Teacher}') . ($classTeacher === null ? '' : " ({$classTeacher})")
                . words(' — or, for a sport or club, its {teacher} in charge — for review.')) ?></span>
    </p>
  </div>

  <div class="c-pop-up__footer">
    <button type="button" class="c-btn c-btn--outline j-pop-up-close">Cancel</button>
    <button type="submit" class="c-btn c-btn--maroon">Submit Request</button>
  </div>
</form>
<?php
$popUpContent     = ob_get_clean();
$popUpId          = 'j-missing-record';
$popUpSize        = 'wide';
$popUpIcon        = 'award';
$popUpEyebrow     = words('{Student} Portal · Record Correction');
$popUpTitle       = 'Submit Missing Record Request';
$popUpDescription = words("Tell us what's missing from your record. We'll automatically route it to the right {teacher}.");
require __DIR__ . '/_pop_up.php';
unset($classTeacher, $programmes, $types, $programmeType);
