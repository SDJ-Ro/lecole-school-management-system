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
