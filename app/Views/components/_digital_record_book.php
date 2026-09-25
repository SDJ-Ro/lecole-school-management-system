<?php
// Record book of marks. Needs $records, $year and $term for the one shown first, and $exportUrl
// PHP draws every year and term, and record-book.js shows the chosen one
// With no $exportUrl there is no Export PDF button
if ($records === [])
{
    echo '<div class="c-empty-box"><p class="c-empty-box__text">No published marks yet.</p></div>';

    return;
}

$bookId = 'j-record-book';
$terms  = array_unique(array_merge(...array_map(fn (array $book): array => array_keys($book['terms']), array_values($records))));
sort($terms);
?>
<section class="c-card c-record-book j-record-book" id="<?= e($bookId) ?>" aria-labelledby="<?= e($bookId) ?>-title"
         data-year="<?= e($year) ?>" data-term="<?= e($term) ?>" data-term-word="<?= e(word('term')) ?>">
  <header class="c-record-book__header">
    <div class="c-record-book__heading">
      <span class="c-record-book__icon" aria-hidden="true"><?= icon('book', 16) ?></span>
      <h2 class="c-panel__title" id="<?= e($bookId) ?>-title">
        Digital Record Book — <span class="j-record-grade"><?= e($records[$year]['label']) ?></span>
      </h2>
    </div>
    <?php if ($exportUrl !== null): ?>
      <?php
      $bookExportUrl = $exportUrl;
      $exportUrl     = "{$bookExportUrl}?year={$year}&term={$term}";
      require __DIR__ . '/_export_pdf_button.php';
      $exportUrl = $bookExportUrl;
      ?>
    <?php endif; ?>
  </header>

  <div class="c-record-book__filters">
    <div class="c-record-book__filter">
      <span class="c-label"><?= e(word('grade')) ?></span>
      <?php
      $dropdownId    = "{$bookId}-year";
      $options       = array_map(fn (int $bookYear): array => ['value' => (string) $bookYear, 'label' => $records[$bookYear]['label']], array_keys($records));
      $selectedValue = (string) $year;
      $dropdownLabel = word('grade');
      require __DIR__ . '/_dropdown.php';
      ?>
