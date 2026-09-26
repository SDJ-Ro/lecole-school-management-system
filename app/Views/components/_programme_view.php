<?php
// One programme as staff see it, or one of its achievements when $award is set
?>
<div class="l-programme">
  <?php if ($award !== null): ?>
    <?php require __DIR__ . '/_award_page.php'; ?>
  <?php else: ?>
    <?php
    $heroBack = $listUrl;   // No Back link when the teacher runs only one programme
    require __DIR__ . '/_extracurricular_hero.php';
    ?>
    <?php if ($programme['archived']): ?>
      <div class="c-banner c-banner--info">
        <?= icon('info', 20) ?>
        <span>This programme is archived: read only. The admin can restore it from the Archived tab.</span>
      </div>
    <?php endif; ?>
    <?php
    if ($programme['awards'] !== null)
    {
        require __DIR__ . '/_extracurricular_awards_panel.php';   // The awards are empty when achievements are switched off
    }
    if ($can['edit'])
    {
        require __DIR__ . '/_enrolment_panel.php';   // Management and admin see it too, since a programme may have no teacher yet
    }
    $scheduleSidebar = true;
    require __DIR__ . '/_extracurricular_schedule_panel.php';
    if ($programme['noticeCards'] !== null)
    {
        require __DIR__ . '/_club_notice_board.php';
    }
    require __DIR__ . '/_teams_panel.php';
    if ($can['archive'] && !$programme['archived'])
    {
        $dangerZone = ['text' => 'Archive this programme: it is hidden from ' . strtolower(plural('student')) . ' and from joining, its members\' '
                           . 'memberships end today, and its history (members, teams, achievements) is kept. The admin can restore it.',
                       'button' => 'Archive Programme', 'question' => "Archive \"{$programme['name']}\"?",
                       'action' => "/{$currentRole}/extracurricular/archive", 'hidden' => ['id' => $programme['id']]];
        require __DIR__ . '/_danger_zone.php';
    }
    ?>
  <?php endif; ?>
</div>
