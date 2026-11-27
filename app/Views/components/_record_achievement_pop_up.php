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

    <label class="c-field">
      <span class="c-label c-field__label">Achievement Title <span class="c-field__required">*</span></span>
      <input class="c-field__input" type="text" name="title" maxlength="150" value="<?= e($rValues['title'] ?? '') ?>" placeholder="e.g. Debating Society – Senior Member" required>
    </label>

    <div class="c-field-pair">
      <div class="c-field">
        <span class="c-label c-field__label">Date It Occurred <span class="c-field__required">*</span></span>
        <?php
        $datepickerId  = "{$popId}-date";
        $name          = 'date';
        $selectedValue = ($rValues['date'] ?? '') === '' ? date('Y-m-d') : $rValues['date'];
        $placeholder   = 'Select date';
        $tone          = 'sand';
        $maxDate       = date('Y-m-d');
        require __DIR__ . '/_datepicker.php';
        ?>
      </div>
      <label class="c-field">
        <span class="c-label c-field__label">Result</span>
        <input class="c-field__input" type="text" name="result" maxlength="100" value="<?= e($rValues['result'] ?? '') ?>" placeholder="e.g. 1st Place, Runner-up">
      </label>
    </div>

    <label class="c-field">
      <span class="c-label c-field__label">Verified / Issued By</span>
      <input class="c-field__input" type="text" name="issuer" maxlength="150" value="<?= e($rValues['issuer'] ?? '') ?>" placeholder="e.g. Mr. Silva, Club Patron">
    </label>

    <label class="c-field">
      <span class="c-label c-field__label">Description <span class="c-field__required">*</span></span>
      <textarea class="c-field__input c-field__input--area" name="description" rows="3" maxlength="600" required
                placeholder="Explain the achievement details, accomplishments, or missing verification…"><?= e($rValues['description'] ?? '') ?></textarea>
    </label>

    <?php if ($isReview): ?>
      <div class="c-field">
        <span class="c-label c-field__label"><?= e(words("{Student}'s Submitted Evidence")) ?></span>
        <div class="c-record-form__evidence">
          <span class="c-record-form__file-icon"><?= icon('fileText', 20) ?></span>
          <div class="c-record-form__file">
            <p class="c-record-form__file-name"><?= e($rValues['file']) ?></p>
            <p class="c-record-form__file-meta"><?= e($rValues['file_meta']) ?></p>
          </div>
          <button type="button" class="c-btn c-btn--solid c-btn--pill c-record-form__view-file" data-pop-up-open="<?= e("{$popId}-file") ?>"><?= icon('eye', 14) ?><span>View File</span></button>
        </div>
      </div>
    <?php else: ?>
      <div class="c-field">
        <span class="c-label c-field__label">Supporting Proof</span>
        <?php
        $fileBoxName     = 'proof';
        $fileBoxRequired = false;
        $fileBoxTypes    = config('uploads.evidence.types');
        $fileBoxKb       = (int) config('uploads.evidence.kb');
        $fileBoxHint     = !$isEdit ? null : ($rValues['file'] === null ? 'No file attached — choose one to add it' : "Now: {$rValues['file']} — choose a file to replace it");
        require __DIR__ . '/_file_box.php';
        ?>
      </div>
    <?php endif; ?>
  </div>

  <footer class="c-pop-up__footer">
    <button type="button" class="c-btn c-btn--ghost j-pop-up-close">Cancel</button>
    <?php if ($isReview): ?>
      <button type="submit" class="c-btn c-btn--danger" form="<?= e("{$popId}-reject") ?>">Reject</button>
    <?php endif; ?>
    <button type="submit" class="c-btn c-btn--sunshine"><?= e(['record' => 'Record Achievement', 'edit' => 'Save Changes', 'review' => 'Approve & Record'][$recordVariant]) ?></button>
  </footer>
</form>

<?php if ($isReview): ?>
  <?php // The question pop-up asks for the reason, then sends this form ?>
  <form id="<?= e("{$popId}-reject") ?>" method="post" action="<?= e("{$rBase}/answer") ?>" data-question-title="Reject this request?"
        data-question-text="<?= e(words('The {student} sees your reason. Nothing is added to their record.')) ?>" data-question-button="Reject Request"
        data-question-extra="<?= e("{$popId}-reason") ?>">
    <?= $csrfField ?>
    <input type="hidden" name="request" value="<?= e($rValues['id']) ?>">
    <input type="hidden" name="answer" value="reject">
  </form>
  <?php
  $reasonBox = ['id' => "{$popId}-reason", 'label' => 'Reason', 'required' => true, 'placeholder' => "Why can't this be recorded?"];
  require __DIR__ . '/_reason_template.php';
  ?>
<?php endif; ?>
<?php
$popUpContent     = ob_get_clean();
$popUpId          = $popId;
$popUpIcon        = $isReview ? 'alertTriangle' : 'award';
$popUpEyebrow     = $isReview ? 'Issue Report' : 'Achievement Record';
$popUpTitle       = match ($recordVariant)
{
    'record' => 'Record Achievement',   // The script adds the student's name
    'edit'   => "Edit Achievement — {$rStudent['name']}",
    'review' => "Review Issue — {$rStudent['name']}",
};
$popUpDescription = words(['record' => 'Add a new verified {student} honour, award, or recognition.', 'edit' => 'Change this {student} honour, award, or recognition.',
                          'review' => "Review the {student}'s reported missing record and evidence."][$recordVariant]);
$popUpVariant     = $isReview ? 'review-issue' : 'record-achievement';
$popUpOpenOnLoad  = $isEdit;
require __DIR__ . '/_pop_up.php';
?>

<?php if ($isReview): ?>
  <?php
  // The student's evidence, opened from View File
  $evidenceId    = "{$popId}-file";
  $evidenceTitle = words('{Student} Evidence Preview');
  $evidenceFile  = $rValues['file'];
  $evidenceLine  = $rValues['file_meta'];
  $evidenceUrl   = $rValues['url'];
  $evidenceImage = $rValues['image'];
  require __DIR__ . '/_evidence_preview_pop_up.php';
  ?>
<?php endif; ?>
<?php unset($isReview, $isEdit, $popId, $rStudent, $rValues, $initials, $typeNames, $rBase, $recordVariant, $recordStudent, $recordValues, $recordRole); ?>