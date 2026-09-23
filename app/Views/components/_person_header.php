<?php
// A person's header in their role's colour. Needs $header and $headerOnPage
// In the pop-up it also gets a close button
?>
<header class="c-person__header c-person__header--<?= e($header['tone']) ?><?= $headerOnPage ? ' c-person__header--page' : '' ?>">
  <?php if ($header['photo'] !== null): ?>
    <img class="c-avatar c-avatar--medium" src="<?= e($header['photo']) ?>" alt="">
  <?php else: ?>
    <span class="c-avatar c-avatar--medium c-avatar--<?= e($header['tone']) ?>" aria-hidden="true"><?= e(initials($header['name'])) ?></span>
  <?php endif; ?>
  <div class="c-person__who">
    <p class="c-label c-person__eyebrow"><?= e($header['eyebrow']) ?></p>
    <h2 class="c-pop-up__title" id="j-person-profile-title"><?= e($header['name']) ?></h2>
    <?php if ($header['sub'] !== ''): ?>
      <p class="c-person__sub"><?= e($header['sub']) ?></p>
    <?php endif; ?>
    <div class="c-person__tags">
      <span class="c-tag c-tag--sky"><?= e($header['code']) ?></span>
      <span class="c-tag c-tag--<?= e($header['status'][1]) ?>"><?= e($header['status'][0]) ?></span>
    </div>
  </div>
  <?php if (!$headerOnPage): ?>
    <button type="button" class="c-btn c-btn--close j-pop-up-close" aria-label="Close"><?= icon('close', 16) ?></button>
  <?php endif; ?>
</header>
<?php unset($headerOnPage); ?>
