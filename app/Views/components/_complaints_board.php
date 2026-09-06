<?php
// Complaints board for parents and management. The filters are a GET form, so the server picks the cards
// Needs $filters, $categories, $statuses, $years, $grades, $classes, $complaints, $currentPath, $searchText and $canResolve
// Parents get no $grades
?>
<form class="l-filter-bar l-filter-bar--page" method="get" action="<?= e($currentPath) ?>" role="search" data-submit-on-change>
  <label class="c-search l-filter-bar__search">
    <?= icon('search', 16) ?>
    <input type="search" class="c-search__input" name="q" value="<?= e($filters['q']) ?>" placeholder="<?= e($searchText) ?>" aria-label="Search inquiries">
  </label>

  <div class="l-filter-bar__selects">
    <?php
    $dropdownId    = 'j-complaints-year';
    $dropdownLabel = 'Filter by year';
    $name          = 'year';
    $prefix        = 'Year';
    $options       = array_map(fn (int $year): array => ['value' => (string) $year, 'label' => (string) $year], $years);
    $selectedValue = (string) $filters['year'];
    require __DIR__ . '/_dropdown.php';
    ?>
