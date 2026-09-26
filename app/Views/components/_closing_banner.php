<?php
// Banner that warns an account is about to close. Needs $closingBanner
// The error page does not set it, so nothing is drawn there
$closingBanner ??= null;
?>
<?php if ($closingBanner !== null): ?>
  <div class="c-banner c-banner--<?= $closingBanner['red'] ? 'error' : 'warning' ?> c-closing-banner" role="status">
    <?= icon('logOut', 16) ?>
    <span class="c-closing-banner__text"><?= e($closingBanner['text']) ?></span>
    <?php if ($closingBanner['download'] !== null): ?>
      <a class="c-btn c-btn--outline c-btn--small" href="<?= e($closingBanner['download']) ?>"><?= icon('download', 13) ?>Download Certificate</a>
    <?php endif; ?>
  </div>
<?php endif; ?>
