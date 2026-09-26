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

    <?php if ($isScores): ?>
      <div class="c-control-row">
        <?php
        $dropdownId    = $chartConfig['id'] . '-term';
        $variant       = 'cream';
        $options       = array_keys($terms);
        $selectedValue = $shown;
        $dropdownLabel = 'Select academic term';
        require __DIR__ . '/_dropdown.php';
        ?>
      </div>
    <?php endif; ?>
    <?php if (!empty($chartConfig['filters'])): ?>
      <form class="c-control-row j-chart-filters" method="get">
        <?php foreach ($chartConfig['keep'] ?? [] as $keepName => $keepValue): ?>
          <input type="hidden" name="<?= e($keepName) ?>" value="<?= e($keepValue) ?>">
        <?php endforeach; ?>
        <?php foreach ($chartConfig['filters'] as $filter): ?>
          <?php
          $dropdownId    = "{$chartConfig['id']}-{$filter['name']}";
          $options       = $filter['options'];
          $selectedValue = $filter['value'];
          $dropdownLabel = $filter['label'];
          $name          = $filter['name'];
          require __DIR__ . '/_dropdown.php';
          ?>
        <?php endforeach; ?>
      </form>
    <?php endif; ?>
  </div>

  <!-- The Y-axis is its own drawing, so it stays put while the bars scroll sideways -->
  <div class="c-bar-chart__wrapper">
    <svg class="c-bar-chart__y-axis" width="50" height="<?= e($height) ?>" aria-hidden="true">
      <line class="c-bar-chart__axis-line" x1="49" y1="<?= e($top) ?>" x2="49" y2="<?= e($bottom) ?>" />
      <polygon class="c-bar-chart__arrow" points="49,<?= e($top - 6) ?> 44.5,<?= e($top + 2) ?> 53.5,<?= e($top + 2) ?>" />
      <text class="c-label c-bar-chart__axis-title" x="14" y="<?= e(($top + $bottom) / 2) ?>" text-anchor="middle"
            transform="rotate(-90 14 <?= e(($top + $bottom) / 2) ?>)"><?= e($chartConfig['yAxisTitle']) ?></text>
      <?php foreach ($ticks as $tick): ?>
        <text class="c-bar-chart__tick-label" x="42" y="<?= e($bottom - $tick * $scale + 4) ?>" text-anchor="end"><?= e($tick) ?></text>
      <?php endforeach; ?>
    </svg>

    <div class="c-bar-chart__area">
      <svg width="<?= e($plotW + 18) ?>" height="<?= e($height) ?>">
        <line class="c-bar-chart__axis-line" x1="0" y1="<?= e($bottom) ?>" x2="<?= e($plotW) ?>" y2="<?= e($bottom) ?>" />
        <polygon class="c-bar-chart__arrow" points="<?= e($plotW + 6) ?>,<?= e($bottom) ?> <?= e($plotW - 2) ?>,<?= e($bottom - 4.5) ?> <?= e($plotW - 2) ?>,<?= e($bottom + 4.5) ?>" />

        <?php foreach ($groups as $index => $row): ?>
          <?php $center = $index * $groupW + $groupW / 2; ?>
          <g class="c-bar-chart__group j-chart-group" data-label="<?= e($row['label']) ?>">
            <?php foreach ($series as $number => $one): ?>
              <?php
              $values = $valuesOf($row['label'], $one['key']);
              $barH   = max($values[$shown] * $scale, 2);   // A zero still shows as a thin line
              ?>
              <rect class="c-bar-chart__bar c-series--<?= e($one['color']) ?> j-chart-bar" rx="4"
                    x="<?= e($number === 0 ? $center - 27 : $center + 3) ?>" y="<?= e($bottom - $barH) ?>" width="24" height="<?= e($barH) ?>"
                    data-series="<?= e($one['label']) ?>" data-color="<?= e($one['color']) ?>"
                    data-value="<?= e($values[$shown]) ?>" data-values="<?= e(json_encode($values)) ?>" />
            <?php endforeach; ?>
            <text class="c-bar-chart__cat-label" x="<?= e($center) ?>" y="<?= e($bottom + 16) ?>" text-anchor="middle"><?= e($row['label']) ?></text>
          </g>
        <?php endforeach; ?>
      </svg>
    </div>
  </div>

  <?php if ($chartConfig['xAxisTitle'] !== ''): ?>
    <div class="c-label c-bar-chart__axis-x-title"><?= e($chartConfig['xAxisTitle']) ?></div>
  <?php endif; ?>

  <div class="c-bar-chart__legend">
    <?php foreach ($series as $one): ?>
      <span class="c-bar-chart__legend-item">
        <span class="c-bar-chart__legend-dot c-series--<?= e($one['color']) ?>"></span>
        <?= e($one['label']) ?>
      </span>
    <?php endforeach; ?>
  </div>
</section>
