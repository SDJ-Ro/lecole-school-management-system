<?php
// Each page sets $tabTitle and $styles, and $grids if it has layout rows
// $sessionTimeout is the idle time before sign-out, in seconds
?>
<!doctype html>
<html lang="<?= e(country('language')) ?>">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= e($tabTitle) ?> — <?= e(school('name')) ?></title>
  <link rel="icon" href="<?= e(school('logo')) ?>" />
  <link rel="stylesheet" href="<?= e(asset('css/global.css')) ?>" />
  <?php // Styles every signed-in page needs ?>
  <?php foreach (['sidebar', 'pick-menu', 'button', 'label', 'avatar', 'banner', 'closing-banner', 'pop-up', 'question-pop-up', 'feedback-banner'] as $style): ?>
    <link rel="stylesheet" href="<?= e(asset("css/components/{$style}.css")) ?>" />
  <?php endforeach; ?>
  <?php foreach ($styles as $style): ?>
    <link rel="stylesheet" href="<?= e(asset("css/components/{$style}.css")) ?>" />
  <?php endforeach; ?>
  <?php foreach ($grids ?? [] as $grid): ?>
    <link rel="stylesheet" href="<?= e(asset("css/layout/{$grid}-grid.css")) ?>" />
  <?php endforeach; ?>
</head>
<body data-session-timeout="<?= e($sessionTimeout) ?>">

<?php // Today's date and date formats from PHP, so the scripts show dates the same way ?>
<script type="application/json" id="j-school-dates"><?= json_encode([
    'today'    => date('Y-m-d'),
    'formats'  => [
        'date' => country('date_format'),
        'day'  => country('day_format'),
        'full' => country('full_date_format'),
        'long' => country('long_date_format'),
    ],
    'months'   => array_map(fn (int $month): string => date('F', mktime(0, 0, 0, $month, 1)), range(1, 12)),
    'weekdays' => array_map(fn (int $day): string => date('l', mktime(0, 0, 0, 1, $day, 2024)), range(1, 7)),   // 1 Jan 2024 was a Monday
], JSON_HEX_TAG) ?></script>

<?php require dirname(__DIR__) . '/components/icons.php'; ?>

<div id="j-app-root" class="c-app-shell">
  <?php require dirname(__DIR__) . '/components/_sidebar.php'; ?>

  <main class="c-main" id="j-main">
    <?php require dirname(__DIR__) . '/components/_closing_banner.php'; ?>
