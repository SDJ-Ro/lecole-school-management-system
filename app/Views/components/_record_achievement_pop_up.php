<?php
// The Record and Edit Achievement pop-up, or the review of a Missing Record Request
// $recordVariant picks which one. Review shows the student's evidence instead of the upload box
// When editing, a new proof file replaces the old one
$isReview  = $recordVariant === 'review';
$isEdit    = $recordVariant === 'edit';
$popId     = ['record' => 'j-record-achievement', 'edit' => 'j-edit-achievement', 'review' => 'j-review-issue-' . ($recordValues['id'] ?? '')][$recordVariant];
$rStudent   = $recordStudent;
$rValues    = $recordValues ?? [];
$initials  = $rStudent === null ? '' : initials($rStudent['name']);
$typeNames = array_map(fn (string $key, array $group): array => ['value' => $key, 'label' => $group['type']], array_keys(config('achievements.groups')), config('achievements.groups'));
$rBase      = "/{$recordRole}/achievements";

ob_start();
?>
<form class="c-pop-up__form c-record-form c-fields--sand j-record-form" method="post" action="<?= e($rBase . ($isReview ? '/answer' : '/save')) ?>" enctype="multipart/form-data">
  <?= $csrfField ?>
  <input type="hidden" name="student" class="j-record-student" value="<?= e($rStudent['code'] ?? '') ?>">
  <?php if ($isEdit): ?>
    <input type="hidden" name="id" value="<?= e($rValues['id']) ?>">
  <?php elseif ($isReview): ?>
    <input type="hidden" name="request" value="<?= e($rValues['id']) ?>">
    <input type="hidden" name="answer" value="approve">
  <?php endif; ?>

  <div class="c-pop-up__body">
    <?php if ($isReview): ?>
      <div class="c-banner c-banner--error c-record-form__issue" role="note">
        <?= icon('alertTriangle', 18) ?>
        <p><strong><?= e(words('Reported Issue from {Student}')) ?></strong><?= e($rValues['message']) ?></p>
      </div>
    <?php endif; ?>

    <?php // The script fills in the student for the Record pop-up ?>
    <div class="c-record-form__student">
      <span class="c-avatar j-record-initials"><?= e($initials) ?></span>
      <div class="c-record-form__who">
        <p class="c-record-form__name j-record-name"><?= e($rStudent['name'] ?? '') ?></p>
        <p class="c-record-form__code">Index: <span class="j-record-code"><?= e($rStudent['code'] ?? '') ?></span></p>
      </div>
      <span class="c-tag c-tag--oat j-record-from"><?= e($rStudent['from'] ?? '') ?></span>
    </div>

    <div class="c-field-pair">
      <div class="c-field">
        <span class="c-label c-field__label">Achievement Type <span class="c-field__required">*</span></span>
        <?php
        $dropdownId    = "{$popId}-type";
        $options       = $typeNames;
        $selectedValue = $rValues['group'] ?? null;
        $placeholder   = 'Select an achievement type';
        $prefix        = 'Type';
        $dropdownLabel = 'Achievement type';
        $name          = 'type';
        $required      = 'Please select an achievement type.';
        require __DIR__ . '/_dropdown.php';
        ?>
      </div>
      <div class="c-field">
        <span class="c-label c-field__label">Level <span class="c-field__required">*</span></span>
        <?php
        $dropdownId    = "{$popId}-level";
        $options       = country('achievement_levels');
        $selectedValue = ($rValues['level'] ?? '') === '' ? null : $rValues['level'];
        $placeholder   = 'Select a level';
        $prefix        = 'Level';
        $dropdownLabel = 'Achievement level';
        $name          = 'level';
        $required      = 'Please select a level.';
        require __DIR__ . '/_dropdown.php';
        ?>
      </div>
    </div>
