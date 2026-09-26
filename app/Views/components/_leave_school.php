<?php
// Leave school box. Needs $leaveRequest, $leaveFor, $leaveName and $csrfField
// With no request, or a declined one, it shows the Danger Zone
// A waiting request is answered by the {parent} on the Approvals page
// Once approved, the account closes on the leaving day
$leave    = $leaveRequest;
$isParent = $leaveFor === 'parent';
$leaveOn  = $leave === null ? '' : date(country('date_format'), strtotime($leave['leaving_on']));
?>
<div class="c-leave-school">
  <?php if (($leave['status'] ?? '') === 'approved'): ?>
    <div class="c-banner c-banner--warning" role="note">
      <?= icon('alertTriangle', 18) ?>
      <p class="c-leave-school__text">
        <strong><?= e(($isParent ? "{$leaveName} leaves" : 'You leave') . " the " . strtolower(word('institution')) . " on {$leaveOn}") ?></strong>
        <?= e("({$leave['reason']}). This account closes that day: download " . (feature('certificates') ? 'the character certificate and ' : '') . 'any documents you need before then.') ?>
      </p>
    </div>
  <?php elseif (($leave['status'] ?? '') === 'parent'): ?>
    <div class="c-banner c-banner--info" role="note">
      <?= icon('clock', 18) ?>
      <p class="c-leave-school__text">
        <?= e($isParent ? "{$leaveName} asked to leave on {$leaveOn} ({$leave['reason']}). Answer it on Approvals." : words("Waiting for your {parent} to approve leaving on ") . "{$leaveOn} ({$leave['reason']}).") ?>
      </p>
      <?php if ($isParent): ?>
        <a class="c-btn c-btn--outline c-btn--small" href="/parent/approvals">Open Approvals</a>
      <?php else: ?>
        <form method="post" action="/student/leaving/cancel" data-question-title="Cancel your leave request?" data-question-button="Cancel Request"
              data-question-text="<?= e(words('Your {parent} will no longer be asked.')) ?>">
          <?= $csrfField ?>
          <input type="hidden" name="id" value="<?= e($leave['id']) ?>">
          <button type="submit" class="c-btn c-btn--outline c-btn--small">Cancel Request</button>
        </form>
      <?php endif; ?>
    </div>
  <?php else: ?>
    <?php if (($leave['status'] ?? '') === 'declined'): ?>
      <div class="c-banner c-banner--error" role="note">
        <?= icon('message', 18) ?>
        <p class="c-leave-school__text"><?= e(words('Leaving on ') . "{$leaveOn} was declined" . ($leave['parent_note'] ? ": {$leave['parent_note']}" : '.')) ?></p>
      </div>
    <?php endif; ?>
    <?php
    $dangerZone = [
        'text'   => words($isParent
            ? 'Tell the {institution} your child is leaving: the date and why. Their records are kept; the account closes on that day.'
            : 'Ask to leave the {institution}: your {parent} approves it first. Your records are kept; the account closes on that day.'),
        'button' => 'Leave ' . word('institution'),
        'popUp'  => 'j-leave-school',
    ];
    require __DIR__ . '/_danger_zone.php';
    ?>
  