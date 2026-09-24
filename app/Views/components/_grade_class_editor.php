<?php
// The hidden class editor. Needs $classTeacherOptions, $classForm, $pageUrl and $csrfField
// academic.js moves it to the pressed class and fills it in
// Teachers who already have a class are greyed out, but academic.js lets a class keep its own
// $classForm holds a refused save so the editor can reopen with it
$classSize = config('white_label.academic.class_size');
?>
<form class="c-class-editor" id="j-class-editor" method="post" action="<?= e("{$pageUrl}/classes/save") ?>" hidden data-warn-unsaved
      <?php if ($classForm !== null): ?>data-reopen="<?= e(json_encode($classForm)) ?>"<?php endif; ?>>
  <?= $csrfField ?>
  <input type="hidden" name="id" value="">
  <input type="hidden" name="grade_id" value="">

  <label class="c-class-editor__field">
    <span class="c-label">Section</span>
    <span class="c-class-editor__section">
      <span class="c-class-editor__prefix j-class-editor-prefix"></span>
      <input class="c-field__input c-field__input--small" name="section" placeholder="e.g. C" maxlength="10" required autocomplete="off">
    </span>
  </label>

  <label class="c-class-editor__field">
    <span class="c-label">Places</span>
    <input class="c-field__input c-field__input--small" name="capacity" type="number" required
           min="<?= e($classSize['min']) ?>" max="<?= e($classSize['max']) ?>" placeholder="e.g. <?= e($classSize['max']) ?>">
  </label>

  <div class="c-class-editor__field">
    <span class="c-class-editor__head">
      <span class="c-label"><?= e(words('{Class} {Teacher}')) ?></span>
      <span class="c-class-editor__hint">Hover a <?= e(strtolower(word('teacher'))) ?> to preview workload</span>
    </span>
    <?php
    $dropdownId    = 'j-class-editor-teacher';
    $dropdownLabel = words('{Class} {teacher}');
    $options       = $classTeacherOptions;
    $selectedValue = '';
    $name          = 'class_teacher_id';
    $variant       = 'teacher';
    require __DIR__ . '/_dropdown.php';
    ?>
  </div>

  <div class="c-class-editor__actions">
    <button type="submit" class="c-btn c-btn--solid c-btn--small"><?= icon('check', 14) ?>Save</button>
    <button type="button" class="c-btn c-btn--outline c-btn--small j-class-editor-cancel"><?= icon('close', 14) ?>Cancel</button>
  </div>
</form>
<?php unset($classSize); ?>
