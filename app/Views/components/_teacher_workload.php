<?php
// One teacher's workload card, shown beside the teacher picker on hover. Needs $teacher and $workload
// One hidden card is drawn per teacher, so the script only has to show it
$workloadSubjects = $workload['subjects'] ?? [];
$workloadClubs    = $workload['extracurriculars'] ?? [];
?>
<div class="c-teacher-workload" id="j-workload-<?= e($teacher['id']) ?>" role="tooltip" hidden>
  <div class="c-teacher-workload__head">
    <span class="c-avatar" aria-hidden="true"><?= e(initials($teacher['name'])) ?></span>
    <div class="c-teacher-workload__who">
      <p class="c-teacher-workload__name"><?= e($teacher['name']) ?></p>
      <p class="c-teacher-workload__sub"><?= e($teacher['qualification'] ?: words('{Subjects} not added yet')) ?></p>
    </div>
  </div>

  <div class="c-teacher-workload__group">
    <p class="c-label"><?= icon('graduationCap', 12) ?> <?= e(words('{Class} {Teacher}')) ?></p>
    <?php if ($teacher['class_name'] !== null): ?>
      <span class="c-chip c-teacher-workload__chip--class"><?= e(word('class') . " {$teacher['class_name']}") ?></span>
    <?php else: ?>
      <span class="c-teacher-workload__empty">Not yet</span>
    <?php endif; ?>
  </div>

  <div class="c-teacher-workload__group">
    <p class="c-label"><?= icon('trophy', 12) ?> In Charge Of</p>
    <div class="c-teacher-workload__chips">
      <?php foreach ($workloadClubs as $club): ?>
        <span class="c-chip c-teacher-workload__chip--club"><?= e($club) ?></span>
      <?php endforeach; ?>
      <?php if ($workloadClubs === []): ?>
        <span class="c-teacher-workload__empty">None</span>
      <?php endif; ?>
    </div>
  </div>

  <div class="c-teacher-workload__group">
    <p class="c-label"><?= icon('bookOpen', 12) ?> <?= e(words('{Subjects} Taught')) ?></p>
    <?php foreach ($workloadSubjects as $subject => $classNames): ?>
      <div class="c-teacher-workload__subject">
        <span class="c-teacher-workload__subject-name"><?= e($subject) ?></span>
        <span class="c-teacher-workload__chips">
          <?php foreach ($classNames as $className): ?>
            <span class="c-chip c-teacher-workload__chip"><?= e($className) ?></span>
          <?php endforeach; ?>
        </span>
      </div>
    <?php endforeach; ?>
    <?php if ($workloadSubjects === []): ?>
      <span class="c-teacher-workload__empty"><?= e(words('No {subjects} yet')) ?></span>
    <?php endif; ?>
  </div>
</div>
<?php unset($workloadSubjects, $workloadClubs, $club, $subject, $classNames, $className); ?>
