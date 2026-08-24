<?php
// Tick box for showing an award on the public honours board. Needs $honoursTicked
?>
<div class="c-field">
  <label class="c-field__choice">
    <input type="checkbox" class="c-field__checkbox" name="honours" value="1"<?= $honoursTicked ? ' checked' : '' ?>>
    Show on the public honours board
  </label>
  <p class="c-field__hint"><?= e('New ones go on by themselves at these levels: ' . implode(', ', rule('honours_board.auto_levels')) . '.') ?></p>
</div>
<?php unset($honoursTicked); ?>
