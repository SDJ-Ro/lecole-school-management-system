<?php
// One programme as a student or parent sees it, or one of its achievements when $award is set
?>
<div class="l-programme">
  <?php if ($award !== null): ?>
    <?php require __DIR__ . '/_award_page.php'; ?>
  <?php else: ?>
    <?php
    $heroBack = $listUrl;
    require __DIR__ . '/_extracurricular_hero.php';
    if ($programme['awards'] !== null)
    {
        require __DIR__ . '/_extracurricular_awards_panel.php';   // The awards are empty when achievements are switched off
    }
    ?>

    <section class="c-card c-programme-panel">
      <div class="l-pair-grid">
        <?php foreach (['tic', 'coach'] as $cardKey): ?>
          <?php
          $staffCard = $programme['cards'][$cardKey] + ['edit' => null];
          require __DIR__ . '/_staff_card.php';
          ?>
        <?php endforeach; ?>
      </div>
    </section>

    <div class="l-roster-calendar-grid">
      <?php
      require __DIR__ . '/_squad_roster.php';
      $scheduleSidebar = false;
      require __DIR__ . '/_extracurricular_schedule_panel.php';
      ?>
    </div>

    <?php if ($programme['noticeCards'] !== null): ?>
      <?php require __DIR__ . '/_club_notice_board.php'; ?>
    <?php endif; ?>

    <section class="c-card c-programme-panel">
      <div class="l-pair-grid">
        <?php foreach (['details', 'status'] as $cardKey): ?>
          <?php
          $staffCard = $programme['cards'][$cardKey] + ['edit' => null];
          require __DIR__ . '/_staff_card.php';
          ?>
        <?php endforeach; ?>
      </div>
    </section>
  <?php endif; ?>
</div>
<?php unset($cardKey); ?>
