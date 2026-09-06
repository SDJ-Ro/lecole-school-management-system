<?php
// One complaint card. Needs $complaintCard, $categories, $statuses, $canResolve and $csrfField
[$complaintStatus, $complaintIcon] = $statuses[$complaintCard['status']];
$complaintResolved = $complaintCard['status'] === 'resolved';
?>
<article class="c-card c-complaint-card c-complaint-card--<?= e($categories[$complaintCard['category']]) ?> j-complaint-card">
  <div class="c-complaint-card__body">
    <div class="c-complaint-card__main">
      <div class="c-complaint-card__meta">
        <span class="c-tag c-tag--round c-complaint-card__status <?= $complaintResolved ? 'c-tag--moss' : 'c-tag--flame' ?>">
          <?= icon($complaintIcon, 13) ?><?= e($complaintStatus) ?>
        </span>
        <span class="c-tag c-tag--oat"><?= e($complaintCard['category']) ?></span>
        <span class="c-complaint-card__separator" aria-hidden="true">•</span>
        <span class="c-complaint-card__date"><?= e(date(country('date_format'), strtotime($complaintCard['date']))) ?></span>
        <?php if ($complaintCard['waiting'] !== null): ?>
          <?php // How long an open complaint has waited ?>
          <span class="c-complaint-card__separator" aria-hidden="true">•</span>
          <span class="c-complaint-card__date"><?= e(match ($complaintCard['waiting'])
          {
              0       => 'Sent today',
              1       => 'Waiting 1 day',
              default => "Waiting {$complaintCard['waiting']} days",
          }) ?></span>
        <?php endif; ?>
      </div>

      <h2 class="c-complaint-card__title"><?= e($complaintCard['title']) ?></h2>
      <p class="c-complaint-card__message"><?= e($complaintCard['message']) ?></p>

      <p class="c-complaint-card__context">
        <span><strong><?= e($complaintCard['several'] ? plural('student') : word('student')) ?>:</strong> <?= e($complaintCard['students']) ?></span>
        <?php if ($canResolve): ?>
          <span class="c-complaint-card__separator" aria-hidden="true">•</span>
          <span><strong><?= e(word('parent')) ?>:</strong> <?= e($complaintCard['parent']) ?></span>
        <?php endif; ?>
      </p>
    </div>
