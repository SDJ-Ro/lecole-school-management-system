<?php
// File upload box. Needs $fileBoxName, $fileBoxRequired, $fileBoxTypes and $fileBoxKb
// The caller puts the label above it
// $fileBoxKb is the largest file size, in KB
// Optional $fileBoxHint replaces the line under the box, which lists the types and size
$fbHint = $fileBoxHint ?? word_list($fileBoxTypes) . ', up to ' . round($fileBoxKb / 1024) . ' MB';
?>
<?php // The whole box is the input's label, so a click opens the chooser without a script ?>
<label class="c-field__file">
  <input type="file" class="c-field__hidden-input j-file-box" name="<?= e($fileBoxName) ?>"
         accept="<?= e(implode(',', array_keys($fileBoxTypes))) ?>"<?= $fileBoxRequired ? ' required' : '' ?>>
  <?= icon('upload', 28) ?>
  <span class="c-field__file-title"><strong>Click to upload</strong> or drag and drop</span>
  <span class="c-field__hint"><?= e($fbHint) ?></span>
  <span class="c-field__file-name j-file-box-name" hidden></span>
</label>
<?php unset($fileBoxName, $fileBoxRequired, $fileBoxTypes, $fileBoxKb, $fileBoxHint, $fbHint); ?>
