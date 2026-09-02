<?php
// One feedback card. Needs $feedbackCard, $types and $csrfField
// feedback-card.js copies this same card into a pop-up for the full view
// The card has a readUrl only while it is unread
[$feedbackTypeName, $feedbackIcon] = $types[$feedbackCard['type']];
$feedbackDate   = date(country('date_format'), strtotime($feedbackCard['date']));
$feedbackUnread = $feedbackCard['readUrl'] !== null;
?>
<article class="c-card c-feedback-card c-feedback-card--<?= e($feedbackCard['type']) ?><?= $feedbackUnread ? ' c-feedback-card--unread' : '' ?> j-feedback-card"
         tabindex="0" role="button" aria-label="<?= e(($feedbackUnread ? 'Unread feedback: ' : 'Read the full feedback: ') . $feedbackCard['title']) ?>">
  <?php if ($feedbackUnread): ?>
    <form class="j-feedback-read" method="post" action="<?= e($feedbackCard['readUrl']) ?>" hidden>
      <?= $csrfField ?>
      <input type="hidden" name="id" value="<?= e($feedbackCard['id']) ?>">
    </form>
  <?php endif; ?>

  <div class="c-feedback-card__body">
    <div class="c-feedback-card__top">
      <span class="c-tag c-tag--soft c-feedback-card__type"><?= icon($feedbackIcon, 12) ?><?= e($feedbackTypeName) ?></span>
      <span class="c-label c-feedback-card__date"><?= e($feedbackDate) ?></span>
    </div>

    <?php if ($feedbackCard['to'] !== ''): ?>
      <p class="c-label c-feedback-card__to"><?= e($feedbackCard['to']) ?></p>
    <?php endif; ?>

    <div class="c-feedback-card__heading">
      <h2 class="c-feedback-card__title"><?= e($feedbackCard['title']) ?></h2>
      <p class="c-feedback-card__teacher">
        <strong><?= e($feedbackCard['teacher']) ?></strong><span class="c-feedback-card__separator" aria-hidden="true">•</span><?= e($feedbackCard['subject']) ?>
      </p>
    </div>

    <p class="c-feedback-card__text"><?= e($feedbackCard['text']) ?></p>
  </div>

  <footer class="c-feedback-card__footer">
    <span class="c-feedback-card__more">Read Full Feedback <?= icon('chevronRight', 14) ?></span>
    <span class="c-feedback-card__record">Official Feedback Record</span>
    <span class="c-label c-feedback-card__date c-feedback-card__record"><?= e($feedbackDate) ?></span>
    <?php if ($feedbackCard['mine']): ?>
      <?php // Only shown on the full card ?>
      <form class="c-feedback-card__record" method="post" action="/teacher/feedback/delete" data-question-title="<?= e("Delete '{$feedbackCard['title']}'?") ?>"
            data-question-text="<?= e("It goes from {$feedbackCard['student']}'s feedback. This cannot be undone.") ?>" data-question-button="Delete Feedback">
        <?= $csrfField ?>
        <input type="hidden" name="id" value="<?= e($feedbackCard['id']) ?>">
        <button type="submit" class="c-btn c-btn--icon" aria-label="<?= e("Delete {$feedbackCard['title']}") ?>" title="Delete"><?= icon('trash', 16) ?></button>
      </form>
    <?php endif; ?>
  </footer>
</article>
<?php unset($feedbackCard, $feedbackTypeName, $feedbackIcon, $feedbackDate, $feedbackUnread); ?>
