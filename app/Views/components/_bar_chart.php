<?php
// Bar chart with two bars per group. Needs $chartConfig
// PHP works out every position, and bar-chart.js only adds the tooltip, scrolling and term switching
// The scores variant shows marks out of 100 per term, the counts variant shows plain numbers
// Each series colour needs a matching c-series rule in the CSS
$isScores = $chartConfig['variant'] === 'scores';

if ($isScores && $chartConfig['terms'] === []): ?>
  <section class="c-panel" id="<?= e($chartConfig['id']) ?>">
    <div class="c-bar-chart-card__head">
      <h2 class="c-panel__title"><?= e($chartConfig['title']) ?></h2>
    </div>
    <div class="c-empty-box"><p class="c-empty-box__text">No marks yet.</p></div>
  </section>
<?php
    return;
endif;

$terms    = $isScores ? $chartConfig['terms'] : ['' => $chartConfig['data']];
$shown    = $isScores ? $chartConfig['term'] : '';
$ticks    = $isScores ? [0, 25, 50, 75, 100] : $chartConfig['ticks'];
$unit     = $isScores ? '%' : '';
$series   = $chartConfig['series'];
$highest  = end($ticks);

// Sizes in SVG units
$height = 380;
$top    = 14;                                // Room for the Y axis arrow
$bottom = $height - 22;                      // The X axis, with group names below it
$scale  = ($bottom - $top) / $highest;       // Height of one mark or one student
$groups = $terms[$shown];
$groupW = count($groups) <= 7 ? 126 : 95;
$plotW  = count($groups) * $groupW;

// One value per term, kept inside the chart. A missing value counts as 0
$valuesOf = function (string $label, string $key) use ($terms, $highest): array
{
    $values = [];

    foreach ($terms as $term => $rows)
    {
        $row = array_values(array_filter($rows, fn (array $r): bool => $r['label'] === $label))[0] ?? [];
        $values[$term] = min(max((float) ($row[$key] ?? 0), 0), $highest);
    }

    return $values;
};
?>

<section class="c-panel j-bar-chart" id="<?= e($chartConfig['id']) ?>"
         data-scale="<?= e($scale) ?>" data-bottom="<?= e($bottom) ?>" data-unit="<?= e($unit) ?>">

  <div class="c-bar-chart-card__head">
    <h2 class="c-panel__title"><?= e($chartConfig['title']) ?></h2>
