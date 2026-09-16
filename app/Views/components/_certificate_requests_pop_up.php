<?php
// Pop-up with every request. Needs $requests and $requestsStaff
// $requestsStaff is empty when the list is read only
ob_start();
?>
<div class="c-pop-up__body c-requests">
  <?php foreach (['copy' => 'Certificate Requests', 'record' => 'Missing Records'] as $requestsKind => $requestsHeading): ?>
    <?php if ($requests[$requestsKind] !== []): ?>
      <section class="c-requests__section">
        <h3 class="c-label c-requests__heading"><?= e($requestsHeading) ?></h3>
        <?php foreach ($requests[$requestsKind] as $requestCard): ?>
          <?php
          $requestKind  = $requestsKind;
          $requestStaff = $requestsStaff;
          require __DIR__ . '/_certificate_request_card.php';
          ?>
        <?php endforeach; ?>
      </section>
    <?php endif; ?>
  <?php endforeach; ?>

  <?php if ($requests['copy'] === [] && $requests['record'] === []): ?>
    <div class="c-empty-box c-empty-box--titled">
      <?= icon('message', 32) ?>
      <p class="c-empty-box__text">No requests submitted.</p>
    </div>
  <?php endif; ?>
</div>
<?php
$popUpContent = ob_get_clean();
$popUpId      = 'j-certificate-requests';
$popUpTitle   = $requestsStaff === null ? 'All Requests' : words('{Student} Requests');
$popUpVariant = 'requests';
require __DIR__ . '/_pop_up.php';

if ($requestsStaff !== null)
{
    $reasonBox = ['id' => 'j-copy-reason', 'label' => 'Note', 'required' => true, 'placeholder' => words('Why it is rejected (the {student} sees this)…')];
    require __DIR__ . '/_reason_template.php';
}
unset($requests, $requestsStaff, $requestsKind, $requestsHeading);
