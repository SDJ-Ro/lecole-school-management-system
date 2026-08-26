<?php
// A page's title, subtitle and optional + button. Needs $title
// $headerButton either links to a page with href or opens a pop-up with popUp
?>
<header class="c-page-header">
  <div class="c-page-header__meta">
    <h1 class="c-page-header__title"><?= e($title) ?></h1>
    <?php if (!empty($subtitle)): ?>
      <p class="c-page-header__subtitle"><?= e($subtitle) ?></p>
    <?php endif; ?>
  </div>

  <?php if (isset($headerButton['href'])): ?>
    <a class="c-btn c-btn--pill c-btn--sky" href="<?= e($headerButton['href']) ?>">
      <?= icon('plus') ?>
      <span><?= e($headerButton['label']) ?></span>
    </a>
  <?php elseif (isset($headerButton)): ?>
    <button type="button" class="c-btn c-btn--pill c-btn--sky" data-pop-up-open="<?= e($headerButton['popUp']) ?>">
      <?= icon('plus') ?>
      <span><?= e($headerButton['label']) ?></span>
    </button>
  <?php endif; ?>

  <?= $headerContent ?? '' ?>
</header>
<?php unset($title, $subtitle, $headerButton, $headerContent); ?>
