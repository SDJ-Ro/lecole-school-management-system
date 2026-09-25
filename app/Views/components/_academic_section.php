<?php
// Record book with a trend chart. Needs $records, $year, $term and $exportUrl
// PHP draws the chart for every year, and academic-section.js only switches between them
if ($records === [])
{
    require __DIR__ . '/_digital_record_book.php';

    return;
}

$shown = $records[$year]['terms'][$term];
$years = array_keys($records);

// Trend chart sizes, in SVG units
$chart = ['width' => 260, 'height' => 130, 'left' => 34, 'right' => 8, 'top' => 10, 'bottom' => 30];
$plotW = $chart['width'] - $chart['left'] - $chart['right'];
$plotH = $chart['height'] - $chart['top'] - $chart['bottom'];
$baseY = $chart['top'] + $plotH;                       // Where the X axis sits
$termLetter = mb_substr(word('term'), 0, 1);          // First letter of the term word, as in T1
?>
<div class="l-academic-grid">
  <?php require __DIR__ . '/_digital_record_book.php'; ?>

  <div class="l-academic-grid__side j-academic-side" data-book="j-record-book">
    <section class="c-total-marks" aria-label="Total marks">
      <span class="c-total-marks__icon" aria-hidden="true"><?= icon('trendingUp', 22) ?></span>
      <p class="c-label c-total-marks__label">Total Marks (<span class="j-total-term"><?= e(word('term') . " {$term}") ?></span>)</p>
      <p class="c-total-marks__value">
        <span class="j-total-scored"><?= e($shown['total']) ?></span>
        <span class="c-total-marks__out-of">/<span class="j-total-out-of"><?= e($shown['outOf']) ?></span></span>
      </p>
      <p class="c-total-marks__line">Average: <span class="j-total-average"><?= e($shown['average']) ?></span></p>
      <p class="c-total-marks__line"><?= e(word('class')) ?> Position: <strong class="j-total-placement"><?= e($shown['placement']) ?></strong></p>
    </section>
