<?php
// $leaving stays empty when the leave module is off
$tabTitle = 'My Profile';
$title    = 'My Profile';
$styles   = ['page-header', 'panel', 'tag', 'form-field', 'profile-hero', 'info-card', 'section-header', 'profile-page', 'danger-zone', 'dropdown', 'datepicker', 'leave-school'];
$scripts  = ['profile-page', 'dropdown', 'datepicker'];
$grids    = ['profile'];

require dirname(__DIR__) . '/layouts/page_top.php';
require dirname(__DIR__) . '/components/_page_header.php';
?>

<div class="l-profile-grid">
  <?php require dirname(__DIR__) . '/components/_profile_page.php'; ?>
  <?php
  if ($leaving !== null)
  {
      $leaveRequest = $leaving['request'];
      $leaveFor     = 'student';
      $leaveName    = null;
      require dirname(__DIR__) . '/components/_leave_school.php';
  }
  ?>
</div>

<?php require dirname(__DIR__) . '/layouts/page_bottom.php'; ?>
