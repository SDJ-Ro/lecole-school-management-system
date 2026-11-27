<?php
// The teacher's Achievements page. Shows the student cards, or one student's timeline
// The search and filter run in the browser
?>
<?php if ($student === null): ?>
  <form class="l-student-cards-bar" role="search" aria-label="Filter <?= e(strtolower(plural('student'))) ?>">
    <label class="c-search c-search--rounded">
      <?= icon('search', 16) ?>
      <input type="search" class="c-search__input" id="j-student-search" placeholder="Search <?= e(strtolower(word('student'))) ?> name…"
             autocomplete="off" aria-label="Search <?= e(strtolower(plural('student'))) ?>">
    </label>
    <?php
    $dropdownId    = 'j-student-from';
    $options       = [['value' => 'all', 'label' => 'All Categories'], word('class'), 'Extracurricular'];
    $selectedValue = 'all';
    $placeholder   = 'All Categories';
    $prefix        = 'Filter';
    $dropdownLabel = 'Filter achievements category';
    require __DIR__ . '/_dropdown.php';
    ?>
  </form>

  <div class="l-student-cards-grid" id="j-student-cards">
    <?php foreach ($students as $studentCard): ?>
      <?php
      $studentCardVariant = 'grid';
      $studentCardLink    = "/{$role}/achievements?student=";
      require __DIR__ . '/_student_card.php';
      ?>
    <?php endforeach; ?>
  </div>

  <div class="c-empty-box c-empty-box--titled" id="j-student-cards-empty"<?= $students === [] ? '' : ' hidden' ?>>
    <?= icon('search', 40) ?>
    <p class="c-empty-box__title">No <?= e(strtolower(plural('student'))) ?> found</p>
    <p class="c-empty-box__text"><?= e($students !== []
        ? 'Try adjusting your search query or selecting a different category filter.'
        : words('No {students} are in your {class} or the programmes you run yet.')) ?></p>
  </div>
<?php else: ?>
  <p class="l-student-cards-back">
    <a class="c-btn c-btn--link" href="<?= e("/{$role}/achievements") ?>"><?= icon('chevronLeft', 18) ?><span>Back</span></a>
  </p>

  <?php
  ob_start();
  $timelineVariant = 'plain';
  $timelineStaff   = ['role' => $role, 'code' => $student['code']];
  require __DIR__ . '/_achievements_timeline.php';
  $studentCardContent = ob_get_clean();
  $studentCard        = $student;
  $studentCardVariant = 'banner';
  $studentCardIssues  = array_column($issues, 'id');
  require __DIR__ . '/_student_card.php';

  foreach ($issues as $issue)
  {
      $recordVariant = 'review';
      $recordStudent = $student;
      $recordValues  = $issue;
      $recordRole    = $role;
      require __DIR__ . '/_record_achievement_pop_up.php';
  }

  if ($editing !== null)
  {
      $recordVariant = 'edit';
      $recordStudent = $student;
      $recordValues  = $editing;
      $recordRole    = $role;
      require __DIR__ . '/_record_achievement_pop_up.php';
  }
  ?>
<?php endif; ?>

<?php
$recordVariant = 'record';
$recordStudent = null;
$recordValues  = null;
$recordRole    = $role;
require __DIR__ . '/_record_achievement_pop_up.php';