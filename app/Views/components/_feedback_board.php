<?php
// Feedback board for teachers, parents and students. The filters are a GET form, so the server picks the cards
// Needs $filters, $types, $years, $feedback and $currentPath
// Teachers get no $years, so there is no year filter
?>
<form class="l-filter-bar l-filter-bar--page" method="get" action="<?= e($currentPath) ?>" role="search" data-submit-on-change>
  <label class="c-search l-filter-bar__search">
    <?= icon('search', 16) ?>
    <input type="search" class="c-search__input" name="q" value="<?= e($filters['q']) ?>" placeholder="Search feedback…" aria-label="Search feedback">
  </label>

  <div class="l-filter-bar__selects">
    <?php if ($years !== null): ?>
      <?php
      $dropdownId    = 'j-feedback-year';
      $dropdownLabel = 'Filter by year';
      $name          = 'year';
      $prefix        = 'Year';
      $options       = array_map(fn (int $year): array => ['value' => (string) $year, 'label' => (string) $year], $years);
      $selectedValue = (string) $filters['year'];
      require __DIR__ . '/_dropdown.php';
      ?>
    <?php endif; ?>

    <?php
    $dropdownId    = 'j-feedback-type';
    $dropdownLabel = 'Filter by feedback type';
    $name          = 'type';
    $options       = [['value' => '', 'label' => 'All Types']];
    foreach ($types as $typeKey => [$typeName])
    {
        $options[] = ['value' => $typeKey, 'label' => $typeName];
    }
    $selectedValue = $filters['type'];
    require __DIR__ . '/_dropdown.php';
    ?>
  </div>
</form>

<?php if ($feedback === []): ?>
  <div class="c-empty-box c-empty-box--titled">
    <?= icon('feedback', 32) ?>
    <p class="c-empty-box__title">No feedback entries found</p>
    <p class="c-empty-box__text">Try adjusting your search query or filter selection.</p>
  </div>
<?php else: ?>
  <div class="l-feedback-grid">
    <?php foreach ($feedback as $feedbackCard): ?>
      <?php require __DIR__ . '/_feedback_card.php'; ?>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

<?php
// Pop-up for one card in full, filled in by feedback-card.js
ob_start();
?>
<div><button type="button" class="c-btn c-btn--back j-pop-up-close"><?= icon('arrowLeft', 16) ?><span>Back</span></button></div>
<div id="j-feedback-detail-card"></div>
<?php
$popUpContent = ob_get_clean();
$popUpShape   = 'plain';
$popUpId      = 'j-feedback-detail';
$popUpVariant = 'feedback-detail';
require __DIR__ . '/_pop_up.php';

unset($filters, $types, $years, $feedback, $typeKey, $typeName);
?>
