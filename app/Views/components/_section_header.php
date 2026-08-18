<?php
// A section's top row with an icon, title, subtitle and an optional button. Needs $sectionHeader
?>
<div class="c-panel__head">
  <div class="c-section-header">
    <span class="c-section-header__icon<?= $sectionHeader['tone'] !== '' ? " c-section-header__icon--{$sectionHeader['tone']}" : '' ?>"><?= icon($sectionHeader['icon'], 15) ?></span>
    <div>
      <h2 class="c-panel__title"><?= e($sectionHeader['title']) ?></h2>
      <p class="c-section-header__subtitle"><?= e($sectionHeader['subtitle']) ?></p>
    </div>
  </div>
  <?= $sectionHeaderButton ?? '' ?>
</div>
<?php unset($sectionHeader, $sectionHeaderButton); ?>
