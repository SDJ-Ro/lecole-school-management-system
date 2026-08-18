<?php
// A password box with an eye button that shows or hides what was typed
// The box uses the class the page passes in, so it keeps that page's look
?>
<span class="c-password-field">
  <input class="<?= e($passwordClass) ?>" type="password" name="<?= e($passwordName) ?>"<?php if (isset($passwordId)): ?> id="<?= e($passwordId) ?>"<?php endif; ?>
         placeholder="<?= e($passwordPlaceholder) ?>" required autocomplete="<?= e($passwordAutocomplete) ?>">
  <button class="c-password-field__eye" type="button" aria-label="Show password"><?= icon('eye') ?></button>
</span>
<?php unset($passwordName, $passwordClass, $passwordPlaceholder, $passwordAutocomplete, $passwordId); ?>
