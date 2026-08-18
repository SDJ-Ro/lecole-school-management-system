<?php
// A grid of labelled fields. Needs $fieldGrid and $fieldGridTone, which are cleared at the end
?>
<div class="c-add-person__grid">
  <?php foreach ($fieldGrid as $fgBox): ?>
    <div class="c-field<?= $fgBox['wide'] ? ' c-add-person__wide' : '' ?>">
      <span class="c-label c-field__label"><?= e($fgBox['label']) ?><?php if ($fgBox['required']): ?> <span class="c-field__required c-field__required--<?= e($fieldGridTone) ?>">*</span><?php endif; ?></span>
      <?php
      $fieldBox        = $fgBox;
      $fieldBoxVariant = 'form';
      $fieldBoxTone    = $fieldGridTone;
      $fieldBoxForm    = '';
      require __DIR__ . '/_field_box.php';
      ?>
    </div>
  <?php endforeach; ?>
</div>
<?php unset($fieldGrid, $fieldGridTone, $fgBox, $fieldBoxVariant, $fieldBoxTone, $fieldBoxForm); ?>
