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
    
    <?php if ($canResolve && !$complaintResolved): ?>
      <button type="button" class="c-btn c-btn--outline j-resolve-open">Mark as Resolved</button>
    <?php endif; ?>
  </div>

  <?php if ($complaintResolved && $complaintCard['response'] !== ''): ?>
    <div class="c-complaint-card__answer">
      <p class="c-complaint-card__answer-label"><?= e($canResolve ? words('Message to {Parent}:') : words('{Institution} Response:')) ?></p>
      <p class="c-complaint-card__answer-text"><?= e($complaintCard['response']) ?></p>
    </div>
  <?php endif; ?>

  <?php if ($canResolve && !$complaintResolved): ?>
    <form class="c-complaint-card__answer c-complaint-card__resolve j-resolve-form" method="post" action="/management/complaints/resolve" hidden
          data-question-title="Resolve this inquiry?" data-question-button="Resolve" data-question-icon="checkCircle2" data-question-tone="success"
          data-question-text="<?= e(words('Your answer is sent to the {parent} and the inquiry closes. It can\'t be reopened.')) ?>">
      <?= $csrfField ?>
      <input type="hidden" name="id" value="<?= e($complaintCard['id']) ?>">
      <input type="text" class="c-field__input c-complaint-card__input" name="response" maxlength="<?= e(config('complaints.limits.response')) ?>" required autocomplete="off"
             aria-label="<?= e(words('Message to the {parent}')) ?>"
             placeholder="<?= e(words('Write a message to the {parent} explaining the resolution…')) ?>">
      <button type="button" class="c-btn c-btn--close j-resolve-cancel" aria-label="Cancel"><?= icon('close', 16) ?></button>
      <button type="submit" class="c-btn c-btn--moss c-complaint-card__send"><?= icon('send', 14) ?>Resolve</button>
    </form>
  <?php endif; ?>
</article>
<?php unset($complaintCard, $complaintStatus, $complaintIcon, $complaintResolved); ?>
