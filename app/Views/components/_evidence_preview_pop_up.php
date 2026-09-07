<?php
// Evidence preview pop-up. Needs $evidenceId, $evidenceTitle, $evidenceFile and $evidenceLine
// A button with data-pop-up-open set to $evidenceId opens it
// Optional $evidenceUrl shows the file inside, and $evidenceImage says if it is a picture or a PDF
// Optional $evidenceDetails adds a list of labels and values
ob_start();
?>
<header class="c-evidence__header">
  <h2 class="c-pop-up__title c-evidence__title" id="<?= e($evidenceId) ?>-title"><?= e($evidenceTitle) ?></h2>
  <button type="button" class="c-btn c-btn--close j-pop-up-close" aria-label="Close"><?= icon('close', 16) ?></button>
</header>
<div class="c-evidence__body">
  <span class="c-evidence__icon"><?= icon('fileText', 32) ?></span>
  <div class="c-evidence__file">
    <h3 class="c-evidence__file-name"><?= e($evidenceFile) ?></h3>
    <p class="c-evidence__file-title"><?= e($evidenceLine) ?></p>
  </div>
  <?php if (isset($evidenceUrl)): ?>
    <?php if ($evidenceImage): ?>
      <img class="c-evidence__frame" src="<?= e($evidenceUrl) ?>" alt="<?= e($evidenceFile) ?>" loading="lazy">
    <?php else: ?>
      <iframe class="c-evidence__frame" src="<?= e($evidenceUrl) ?>" title="<?= e($evidenceFile) ?>" loading="lazy"></iframe>
    <?php endif; ?>
    <a class="c-btn c-btn--link" href="<?= e($evidenceUrl) ?>" target="_blank" rel="noopener">Open in New Tab</a>
  <?php endif; ?>
  <?php if (!empty($evidenceDetails)): ?>
    <div class="c-evidence__details">
      <?php foreach ($evidenceDetails as $evidenceLabel => $evidenceValue): ?>
        <p><strong><?= e($evidenceLabel) ?>:</strong> <?= e($evidenceValue) ?></p>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
<footer class="c-pop-up__footer">
  <button type="button" class="c-btn c-btn--ghost c-evidence__close j-pop-up-close">Close Preview</button>
</footer>
<?php
$popUpContent = ob_get_clean();
$popUpShape   = 'plain';
$popUpId      = $evidenceId;
$popUpSize    = 'wide';
$popUpVariant = 'evidence';
require __DIR__ . '/_pop_up.php';
unset($evidenceId, $evidenceTitle, $evidenceFile, $evidenceLine, $evidenceUrl, $evidenceImage, $evidenceDetails, $evidenceLabel, $evidenceValue);
