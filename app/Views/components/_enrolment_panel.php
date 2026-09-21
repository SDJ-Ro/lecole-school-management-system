<?php
// Enrolment panel for the teacher in charge. Needs $programme
// It only lists join requests a parent has already approved
$requests = $programme['joinRequests'];
$metrics  = [
    ['color' => 'sand',      'icon' => 'users',  'value' => (string) count($requests),                  'label' => 'Pending Join Requests'],
    ['color' => 'lightblue', 'icon' => 'check',  'value' => (string) $programme['enrolment']['members'],  'label' => 'Members'],
    ['color' => 'maroon',    'icon' => 'trophy', 'value' => (string) $programme['enrolment']['capacity'], 'label' => 'Capacity Per Age Group'],
];
?>
<section class="c-card c-programme-panel">
  <header class="c-programme-panel__head">
    <div>
      <h2 class="c-panel__title c-programme-panel__title"><span class="c-programme-panel__icon c-programme-panel__icon--boxed"><?= icon('users', 20) ?></span>Enrollment Processing</h2>
      <p class="c-programme-panel__line"><?= e("{$programme['name']} · " . words('{Students} cannot be added without confirmed {parent} approval.')) ?></p>
    </div>
    <span class="c-tag c-tag--linen">Faculty Moderation</span>
  </header>

  <div class="l-metric-cards-grid l-metric-cards-grid--three">
    <?php foreach ($metrics as $card): ?>
      <?php require __DIR__ . '/_metric_card.php'; ?>
    <?php endforeach; ?>
  </div>

  <?php if ($requests === []): ?>
    <div class="c-empty-box c-empty-box--tinted">
      <p class="c-empty-box__text">All enrollment requests processed.</p>
    </div>
  <?php else: ?>
    <div class="c-join-requests">
      <?php foreach ($requests as $request): ?>
        <?php require __DIR__ . '/_join_request_card.php'; ?>
      <?php endforeach; ?>
    </div>
    <?php
    $reasonBox = ['id' => 'j-reason', 'label' => 'Rejection Feedback', 'placeholder' => 'Explain why this was rejected…', 'required' => true];
    require __DIR__ . '/_reason_template.php';
    ?>
  <?php endif; ?>
</section>
<?php unset($requests, $metrics, $card, $request); ?>
