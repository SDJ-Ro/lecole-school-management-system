<?php
// app/Views/components/_metric_card.php
// Expects: $color (string), $icon (string), $value (string), $label (string), $delay (int), $valueId (string, optional)
?>
<div class="c-metric-card c-metric-card--<?= htmlspecialchars($color) ?>" style="animation-delay:<?= (int)$delay ?>ms">
  <div class="c-metric-card__top">
    <span class="c-metric-card__icon" aria-hidden="true"><?= $icon ?></span>
  </div>
  <p class="c-metric-card__value c-font-display"<?= !empty($valueId) ? ' id="' . htmlspecialchars($valueId) . '"' : '' ?>><?= htmlspecialchars($value) ?></p>
  <p class="c-metric-card__label"><?= htmlspecialchars($label) ?></p>
</div>
