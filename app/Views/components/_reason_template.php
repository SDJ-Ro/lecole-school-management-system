<?php
// A reason box that the question pop-up copies in when something is turned down. Needs $reasonBox
// The form points to it with its data-question-extra attribute
?>
<template id="<?= e($reasonBox['id']) ?>">
  <label class="c-field c-question__field">
    <span class="c-label c-field__label"><?= e($reasonBox['label']) ?></span>
    <textarea class="c-field__input c-field__input--area" name="note" rows="3" maxlength="255"<?= $reasonBox['required'] ? ' required' : '' ?>
              placeholder="<?= e($reasonBox['placeholder']) ?>"></textarea>
  </label>
</template>
<?php unset($reasonBox); ?>
