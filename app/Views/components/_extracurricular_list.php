<?php
// List of clubs and sports. The search and tabs are links and a GET form, so the server picks the cards
// Needs $can, $filters, $programmes, $emptyText, $teachers, $listPath and $listKeep
?>
<?php // The page look is only for a bar right under the page header, not inside a tab ?>
<div class="l-filter-bar<?= $listKeep === [] ? ' l-filter-bar--page' : '' ?> l-filter-bar--close">
  <form class="l-filter-bar__search" method="get" action="<?= e($listPath) ?>" role="search">
    <label class="c-search c-search--rounded">
      <?= icon('search', 16) ?>
      <input type="search" class="c-search__input" name="q" value="<?= e($filters['q']) ?>" placeholder="Search activities (e.g. Cricket, Debating, Football…)" aria-label="Search activities">
    </label>
    <?php foreach (array_filter($listKeep + ['type' => $filters['type']]) as $keepName => $keepValue): ?>
      <input type="hidden" name="<?= e($keepName) ?>" value="<?= e($keepValue) ?>">
    <?php endforeach; ?>
  </form>

  <div class="l-filter-bar__selects">
    <nav class="c-tabs" aria-label="Activity type">
      <?php foreach (['' => 'All'] + array_map(fn (array $type): string => $type['tab'], config('extracurricular.types')) + ($can['approve'] ? ['archived' => 'Archived'] : []) as $typeKey => $typeTab): ?>
        <a class="c-tabs__tab" href="<?= e(url_with($listPath, $listKeep + ['q' => $filters['q'], 'type' => $typeKey])) ?>" aria-selected="<?= $filters['type'] === $typeKey ? 'true' : 'false' ?>"><?= e($typeTab) ?></a>
      <?php endforeach; ?>
    </nav>
  </div>
</div>
