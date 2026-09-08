<?php
// The admin's Settings page. It is one form, like My Profile
// Leaving a box empty brings back the default, which is shown as its placeholder
$title    = 'Settings';
$subtitle = "Your organisation's identity, contact details and terminology. Clear a field to restore its default.";
ob_start();
?>
<button type="button" class="c-btn c-btn--pill c-btn--sky j-edit-toggle" data-edit-label="Edit Settings" aria-pressed="<?= $editing ? 'true' : 'false' ?>">
  <?= icon('edit', 14) ?>
  <span><?= $editing ? 'Cancel' : 'Edit Settings' ?></span>
</button>
<?php $headerContent = ob_get_clean(); ?>
<div class="j-edit-page" data-editing="<?= $editing ? 'true' : 'false' ?>">
  <?php require __DIR__ . '/_page_header.php'; ?>

  <form class="l-settings-grid c-fields--sand j-edit-form" method="post" action="<?= e("/{$currentRole}/settings") ?>" enctype="multipart/form-data"
        novalidate data-warn-unsaved>
    <?= $csrfField ?>
    <?php if ($error !== null): ?>
      <p class="c-banner c-banner--error" role="alert"><?= e($error) ?></p>
    <?php endif; ?>
