<?php
// Only one request may wait at a time. Needs $csrfField
ob_start();
?>
<form class="c-pop-up__form" method="post" action="/student/certificates/request">
  <?= $csrfField ?>
  <div class="c-pop-up__body">
    <div class="c-field">
      <span class="c-label c-field__label">Purpose <span class="c-field__required c-field__required--terracotta">*</span></span>
      <?php
      $dropdownId    = 'j-certificate-purpose';
      $dropdownLabel = 'Purpose';
      $name          = 'purpose';
      $options       = config('certificates.purposes');
      $placeholder   = 'Select a purpose…';
      $required      = 'Please select a purpose.';
      require __DIR__ . '/_dropdown.php';
      ?>
    </div>
