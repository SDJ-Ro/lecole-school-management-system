<?php
$tabTitle = 'Approvals';
$styles   = ['page-header', 'metric-card', 'panel', 'tag', 'empty-box', 'form-field', 'approval-card'];
$scripts  = [];
$grids    = ['metric-cards', 'approvals'];

require dirname(__DIR__) . '/layouts/page_top.php';

$title = 'Approvals';
require dirname(__DIR__) . '/components/_page_header.php';
?>
<div class="l-approvals">
<nav class="l-metric-cards-grid l-metric-cards-grid--three l-metric-cards-grid--tight" aria-label="Show requests">
  <?php foreach ($tabs as $card): ?>
    <?php require dirname(__DIR__) . '/components/_metric_card.php'; ?>
  <?php endforeach; ?>
</nav>

<p class="c-label l-approvals-summary"><?= e(count($requests) . " {$status} request" . (count($requests) === 1 ? '' : 's')) ?></p>

<?php if ($requests === []): ?>
  <div class="c-empty-box">
    <p class="c-empty-box__text"><?= e("No {$status} requests.") ?></p>
  </div>
<?php else: ?>
  <div class="l-approvals-grid">
    <?php foreach ($requests as $request): ?>
      <?php require dirname(__DIR__) . '/components/_approval_card.php'; ?>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
</div>

<?php
// Optional reason box for when the parent declines a request
$reasonBox = ['id' => 'j-approval-reason', 'label' => 'Reason (Optional)', 'required' => false,
              'placeholder' => 'Let the ' . strtolower(word('institution')) . " know why you're declining…"];
require dirname(__DIR__) . '/components/_reason_template.php';
unset($tabs, $status, $requests);
require dirname(__DIR__) . '/layouts/page_bottom.php';
