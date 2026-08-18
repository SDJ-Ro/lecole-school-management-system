<?php
// A form that fills the whole page. A form in a pop-up uses _pop_up.php instead
// Needs $formCardBack, $formCardTone, $formCardTitle, $formCardSubtitle and $formCardContent, which are cleared at the end
// $formCardContent is the form's HTML, built between ob_start and ob_get_clean
?>
<div class="c-form-card">
  <a class="c-btn c-btn--back" href="<?= e($formCardBack) ?>"><?= icon('arrowLeft', 16) ?><span>Back</span></a>

  <section class="c-form-card__box">
    <header class="c-form-card__header c-form-card__header--<?= e($formCardTone) ?>">
      <h2 class="c-form-card__title"><?= e($formCardTitle) ?></h2>
      <?php if ($formCardSubtitle !== ''): ?>
        <p class="c-form-card__subtitle"><?= e($formCardSubtitle) ?></p>
      <?php endif; ?>
    </header>

    <?= $formCardContent ?>
  </section>
</div>
<?php unset($formCardBack, $formCardTone, $formCardTitle, $formCardSubtitle, $formCardContent); ?>
