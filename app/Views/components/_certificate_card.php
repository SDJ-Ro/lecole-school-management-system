<?php
// One certificate card. Needs $certificateCard and $certificateCardLink
?>
<a class="c-certificate-card c-certificate-card--<?= e($certificateCard['tone']) ?><?= $certificateCard['left'] ? ' c-certificate-card--left' : '' ?>"
   href="<?= e($certificateCardLink . '?student=' . rawurlencode($certificateCard['id'])) ?>"
   aria-label="<?= e("Open {$certificateCard['name']}'s character certificate") ?>">
  <span class="c-certificate-card__photo<?= $certificateCard['hasWaiting'] ? ' c-certificate-card__photo--waiting' : '' ?>">
    <span class="c-certificate-card__initials"><?= e(initials($certificateCard['name'])) ?></span>
  </span>
  <h3 class="c-certificate-card__name"><?= e($certificateCard['name']) ?></h3>
  <p class="c-certificate-card__line"><?= e($certificateCard['id']) ?></p>
  <p class="c-certificate-card__line"><?= e($certificateCard['class']) ?></p>
</a>
<?php unset($certificateCard, $certificateCardLink); ?>
