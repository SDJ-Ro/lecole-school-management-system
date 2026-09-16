<?php
// One certificate or missing record request. Needs $requestCard, $requestKind, $requestStaff and $csrfField
// $requestStaff is empty when the card is read only
// A copy can only be approved once the certificate is issued
$card  = $requestCard;
$staff = $card['status'] === 'pending' ? $requestStaff : null;
?>
<article class="c-request-card">
  <div class="c-request-card__top">
    <span class="c-request-card__id"><?= e($card['label']) ?></span>
    <span class="c-tag c-tag--round c-tag--<?= e($card['tone']) ?>"><?= e($card['state']) ?></span>
  </div>

  <?php if ($requestKind === 'copy'): ?>
    <dl class="c-request-card__fields">
      <?php foreach ($card['fields'] as $requestLabel => $requestValue): ?>
        <div><dt><?= e($requestLabel) ?>:</dt><dd><?= e($requestValue) ?></dd></div>
      <?php endforeach; ?>
    </dl>
  <?php else: ?>
    <h4 class="c-request-card__title"><?= e($card['title']) ?></h4>
    <p class="c-request-card__text"><?= e($card['text']) ?></p>
    <div class="c-request-card__box c-request-card__assigned">
      <?= icon('user', 14) ?>
      <span>Assigned to: <strong><?= e($card['assigned']) ?></strong></span>
    </div>
    <div class="c-request-card__box c-request-card__file">
      <span class="c-request-card__file-icon"><?= icon('fileText', 14) ?></span>
      <span class="c-request-card__file-name"><?= e($card['file']) ?></span>
      <?php if ($staff !== null): ?>
        <a class="c-btn c-btn--icon" href="<?= e("/{$staff['role']}/achievements/evidence?request={$card['id']}") ?>" target="_blank" rel="noopener"
           aria-label="<?= e("Open {$card['file']}") ?>"><?= icon('eye', 14) ?></a>
      <?php endif; ?>
    </div>
  <?php endif; ?>
