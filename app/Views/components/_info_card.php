<?php
// One detail card, which can also be edited. Needs $card, $infoCardForm and $infoCardVariant
// While a parent element has data-editing set, CSS swaps the value for its input boxes
// A card that edits two fields, like first and last name, gets one box for each
// A text box is sent with $infoCardForm, but a date or choice box must sit inside its form
$infoCardClasses = 'c-info-card'
    . ($card['wide'] ? ' c-info-card--wide' : '')
    . ($card['edit'] !== null ? ' c-info-card--editable' : '')
    . (!empty($card['editOnly']) ? ' c-info-card--edit-only' : '')
    . ($infoCardVariant !== '' ? " c-info-card--{$infoCardVariant}" : '');
?>
<div class="<?= e($infoCardClasses) ?>">
  <p class="c-label c-info-card__label"><?= $card['icon'] !== null ? icon($card['icon'], 14) : '' ?><?= e($card['label']) ?></p>
  <p class="c-info-card__value"><?= e($card['value']) ?></p>
  <?php if ($card['edit'] !== null): ?>
    <div class="c-info-card__box">
      <?php
      $infoCardNames = explode(',', $card['edit']);

      foreach ($infoCardNames as $infoCardIndex => $infoCardField)
      {
          $fieldBox        = [
              'name'    => $infoCardField,
              'box'     => $card['box'] ?? 'text',
              'value'       => count($infoCardNames) > 1 ? $card['raw'][$infoCardIndex] : $card['raw'],
              'label'       => count($infoCardNames) > 1 ? ucfirst(str_replace('_', ' ', $infoCardField)) : $card['label'],
              'options'     => $card['options'] ?? [],
              'placeholder' => count($infoCardNames) > 1 ? ($card['placeholder'][$infoCardIndex] ?? '') : ($card['placeholder'] ?? ''),
              'minAge'      => $card['minAge'] ?? '',
              'maxAge'      => $card['maxAge'] ?? '',
          ];
          $fieldBoxVariant = 'card';
          $fieldBoxForm    = $infoCardForm;
          require __DIR__ . '/_field_box.php';
      }
      ?>
    </div>
  <?php endif; ?>
</div>
<?php unset($infoCardClasses, $infoCardNames, $infoCardIndex, $infoCardField, $fieldBoxVariant, $fieldBoxForm); ?>
