<?php
// The requests panel. Needs $requests, $myRequestsVariant, and $myRequestsIssued for students
// It shows the first 3 of each kind, and View All opens the rest
// With nothing to show there is no panel
// Parents can only read it
// Students see the Submit button greyed out once the certificate is issued
$panelAsk     = feature('achievements');
$panelGroups  = ['record' => 'Missing Records', 'copy' => 'Certificate Requests'];
$panelAll     = [...$requests['record'], ...$requests['copy']];
$panelWaiting = count(array_filter($panelAll, fn (array $card): bool => $card['status'] === 'pending'));
?>
<?php if ($panelAsk || $panelAll !== []): ?>
  <aside class="c-card c-my-requests">
    <?php if ($panelAsk): ?>
      <h2 class="c-panel__title c-my-requests__title">Something missing?</h2>
      <?php if ($myRequestsVariant === 'student' && ($myRequestsIssued ?? false)): ?>
        <p class="c-my-requests__text">Your certificate is already issued. If something is missing, please ask the office.</p>
        <button type="button" class="c-btn c-btn--solid c-btn--large c-my-requests__submit" disabled>Submit Missing Record Request</button>
      <?php elseif ($myRequestsVariant === 'student'): ?>
        <p class="c-my-requests__text"><?= e(words("If an achievement or position isn't appearing, send a request: your {Class} {Teacher} or the {teacher} in charge will check it.")) ?></p>
        <button type="button" class="c-btn c-btn--solid c-btn--large c-my-requests__submit" data-pop-up-open="j-missing-record">Submit Missing Record Request</button>
      <?php else: ?>
        <p class="c-my-requests__text">If an achievement or position isn't appearing, your child can send a request from their account.</p>
      <?php endif; ?>
    <?php endif; ?>
