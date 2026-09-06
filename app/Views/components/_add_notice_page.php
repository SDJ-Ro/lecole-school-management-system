<?php
// The form to post or edit a notice. Needs $noticeForm, $currentRole and $csrfField
// Only approved notices can be pinned, so the pin box is hidden while a notice waits for approval
$noticeIsNew   = $noticeForm['id'] === null;
$noticeValues  = $noticeForm['values'];
$noticeChoices = $noticeForm['choices'];
$noticeBoard   = "/{$currentRole}/notice";

$noticeTargets = $noticeChoices['schoolWide'] ? [['value' => 'all', 'label' => 'All ' . plural('grade') . ' (' . word('institution') . '-Wide)']] : [];
foreach ($noticeChoices['grades'] as $id => $gradeName)
{
    $noticeTargets[] = ['value' => "grade:{$id}", 'label' => "{$gradeName} (All Sections)"];
}
foreach ($noticeChoices['classes'] as $id => $className)
{
    $noticeTargets[] = ['value' => "class:{$id}", 'label' => word('class') . " {$className}"];
}

$noticeClubs = $noticeChoices['schoolWide'] ? [['value' => 'all', 'label' => 'All Extracurriculars (' . word('institution') . '-Wide)']] : [];
foreach ($noticeChoices['extracurriculars'] as $id => $clubName)
{
    $noticeClubs[] = ['value' => (string) $id, 'label' => $clubName];
}

ob_start();
?>
  <form class="c-fields--sky" id="j-add-notice" method="post" action="<?= e("{$noticeBoard}/save") ?>" novalidate data-warn-unsaved>
    <?= $csrfField ?>
    <?php if (!$noticeIsNew): ?>
      <input type="hidden" name="id" value="<?= e($noticeForm['id']) ?>">
    <?php endif; ?>

    <div class="c-add-notice__body">
      <div class="c-banner c-banner--info">
        <?= icon('info', 20) ?>
        <span><?= e($noticeForm['banner']) ?></span>
      </div>

      <?php if ($noticeForm['error'] !== null): ?>
        <p class="c-banner c-banner--error" role="alert"><?= e($noticeForm['error']) ?></p>
      <?php endif; ?>

      <div class="c-add-notice__grid">
        <div class="c-field c-add-notice__wide">
          <label class="c-label c-field__label" for="j-add-notice-title">Notice Title <span class="c-field__required">*</span></label>
          <input type="text" class="c-field__input" id="j-add-notice-title" name="title" value="<?= e($noticeValues['title']) ?>"
                 placeholder="<?= e(words('e.g. End of {Term} Examinations Schedule')) ?>" required minlength="3" maxlength="200">
        </div>

        <div class="c-field">
          <span class="c-label c-field__label">Category <span class="c-field__required">*</span></span>
          <?php
          $dropdownId    = 'j-add-notice-category';
          $dropdownLabel = 'Category';
          $options       = $noticeChoices['categories'];
          $selectedValue = $noticeValues['category'];
          $name          = 'category';
          require __DIR__ . '/_dropdown.php';
          ?>
        </div>

        <div class="c-field">
          <span class="c-label c-field__label">Target Audience <span class="c-field__required">*</span></span>
          <?php
          $dropdownId    = 'j-add-notice-audience';
          $dropdownLabel = 'Target Audience';
          $placeholder   = 'Select audience…';
          $options       = array_map(fn (string $who): array => ['value' => $who, 'label' => $who === 'all' ? 'All' : plural($who)], $noticeChoices['audience']);
          $selectedValue = $noticeValues['audience'];
          $name          = 'audience[]';
          $isMultiSelect = true;
          require __DIR__ . '/_dropdown.php';
          ?>
        </div>

        <?php // add-notice.js shows one of these two, based on the category ?>
        <div class="c-field c-add-notice__wide" id="j-add-notice-academic" <?= $noticeValues['category'] === 'Academic' ? '' : 'hidden' ?>>
          <span class="c-label c-field__label">Target <?= e(word('grade')) ?> / <?= e(word('class')) ?> Section</span>
          <?php
          $dropdownId    = 'j-add-notice-target';
          $dropdownLabel = 'Target ' . word('grade') . ' / ' . word('class');
          $placeholder   = 'Select a ' . strtolower(word('grade')) . ' or ' . strtolower(word('class'));
          $options       = $noticeTargets;
          $selectedValue = $noticeValues['target'];
          $name          = 'target';
          require __DIR__ . '/_dropdown.php';
          ?>
        </div>

        <div class="c-field c-add-notice__wide" id="j-add-notice-club" <?= $noticeValues['category'] === 'Extracurricular' ? '' : 'hidden' ?>>
          <span class="c-label c-field__label">Target Club / Sport Programme</span>
          <?php
          $dropdownId    = 'j-add-notice-extracurricular';
          $dropdownLabel = 'Target club or sport';
          $placeholder   = 'Select a club or sport';
          $options       = $noticeClubs;
          $selectedValue = $noticeValues['extracurricular'];
          $name          = 'extracurricular';
          require __DIR__ . '/_dropdown.php';
          ?>
        </div>

        <div class="c-field">
          <span class="c-label c-field__label">Publish Date (Optional)</span>
          <?php
          $datepickerId  = 'j-add-notice-publish';
          $name          = 'publish_at';
          $selectedValue = $noticeValues['publish_at'];
          $placeholder   = 'Publish immediately (or select date)';
          $minDate       = date('Y-m-d');
          require __DIR__ . '/_datepicker.php';
          ?>
        </div>

        <div class="c-field">
          <span class="c-label c-field__label">Expiration Date (Optional)</span>
          <?php
          $datepickerId  = 'j-add-notice-expires';
          $name          = 'expires_at';
          $selectedValue = $noticeValues['expires_at'];
          $placeholder   = 'Never expires (or select date)';
          $minDate       = date('Y-m-d');
          require __DIR__ . '/_datepicker.php';
          ?>
        </div>

        <div class="c-field c-add-notice__wide">
          <label class="c-label c-field__label" for="j-add-notice-body">Message Body <span class="c-field__required">*</span></label>
          <textarea class="c-field__input c-field__input--area" id="j-add-notice-body" name="body" rows="6"
                    placeholder="Write the notice here (minimum 10 characters)…" required minlength="10" maxlength="5000"><?= e($noticeValues['body']) ?></textarea>
        </div>

        <?php // For a trip, the trip boxes show while this is ticked ?>
        <div class="c-field c-add-notice__wide c-add-notice__permission">
          <label class="c-field__choice">
            <input type="checkbox" class="c-field__checkbox" name="permission" value="1" <?= $noticeValues['permission'] ? 'checked' : '' ?>>
            <?= e(words('Ask {Parents} for Permission (a trip or outing)')) ?>
          </label>
          <span class="c-field__hint"><?= e(words('Sent to the {students} of the group chosen above and their {parents}, who approve or decline on Approvals. No answer by the reply-by date counts as No.')) ?></span>

          <div class="c-add-notice__trip">
            <div class="c-field">
              <span class="c-label c-field__label">Trip Date <span class="c-field__required">*</span></span>
              <?php
              $datepickerId  = 'j-add-notice-trip';
              $name          = 'trip_on';
              $selectedValue = $noticeValues['trip_on'];
              $minDate       = date('Y-m-d', strtotime('+1 day'));
              require __DIR__ . '/_datepicker.php';
              ?>
            </div>
            <div class="c-field">
              <span class="c-label c-field__label">Reply By <span class="c-field__required">*</span></span>
              <?php
              $datepickerId  = 'j-add-notice-reply';
              $name          = 'reply_by';
              $selectedValue = $noticeValues['reply_by'];
              $minDate       = date('Y-m-d');
              require __DIR__ . '/_datepicker.php';
              ?>
            </div>
            <div class="c-field">
              <label class="c-label c-field__label" for="j-add-notice-place">Place <span class="c-field__required">*</span></label>
              <input type="text" class="c-field__input" id="j-add-notice-place" name="place" value="<?= e($noticeValues['place']) ?>" maxlength="150"
                     placeholder="e.g. the National Museum">
            </div>
            <div class="c-field">
              <label class="c-label c-field__label" for="j-add-notice-cost">Cost (Optional)</label>
              <input type="text" class="c-field__input" id="j-add-notice-cost" name="cost" value="<?= e($noticeValues['cost']) ?>" maxlength="50"
                     placeholder="Shown only: payments are not kept here">
            </div>
          </div>
        </div>

        <div class="c-add-notice__footer">
          <?php if ($noticeForm['canPin']): ?>
            <label class="c-field__choice">
              <input type="checkbox" class="c-field__checkbox" name="pinned" value="1" <?= $noticeValues['pinned'] ? 'checked' : '' ?>>
              Pin the notice
            </label>
          <?php endif; ?>

          <button type="submit" class="c-btn c-btn--solid c-btn--pill c-btn--large">
            <?= icon('send', 16) ?><span><?= $noticeIsNew ? 'Publish Notice' : 'Save Changes' ?></span>
          </button>
        </div>
      </div>
    </div>
  </form>
<?php
$formCardContent  = ob_get_clean();
$formCardBack     = $noticeBoard;
$formCardTone     = 'sky';
$formCardTitle    = $noticeIsNew ? 'Post New Notice' : 'Edit Notice';
$formCardSubtitle = $noticeIsNew
    ? 'Write a notice and publish it to the Notice Board.'
    : 'Change the notice or who it is for.';
require __DIR__ . '/_form_card.php';

unset($noticeForm, $noticeIsNew, $noticeValues, $noticeChoices, $noticeBoard, $noticeTargets, $noticeClubs, $id, $gradeName, $className, $clubName);
?>
