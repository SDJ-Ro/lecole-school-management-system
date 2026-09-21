<?php
// The People page for the office, or the teacher's Student Details when $directoryView is teacher
// Tabs, class chips and page links all keep the other filters
$directoryRole = $directoryView === 'office' ? $tab : 'student';
$directoryTone = config("people.tones.{$directoryRole}");
$directoryLink = fn (array $change): string => $pageUrl . '?' . http_build_query(array_filter($change + $query, fn (mixed $value): bool => $value !== null && $value !== ''));
$directoryWord = $directoryRole === 'management' ? ($total === 1 ? 'staff member' : 'staff members') : strtolower($total === 1 ? word($directoryRole) : plural($directoryRole));

// The account status tabs. On the students tab they sit in the second row
ob_start();
?>
<nav class="c-tabs c-tabs--grey" aria-label="Account access">
  <?php foreach (['' => 'All', 'on' => 'Active', 'off' => 'Deactivated'] as $statusValue => $statusLabel): ?>
    <a class="c-tabs__tab" href="<?= e($directoryLink(['status' => $statusValue])) ?>" aria-selected="<?= $statusValue === $filters['status'] ? 'true' : 'false' ?>"><?= e($statusLabel) ?></a>
  <?php endforeach; ?>
</nav>
<?php
$statusTabsContent = ob_get_clean();

ob_start();
?>
<?php if ($directoryView === 'office'): ?>
  <nav class="c-tabs c-tabs--roles" aria-label="Directory">
    <?php foreach ($tabs as $tabRole => $tabLabel): ?>
      <a class="c-tabs__tab c-tabs__tab--<?= e(config("people.tones.{$tabRole}")) ?>" href="<?= e("{$pageUrl}?tab={$tabRole}") ?>"
         aria-selected="<?= $tabRole === $tab ? 'true' : 'false' ?>"><?= e($tabLabel) ?></a>
    <?php endforeach; ?>
  </nav>
<?php else: ?>
  <form class="c-people__header-search" method="get" action="<?= e($pageUrl) ?>" role="search">
    <label class="c-search">
      <?= icon('search', 16) ?>
      <input type="search" class="c-search__input" name="q" value="<?= e($filters['q']) ?>" placeholder="<?= e(words('Search {students}…')) ?>" aria-label="<?= e(words('Search {students}')) ?>">
    </label>
  </form>
<?php endif; ?>
<?php
$headerContent = ob_get_clean();
$title         = $directoryView === 'office' ? 'Users Directory' : words('{Student} Details');
$subtitle      = $directoryView === 'office' ? words('Find {students}, staff, and families by the details that matter.') : words('Find {students} and {parents} by the details that matter.');
require __DIR__ . '/_page_header.php';
?>
