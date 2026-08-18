<?php
// Picture upload, as a dashed box or as a row with a preview. Needs $imagePicker, which is cleared at the end
$pickerImage = $imagePicker['image'];
?>
<label class="c-image-picker c-image-picker--<?= e($imagePicker['variant']) ?>">
  <span class="c-image-picker__preview">
    <img class="c-image-picker__image" src="<?= e($pickerImage) ?>" alt=""<?= $pickerImage === '' ? ' hidden' : '' ?>>
    <span class="c-image-picker__empty<?= $imagePicker['variant'] === 'box' ? ' c-label' : '' ?>"<?= $pickerImage !== '' ? ' hidden' : '' ?>>
      <?php if ($imagePicker['variant'] === 'box'): ?><?= icon('imagePlus', 22) ?>Upload Cover Photo<?php else: ?>No cover photo selected<?php endif; ?>
    </span>
  </span>
  <?php if ($imagePicker['variant'] === 'row'): ?>
    <span class="c-image-picker__side">
      <span class="c-btn c-btn--ghost c-image-picker__button"><?= icon('imagePlus', 15) ?><?= e($imagePicker['label']) ?></span>
      <span class="c-image-picker__hint">Select an image file to display on the achievement card.</span>
    </span>
  <?php endif; ?>
  <input type="file" class="c-field__hidden-input" name="<?= e($imagePicker['name']) ?>" accept="<?= e(accept_types('cover')) ?>" aria-label="<?= e($imagePicker['label']) ?>" data-image-picker>
</label>
<?php unset($imagePicker, $pickerImage); ?>
