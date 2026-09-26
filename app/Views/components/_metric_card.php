<?php
// One metric card with a number. Needs $card, with the value already formatted
// A card with a link works as a filter, and is only filled in with colour while chosen
$cardTag     = isset($card['href']) ? 'a' : 'div';
$cardClasses = 'c-metric-card'
    . (isset($card['href']) ? ' c-metric-card--tab' : '')
    . (!isset($card['href']) || !empty($card['chosen']) ? " c-metric-card--{$card['color']}" : '');
?>
<<?= e($cardTag) ?> class="<?= e($cardClasses) ?>"<?php if (isset($card['href'])): ?> href="<?= e($card['href']) ?>"<?= !empty($card['chosen']) ? ' aria-current="page"' : '' ?><?php endif; ?>>
  <div class="c-metric-card__top">
    <span class="c-metric-card__icon" aria-hidden="true">
      <?= icon($card['icon'], 20) ?>
    </span>
  </div>
  <p class="c-metric-card__value"<?= isset($card['valueId']) ? ' id="' . e($card['valueId']) . '"' : '' ?>><?= e($card['value']) ?></p>
  <p class="c-label c-metric-card__label"><?= e($card['label']) ?></p>
</<?= e($cardTag) ?>>
<?php unset($card, $cardTag, $cardClasses); ?>
