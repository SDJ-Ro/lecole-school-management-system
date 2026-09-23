<?php
// One person's profile, sent as JSON into the People pop-up
// A tab whose feature is switched off is left out
// The edit boxes only show while the content has data-editing set to true
$membershipStatus = ['member' => 'Active', 'parent' => words('Waiting for the {parent}'), 'teacher' => words('Waiting for the {teacher}'), 'declined' => 'Declined'];
?>
<?php
$headerOnPage = false;
require __DIR__ . '/_person_header.php';
?>

<div class="c-person__body">
  <?php if (($student['watch'] ?? null) !== null): ?>
    <?php $watch = $student['watch']; ?>
    <div class="c-banner c-banner--warning c-person__notice">
      <?= icon('alertCircle', 20) ?>
      <div class="c-person__notice-body">
        <?php if ($watch['locked']): ?>
          <span><strong>Academic Watch</strong> · <?= e("{$watch['low']} " . strtolower(plural('subject')) . ' under ' . rule('pass_mark') . ' in ' . word('term') . " {$watch['term']}, {$watch['year']}") ?> · can't join new clubs or sports.</span>
        <?php else: ?>
          <span><?= e("Lock lifted by {$watch['lifted']['lifted_by_name']} on " . date(country('date_format'), strtotime($watch['lifted']['lifted_at'])) . ": \"{$watch['lifted']['reason']}\", until the next published " . strtolower(word('term')) . '.') ?></span>
        <?php endif; ?>
        <form class="c-person__notice-form" method="post" action="<?= e($watch['url']) ?>">
          <?= $csrfField ?>
          <input type="hidden" name="student" value="<?= e($id) ?>">
          <?php if ($watch['locked']): ?>
            <input type="hidden" name="action" value="lift">
            <input type="text" class="c-field__input c-field__input--small" name="reason" maxlength="255" required placeholder="Why it is lifted…" aria-label="Why the lock is lifted">
            <button type="submit" class="c-btn c-btn--dark c-btn--small">Lift Lock</button>
          <?php else: ?>
            <input type="hidden" name="action" value="lock">
            <button type="submit" class="c-btn c-btn--dark c-btn--small">Lock Again</button>
          <?php endif; ?>
        </form>
      </div>
    </div>
  <?php endif; ?>

  <?php if (($student['leaving'] ?? null) !== null): ?>
    <?php $leaving = $student['leaving']; ?>
    <div class="c-banner c-banner--warning c-person__notice">
      <?= icon('logOut', 20) ?>
      <div class="c-person__notice-body">
        <span><strong><?= e('Leaving on ' . date(country('date_format'), strtotime($leaving['leaving_on']))) ?></strong> · <?= e("{$leaving['reason']} · asked by {$leaving['asked_by_name']}" . ($leaving['note'] ? " · \"{$leaving['note']}\"" : '')) ?></span>
        <?php if ($leaving['changeUrl'] !== null): ?>
          <form class="c-person__notice-form" method="post" action="<?= e($leaving['changeUrl']) ?>">
            <?= $csrfField ?>
            <input type="hidden" name="student" value="<?= e($id) ?>">
            <input type="date" class="c-field__input c-field__input--small" name="date" required value="<?= e($leaving['leaving_on']) ?>"
                   min="<?= e(date('Y-m-d', strtotime('+1 day'))) ?>" aria-label="New leaving date">
            <button type="submit" class="c-btn c-btn--dark c-btn--small">Change Date</button>
            <button type="submit" class="c-btn c-btn--outline c-btn--small" name="action" value="cancel" formnovalidate>Cancel Leaving</button>
          </form>
        <?php endif; ?>
      </div>
    </div>
  <?php endif; ?>
