<?php
// The parent's New Inquiry or Complaint pop-up. Needs $children, $chosenChild, $categories and $csrfField
// The child being viewed is picked to start with
ob_start();
?>
<form class="c-pop-up__form" method="post" action="/parent/complaints/send">
  <?= $csrfField ?>
  <div class="c-pop-up__body">
    <label class="c-field">
      <span class="c-label c-field__label">Subject</span>
      <input type="text" class="c-field__input" name="subject" maxlength="<?= e(config('complaints.limits.subject')) ?>" required placeholder="e.g. Clarification on Chemistry Revision Syllabus">
    </label>

    <div class="c-field-pair">
      <div class="c-field">
        <span class="c-label c-field__label">Category</span>
        <?php
        $dropdownId    = 'j-new-inquiry-category';
        $dropdownLabel = 'Category';
        $name          = 'category';
        $options       = array_keys($categories);
        $selectedValue = array_key_first($categories);
        require __DIR__ . '/_dropdown.php';
        ?>
      </div>

      <div class="c-field">
        <span class="c-label c-field__label"><?= e(words('Associated {Student}')) ?></span>
        <?php
        $dropdownId    = 'j-new-inquiry-student';
        $dropdownLabel = words('Associated {student}');
        $name          = 'students[]';
        $isMultiSelect = true;
        $required      = words('Please choose at least one {student}.');
        $options       = array_map(fn (int $id, string $childName): array => ['value' => (string) $id, 'label' => $childName], array_keys($children), $children);
        $selectedValue = $chosenChild === null ? [] : [(string) $chosenChild];
        require __DIR__ . '/_dropdown.php';
        ?>
      </div>
    </div>
