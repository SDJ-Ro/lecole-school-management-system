<?php
// Academic overview for admin and management. Needs $csrfField
// There is one hidden class editor and one stage editor, and academic.js moves them to the pressed button
$title    = 'Academic Overview';
$subtitle = 'Manage curriculum structure, assessment progress, and term schedules.';
require __DIR__ . '/_page_header.php';
?>

<div class="l-chart-calendar-grid l-chart-calendar-grid--tight">
  <?php if ($chartConfig !== null): ?>
    <?php require __DIR__ . '/_bar_chart.php'; ?>
  <?php endif; ?>
  <?php if ($calendarConfig !== null): ?>
    <?php require __DIR__ . '/calendar/_calendar.php'; ?>
  <?php endif; ?>
</div>

<div class="l-grade-sections">
  <?php ob_start(); ?>
  <?php require __DIR__ . '/_school_year.php'; ?>
  <?php
  $sectionContent = ob_get_clean();
  $sectionId      = 'school-year';
  $sectionTone    = 'sky';
  $sectionIcon    = 'calendar';
  $sectionTitle   = 'Academic Year';
  $sectionButton  = ['label' => 'Edit Dates', 'icon' => 'edit', 'data' => ['pop-up-open' => 'j-term-dates']];
  require __DIR__ . '/_section_box.php';
  ?>

