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