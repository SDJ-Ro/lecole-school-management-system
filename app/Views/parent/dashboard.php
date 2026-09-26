<?php
$tabTitle  = word('parent') . ' Dashboard';
$title     = 'Dashboard';
$subtitle  = "Welcome back, {$userName}!";
$styles    = ['page-header', 'metric-card', 'dropdown', 'panel', 'chart', 'bar-chart', 'empty-box', 'calendar/calendar', 'calendar/day-card', 'calendar/day-card-popup', 'upcoming-events', 'notifications', 'tag'];
$scripts   = ['dropdown', 'chart', 'bar-chart', 'calendar/calendar'];
$grids     = ['metric-cards', 'chart-calendar', 'events-notices'];
require dirname(__DIR__) . '/layouts/page_top.php';
require dirname(__DIR__) . '/components/_page_header.php';
?>

<?php if ($metrics !== []): ?>
  <div class="l-metric-cards-grid l-metric-cards-grid--four">
    <?php foreach ($metrics as $card): ?>
      <?php require dirname(__DIR__) . '/components/_metric_card.php'; ?>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

<?php if ($chartConfig !== null || $calendarConfig !== null): ?>
  <div class="l-chart-calendar-grid">
    <?php if ($chartConfig !== null): ?>
      <?php require dirname(__DIR__) . '/components/_bar_chart.php'; ?>
    <?php endif; ?>
    <?php if ($calendarConfig !== null): ?>
      <?php require dirname(__DIR__) . '/components/calendar/_calendar.php'; ?>
    <?php endif; ?>
  </div>
<?php endif; ?>

<?php if ($upcomingEvents !== null || $notifications !== null): ?>
  <section class="l-events-notices-grid" aria-label="Upcoming events and notifications">
    <?php if ($upcomingEvents !== null): ?>
      <?php require dirname(__DIR__) . '/components/_upcoming_events.php'; ?>
    <?php endif; ?>
    <?php if ($notifications !== null): ?>
      <?php require dirname(__DIR__) . '/components/_notifications.php'; ?>
    <?php endif; ?>
  </section>
<?php endif; ?>

<?php require dirname(__DIR__) . '/layouts/page_bottom.php'; ?>
