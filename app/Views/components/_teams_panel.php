<?php
// A programme's Teams and Roster for staff
// Assign only offers teams in the member's age group
// Remove keeps the old membership in the history
$memberUrl = "/{$currentRole}/extracurricular/member?id={$programme['id']}&student=";
?>
<section class="c-card c-programme-panel">
  <header class="c-programme-panel__head">
    <h2 class="c-panel__title c-programme-panel__title"><span class="c-programme-panel__icon c-programme-panel__icon--boxed"><?= icon('users', 20) ?></span>Teams &amp; Roster</h2>
    <?php if ($can['edit']): ?>
      <button type="button" class="c-btn c-btn--sky c-btn--small" data-pop-up-open="j-team-new"><?= icon('plus', 14) ?>Add Team</button>
    <?php endif; ?>
  </header>

  <form class="c-teams__filter" method="get" action="<?= e($currentPath) ?>" data-submit-on-change>
    <input type="hidden" name="id" value="<?= e($programme['id']) ?>">
    <span class="c-teams__filter-title">Filter by Age Group</span>
    <div class="c-teams__filter-choice">
      <?php
      $dropdownId    = 'j-teams-age';
      $dropdownLabel = 'Filter by age group';
      $name          = 'age';
      $options       = [['value' => '', 'label' => 'All'], ...array_map(fn (string $group): array => ['value' => $group, 'label' => $group], $programme['filterGroups'])];
      $selectedValue = $programme['age'];
      require __DIR__ . '/_dropdown.php';
      ?>
    </div>
  </form>
