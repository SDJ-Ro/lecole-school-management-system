<?php
// The frame every pop-up shares. Build the content with ob_start(), put it in $popUpContent, then require this file
// Needs $popUpId. A plain pop-up brings its own header and must give its heading the id ending in -title
// Set $popUpOpenOnLoad when a form came back with an error, so the pop-up opens again
$pId      = $popUpId;
$pClasses = 'c-pop-up'
          . (($popUpSize ?? 'normal') !== 'normal' ? " c-pop-up--{$popUpSize}" : '')
          . (isset($popUpVariant) ? ' c-pop-up--' . $popUpVariant : '');
?>

<dialog class="<?= e($pClasses) ?>" id="<?= e($pId) ?>" aria-labelledby="<?= e($pId) ?>-title"<?= empty($popUpOpenOnLoad) ? '' : ' data-open-on-load' ?>>
  <?php if (($popUpShape ?? 'panel') === 'panel'): ?>
    <header class="c-pop-up__header">
      <div class="c-pop-up__heading-group">
        <?php if (isset($popUpIcon)): ?>
          <span class="c-pop-up__icon-badge" aria-hidden="true">
            <?= icon($popUpIcon, 20) ?>
          </span>
        <?php endif; ?>
        <div>
          <p class="c-label c-pop-up__eyebrow" id="<?= e($pId) ?>-eyebrow"><?= e($popUpEyebrow ?? '') ?></p>
          <h2 class="c-pop-up__title" id="<?= e($pId) ?>-title"><?= e($popUpTitle ?? '') ?></h2>
          <p class="c-pop-up__description" id="<?= e($pId) ?>-description"><?= e($popUpDescription ?? '') ?></p>
        </div>
      </div>
      <button type="button" class="c-btn c-btn--close j-pop-up-close" aria-label="Close">
        <?= icon('close', 16) ?>
      </button>
    </header>
  <?php endif; ?>

  <?= $popUpContent ?>
</dialog>
<?php unset($popUpShape, $popUpId, $popUpTitle, $popUpIcon, $popUpEyebrow, $popUpDescription, $popUpSize, $popUpVariant, $popUpContent, $popUpOpenOnLoad); ?>
