<?php
// One approval request card. Needs $request and $csrfField
// Decline asks first, with an optional reason box from the page's j-approval-reason template
$requestTones = ['pending' => 'sand', 'approved' => 'moss', 'declined' => 'maroon'];
$requestForm  = "j-approval-decline-{$request['key']}";
?>
<article class="c-card c-approval-card">
  <div class="c-approval-card__top">
    <div>
      <span class="c-tag c-tag--terracotta"><?= e($request['kind']) ?></span>
      <h2 class="c-approval-card__title"><?= e($request['title']) ?></h2>
      <?php if ($request['meta'] !== ''): ?>
        <p class="c-approval-card__meta"><?= e($request['meta']) ?></p>
      <?php endif; ?>
    </div>
    <span class="c-tag c-tag--<?= e($requestTones[$request['status']]) ?>"><?= e(ucfirst($request['status'])) ?></span>
  </div>

  <p class="c-approval-card__description"><?= e($request['description']) ?></p>

  <div class="c-approval-card__info">
    <p class="c-approval-card__from">Request from: <strong><?= e($request['from']) ?></strong></p>
    <p class="c-approval-card__date"><?= e($request['date']) ?></p>
  </div>

  <?php if ($request['note'] !== null): ?>
    <div class="c-banner c-banner--error">
      <?= icon('message', 16) ?>
      <div>
        <p class="c-label c-approval-card__note-label"><?= e($request['noteLabel']) ?></p>
        <p class="c-approval-card__note"><?= e($request['note']) ?></p>
      </div>
    </div>
  <?php endif; ?>

  <?php // If the answer can still change, only the other button shows ?>
  <?php if ($request['status'] === 'pending' || ($request['change'] ?? false)): ?>
    <div class="c-approval-card__actions">
      <?php foreach (['decline' => ['close', 'Decline', 'maroon'], 'approve' => ['check', 'Approve', 'solid']] as $requestAnswer => [$requestIcon, $requestWord, $requestLook]): ?>
        <?php if ("{$requestAnswer}d" === $request['status']) continue; ?>
        <form class="c-approval-card__action" method="post" action="<?= e($request['action']) ?>"
              <?php if ($requestAnswer === 'decline'): ?>
                id="<?= e($requestForm) ?>" data-question-title="Decline Request?" data-question-button="Decline Request" data-question-icon="close"
                data-question-extra="j-approval-reason" data-question-text="<?= e($request['declineText']) ?>"
              <?php endif; ?>>
          <?= $csrfField ?>
          <?php foreach ($request['fields'] as $requestField => $requestValue): ?>
            <input type="hidden" name="<?= e($requestField) ?>" value="<?= e($requestValue) ?>">
          <?php endforeach; ?>
          <input type="hidden" name="answer" value="<?= e($requestAnswer) ?>">
          <button type="submit" class="c-btn c-btn--decision c-btn--<?= e($requestLook) ?>"><?= icon($requestIcon, 14) ?><?= e($requestWord) ?></button>
        </form>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</article>
<?php unset($request, $requestTones, $requestForm, $requestAnswer, $requestIcon, $requestWord, $requestLook, $requestField, $requestValue); ?>
