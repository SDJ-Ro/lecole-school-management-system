<?php
// One student's marks panel on Term Marks. One hidden panel is drawn per student
// The script opens it and saves the marks in the background
// AB means the student was absent
$student = $marksStudent;
?>
<aside class="c-marks-panel c-marks-panel--<?= e($student['tone']) ?> j-marks-panel" id="<?= e($marksPanelId) ?>"
       aria-label="<?= e("{$student['name']}'s marks") ?>" hidden>
  <div class="c-marks-panel__top">
    <button type="button" class="c-btn c-btn--close j-marks-close" aria-label="Close marks panel"><?= icon('close', 16) ?></button>
  </div>

  <div class="c-marks-panel__student">
    <?php if ($student['photo'] !== ''): ?>
      <img class="c-avatar c-avatar--medium c-marks-panel__avatar" src="<?= e($student['photo']) ?>" alt="">
    <?php else: ?>
      <span class="c-avatar c-avatar--medium c-marks-panel__avatar" aria-hidden="true"><?= e(initials($student['name'])) ?></span>
    <?php endif; ?>
    <div class="c-marks-panel__who">
      <h2 class="c-marks-panel__name"><?= e($student['name']) ?></h2>
      <p class="c-marks-panel__sub">
        <span><?= e($student['code']) ?></span>
        <span class="c-marks-panel__dot" aria-hidden="true">•</span>
        <span><?= e(word('class') . " {$student['class']}") ?></span>
      </p>
    </div>
  </div>
