<?php
// Message banner. Scripts call showFeedbackBanner, which copies the template below
// Optional $feedbackMessage and $feedbackType show a message when the page loads, for example after a save
?>
<div class="c-feedback-banners" id="j-feedback-banners" aria-live="polite"<?php if (isset($feedbackMessage)): ?> data-message="<?= e($feedbackMessage) ?>" data-type="<?= e($feedbackType ?? 'success') ?>"<?php endif; ?>></div>
<template id="j-feedback-banner">
  <div class="c-feedback-banner" role="alert">
    <span class="c-feedback-banner__icon"><?= icon('check', 18) ?></span>
    <p class="c-feedback-banner__text"></p>
    <button type="button" class="c-btn c-btn--close j-feedback-close" aria-label="Dismiss notification"><?= icon('close', 16) ?></button>
  </div>
</template>
<?php unset($feedbackMessage, $feedbackType); ?>
