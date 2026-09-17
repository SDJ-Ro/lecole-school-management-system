<?php
$tabTitle = 'Character Certificate';
$styles   = ['page-header', 'panel', 'tag', 'empty-box', 'dropdown', 'form-field', 'certificate-sheet', 'certificates', 'my-requests'];
$scripts  = ['dropdown', 'certificate-sheet', 'file-box', 'missing-record'];
$grids    = ['certificates'];

require dirname(__DIR__) . '/layouts/page_top.php';

$title     = 'Character Certificate';
$subtitle  = words('Review and verify {student} achievements and conduct records.');
$isIssued  = $certificate['status'] === 'issued';
ob_start();
?>
<div class="c-certificates__header-buttons">
  <?php if ($isIssued): ?>
    <a class="c-btn c-btn--outline c-btn--compact" href="/student/certificates/pdf" target="_blank"><?= icon('printer', 16) ?>Download / Print</a>
  <?php else: ?>
    <button type="button" class="c-btn c-btn--outline c-btn--compact" disabled title="Available once issued"><?= icon('printer', 16) ?>Download / Print</button>
  <?php endif; ?>
  <button type="button" class="c-btn c-btn--maroon c-btn--compact" data-pop-up-open="j-certificate-request"><?= icon('fileCheck', 16) ?>Request Character Certificate</button>
</div>
<?php
$headerContent = ob_get_clean();
require dirname(__DIR__) . '/components/_page_header.php';
?>