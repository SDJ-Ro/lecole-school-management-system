<?php
// Donut chart. Needs $donutConfig
// Each slice is the same circle with an outline as long as its share, starting where the last one ended
$slices = $donutConfig['slices'];
$total  = array_sum(array_column($slices, 'value'));
$ring   = 2 * M_PI * 60;                  // Length of the ring, radius 60
$gap    = count($slices) > 1 ? 5 : 0;     // White gap between slices
$start  = 0;
?>
<section class="c-panel c-donut-card j-donut" data-unit="<?= e($donutConfig['unit']) ?>">
  <?php if (($donutConfig['filter'] ?? null) === null): ?>
    <h2 class="c-panel__title"><?= e($donutConfig['title']) ?></h2>
  <?php else: ?>
    <?php // A choice reloads the page, keeping the other pickers ?>
    <div class="c-panel__head">
      <h2 class="c-panel__title"><?= e($donutConfig['title']) ?></h2>
      <form method="get" data-submit-on-change>
        <?php foreach ($donutConfig['keep'] as $keepName => $keepValue): ?>
          <input type="hidden" name="<?= e($keepName) ?>" value="<?= e($keepValue) ?>">
        <?php endforeach; ?>
        <?php
        $dropdownId    = "j-donut-{$donutConfig['filter']['name']}";
        $variant       = 'cream';
        $options       = $donutConfig['filter']['options'];
        $selectedValue = $donutConfig['filter']['value'];
        $dropdownLabel = 'View';
        $name          = $donutConfig['filter']['name'];
        require __DIR__ . '/_dropdown.php';
        ?>
      </form>
    </div>
  <?php endif; ?>
