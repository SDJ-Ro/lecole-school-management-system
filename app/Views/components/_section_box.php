<?php
// A big section with a tinted header, a title and one button
// The page jumps back to $sectionId after a save
?>
<section class="c-card c-section-box c-section-box--<?= e($sectionTone) ?>" id="<?= e($sectionId) ?>">
  <div class="c-section-box__head">
    <div class="c-section-box__heading">
      <span class="c-section-box__icon" aria-hidden="true"><?= icon($sectionIcon, 18) ?></span>
      <h2 class="c-panel__title"><?= e($sectionTitle) ?></h2>
    </div>
    <button type="button" class="c-btn c-btn--small c-section-box__button"
      <?php foreach ($sectionButton['data'] as $key => $value): ?> data-<?= e($key) ?>="<?= e($value) ?>"<?php endforeach; ?>>
      <?= icon($sectionButton['icon'] ?? 'plus', 13) ?><?= e($sectionButton['label']) ?>
    </button>
  </div>
  <div class="c-section-box__body">
    <?= $sectionContent ?>
  </div>
</section>
<?php unset($sectionId, $sectionTone, $sectionIcon, $sectionTitle, $sectionButton, $sectionContent); ?>
