<?php
// The New Extracurricular and Edit pop-ups. $programmePopUp picks which one
// A new programme from management needs admin approval
// The teacher in charge may only change the description and cover photo
$isEdit     = $programmePopUp === 'edit';
$editAll    = !$isEdit || $can['editAll'];
$settings   = $isEdit ? $programme['settings'] : [];
$popUpTypes = array_map(fn (string $key, array $type): array => ['value' => $key, 'label' => $type['name']],
    array_keys(config('extracurricular.types')), config('extracurricular.types'));
ob_start();
?>
<form class="c-pop-up__form" method="post" action="<?= e("/{$currentRole}/extracurricular/save") ?>" enctype="multipart/form-data" data-warn-unsaved>
  <?= $csrfField ?>
  <?php if ($isEdit): ?>
    <input type="hidden" name="id" value="<?= e($programme['id']) ?>">
    <input type="hidden" name="part" value="programme">
  <?php endif; ?>

  <div class="c-pop-up__body">
    <?php if ($editAll): ?>
      <label class="c-field">
        <span class="c-label c-field__label">Programme Name<?php if ($isEdit): ?> <span class="c-field__required c-field__required--terracotta">*</span><?php endif; ?></span>
        <input type="text" class="c-field__input" name="name" value="<?= e($isEdit ? $programme['name'] : '') ?>" placeholder="e.g. Chess Club" maxlength="100" required>
      </label>

      <div class="c-field-pair">
        <div class="c-field">
          <span class="c-label c-field__label"><?= $isEdit ? 'Programme Type' : 'Type' ?></span>
          <?php
          $dropdownId    = "j-programme-{$programmePopUp}-type";
          $dropdownLabel = 'Type';
          $name          = 'type';
          $options       = $popUpTypes;
          $selectedValue = $isEdit ? $programme['type'] : null;
          $placeholder   = 'Select type';
          $required      = 'Please select a type.';
          require __DIR__ . '/_dropdown.php';
          ?>
        </div>
        <?php if ($isEdit): ?>
          <div class="c-field">
            <span class="c-label c-field__label">Category</span>
            <?php
            $dropdownId    = 'j-programme-edit-category';
            $dropdownLabel = 'Category';
            $name          = 'category';
            $options       = config('extracurricular.categories');
            $selectedValue = $programme['category'];
            require __DIR__ . '/_dropdown.php';
            ?>
          </div>
        <?php else: ?>
          <div class="c-field">
            <span class="c-label c-field__label"><?= e(words('{Teacher} in Charge (TIC)')) ?></span>
            <?php
            $dropdownId    = 'j-programme-create-tic';
            $dropdownLabel = words('{Teacher} in charge');
            $name          = 'teacher';
            $options       = $teachers;
            $variant       = 'teacher';
            $selectedValue = '';
            $placeholder   = words('Assign {Teacher} in Charge');
            require __DIR__ . '/_dropdown.php';
            ?>
          </div>
        <?php endif; ?>
      </div>
    <?php endif; ?>

    