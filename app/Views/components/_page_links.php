<?php
// Previous and Next links under a long list. Needs $pageNumber, $pageCount and $pageLink
// $pageLink gives the address of another page and keeps the current filters
?>
<?php if ($pageCount > 1): ?>
  <nav class="c-page-links" aria-label="Pages">
    <?php if ($pageNumber > 1): ?>
      <a class="c-btn c-btn--outline c-btn--small" href="<?= e($pageLink($pageNumber - 1)) ?>"><?= icon('chevronLeft', 14) ?>Previous</a>
    <?php endif; ?>
    <span class="c-page-links__number"><?= e("Page {$pageNumber} of {$pageCount}") ?></span>
    <?php if ($pageNumber < $pageCount): ?>
      <a class="c-btn c-btn--outline c-btn--small" href="<?= e($pageLink($pageNumber + 1)) ?>">Next<?= icon('chevronRight', 14) ?></a>
    <?php endif; ?>
  </nav>
<?php endif; ?>
<?php unset($pageNumber, $pageCount, $pageLink); ?>
