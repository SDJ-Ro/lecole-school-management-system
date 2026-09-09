<?php
// One notice card. Needs $notice, $currentRole and $csrfField
// Set $showActions to false to show the card without buttons, like on a club's page
$noticeUrl      = config("notices.board.{$currentRole}.url");
$noticeAudience = explode(',', $notice['audience']);
$noticeForAll   = array_diff(config('posting.audience'), $noticeAudience) === [];   // For every role, show one All tag
$noticeScope    = $notice['extracurricular_name']
    ?? ($notice['class_name'] !== null ? word('class') . " {$notice['class_name']}" : null)
    ?? ($notice['grade_number'] !== null ? grade_name((int) $notice['grade_number']) : null)
    ?? word('institution') . '-Wide';
$noticeAuthor   = $notice['author_name'] ?? 'Former staff';
$noticeDay      = fn (string $date): string => date(country('short_day_format'), strtotime($date));
$noticeDate     = match (substr($notice['publish_at'], 0, 10))
{
    date('Y-m-d')                         => 'Today',
    date('Y-m-d', strtotime('yesterday')) => 'Yesterday',
    default                               => date(country('date_format'), strtotime($notice['publish_at'])),
};
?>
<article class="c-notice-card c-notice-card--<?= e(strtolower($notice['category'])) ?><?= $notice['review'] === 'pending' ? ' c-notice-card--waiting' : '' ?>"
         data-category="<?= e($notice['category']) ?>" data-audience="<?= e($noticeForAll ? 'all' : $notice['audience']) ?>"
         data-review="<?= e($notice['review']) ?>"
         data-mine="<?= $notice['isMine'] ? 'true' : 'false' ?>" data-for-me="<?= $notice['isForMe'] ? 'true' : 'false' ?>">
  <?php if ($notice['pinned']): ?>
    <span class="c-notice-card__pin" role="img" aria-label="Pinned notice"><?= icon('pinFilled', 18) ?></span>
  <?php endif; ?>

  <div class="c-notice-card__tags">
    <span class="c-tag c-tag--linen"><?= e($notice['category']) ?></span>
    <span class="c-tag c-tag--linen"><?= e($noticeScope) ?></span>

    <?php // Staff also see notices that are not live yet or still need approval ?>
    <?php if ($notice['state'] === 'scheduled'): ?>
      <span class="c-tag c-tag--linen">Publishes <?= e($noticeDay($notice['publish_at'])) ?></span>
    <?php elseif ($notice['expires_at'] !== null): ?>
      <span class="c-tag c-tag--linen">Expires <?= e($noticeDay($notice['expires_at'])) ?></span>
    <?php endif; ?>

    <?php if ($notice['review'] !== 'approved'): ?>
      <span class="c-tag c-tag--linen"><?= e($notice['review'] === 'pending' ? 'Awaiting approval' : "Not approved: {$notice['review_note']}") ?></span>
    <?php endif; ?>

    <?php foreach ($noticeForAll ? ['all'] : $noticeAudience as $who): ?>
      <span class="c-tag c-tag--<?= e(config("notices.audience_tones.{$who}")) ?>"><?= e($who === 'all' ? 'All' : plural($who)) ?></span>
    <?php endforeach; ?>
  </div>

  <h2 class="c-notice-card__title"><?= e($notice['title']) ?></h2>
  <p class="c-notice-card__body"><?= e($notice['body']) ?></p>

  <?php if (($notice['trip'] ?? null) !== null): ?>
    <?php $noticeTrip = $notice['trip']; ?>
    <?php // A trip permission request. Staff see the answers, everyone else sees their own part ?>
    <div class="c-notice-card__trip">
      <p class="c-notice-card__trip-line"><?= icon('mapPin', 14) ?><?= e($noticeTrip['line']) ?></p>
      <?php if (isset($noticeTrip['answers'])): ?>
        <button type="button" class="c-btn c-btn--outline c-btn--small" data-pop-up-open="<?= e("j-trip-replies-{$notice['id']}") ?>">
          <?= icon('users', 13) ?><?= e('View Replies (' . implode(' / ', array_map('count', $noticeTrip['answers'])) . ')') ?>
        </button>
        <?php
        ob_start();
        ?>
        <div class="c-pop-up__body">
          <?php foreach ($noticeTrip['answers'] as $noticeGroup => $noticeNames): ?>
            <section class="c-notice-card__answers-group">
              <h3 class="c-label"><?= e($noticeGroup . ' · ' . count($noticeNames)) ?></h3>
              <p class="c-notice-card__answers-names"><?= e($noticeNames === [] ? '—' : implode(', ', $noticeNames)) ?></p>
            </section>
          <?php endforeach; ?>
        </div>
        <?php
        $popUpContent     = ob_get_clean();
        $popUpId          = "j-trip-replies-{$notice['id']}";
        $popUpIcon        = 'users';
        $popUpEyebrow     = 'Replies';
        $popUpTitle       = $notice['title'];
        $popUpDescription = $noticeTrip['line'];
        require __DIR__ . '/_pop_up.php';
        ?>
      <?php endif; ?>
      <?php if (($noticeTrip['mine'] ?? null) !== null): ?>
        <p class="c-notice-card__trip-mine"><?= e($noticeTrip['mine']) ?></p>
      <?php endif; ?>
      <?php if (isset($noticeTrip['approvals'])): ?>
        <a class="c-btn c-btn--outline c-btn--small" href="<?= e($noticeTrip['approvals']) ?>"><?= icon('checkCircle', 13) ?>Answer on Approvals</a>
      <?php endif; ?>
    </div>
  <?php endif; ?>

  <footer class="c-notice-card__footer">
    <div class="c-notice-card__author">
      <span class="c-avatar c-avatar--light"><?= e(initials($noticeAuthor)) ?></span>
      <div>
        <p class="c-notice-card__author-name"><?= e($noticeAuthor) ?></p>
        <p class="c-label c-notice-card__date"><?= e($noticeDate) ?></p>
      </div>
    </div>

    <?php if (($showActions ?? true) && $notice['canManage']): ?>
      <div class="c-notice-card__actions">
        <?php if ($notice['review'] === 'approved'): ?>
          <form class="c-notice-card__action" method="post" action="<?= e("{$noticeUrl}/pin") ?>">
            <?= $csrfField ?>
            <input type="hidden" name="id" value="<?= e($notice['id']) ?>">
            <button type="submit" class="c-notice-card__icon-btn" aria-label="<?= $notice['pinned'] ? 'Unpin notice' : 'Pin notice' ?>">
              <?= icon($notice['pinned'] ? 'pinFilled' : 'pin', 16) ?>
            </button>
          </form>
        <?php endif; ?>

        <a class="c-notice-card__icon-btn" href="<?= e("{$noticeUrl}?edit={$notice['id']}") ?>" aria-label="Edit notice"><?= icon('edit', 16) ?></a>

        <form class="c-notice-card__action" method="post" action="<?= e("{$noticeUrl}/delete") ?>"
              data-question-title="Delete Notice?" data-question-button="Delete Notice"
              data-question-text="<?= e("Are you sure you want to delete \"{$notice['title']}\"? This will remove it from the Notice Board.") ?>">
          <?= $csrfField ?>
          <input type="hidden" name="id" value="<?= e($notice['id']) ?>">
          <button type="submit" class="c-notice-card__icon-btn c-notice-card__icon-btn--danger" aria-label="Delete notice"><?= icon('trash', 16) ?></button>
        </form>
      </div>
    <?php endif; ?>

    <?php // Approve or Reject. Reject asks for a reason first ?>
    <?php if (($showActions ?? true) && $notice['canReview']): ?>
      <div class="c-notice-card__review">
        <form class="c-notice-card__action" id="<?= e("j-notice-reject-{$notice['id']}") ?>" method="post" action="<?= e("{$noticeUrl}/review") ?>"
              data-question-title="Reject Notice?" data-question-button="Reject Notice" data-question-icon="alertCircle"
              data-question-extra="j-notice-reject-reason"
              data-question-text="<?= e("\"{$notice['title']}\" goes back to {$noticeAuthor} with your reason.") ?>">
          <?= $csrfField ?>
          <input type="hidden" name="id" value="<?= e($notice['id']) ?>">
          <input type="hidden" name="decision" value="reject">
          <button type="submit" class="c-btn c-btn--decision c-btn--maroon"><?= icon('close', 14) ?>Reject</button>
        </form>
        <form class="c-notice-card__action" method="post" action="<?= e("{$noticeUrl}/review") ?>">
          <?= $csrfField ?>
          <input type="hidden" name="id" value="<?= e($notice['id']) ?>">
          <input type="hidden" name="decision" value="approve">
          <button type="submit" class="c-btn c-btn--decision c-btn--solid"><?= icon('check', 14) ?>Approve</button>
        </form>
      </div>
    <?php endif; ?>
  </footer>
</article>
<?php unset($notice, $showActions, $noticeUrl, $noticeAudience, $noticeForAll, $noticeScope, $noticeAuthor, $noticeDay, $noticeDate, $who, $noticeTrip, $noticeGroup, $noticeNames); ?>
