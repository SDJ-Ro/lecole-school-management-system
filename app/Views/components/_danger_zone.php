<?php
// Red box with one risky action. Needs $dangerZone and $csrfField
// The button either opens a confirm question with its own form, or opens the pop-up named in popUp
// $dangerZone is cleared at the end
?>
<section class="c-danger-zone">
  <div>
    <h3 class="c-danger-zone__title"><?= icon('trash', 18) ?>Danger Zone</h3>
    <p class="c-danger-zone__text"><?= e($dangerZone['text']) ?></p>
  </div>
  <?php if (isset($dangerZone['popUp'])): ?>
    <button type="button" class="c-btn c-btn--maroon" data-pop-up-open="<?= e($dangerZone['popUp']) ?>"><?= e($dangerZone['button']) ?></button>
  <?php else: ?>
    <form method="post" action="<?= e($dangerZone['action']) ?>"
          data-question-title="<?= e($dangerZone['question']) ?>" data-question-button="<?= e($dangerZone['button']) ?>" data-question-text="<?= e($dangerZone['text']) ?>">
      <?= $csrfField ?>
      <?php foreach ($dangerZone['hidden'] as $dangerName => $dangerValue): ?>
        <input type="hidden" name="<?= e($dangerName) ?>" value="<?= e($dangerValue) ?>">
      <?php endforeach; ?>
      <button type="submit" class="c-btn c-btn--maroon"><?= e($dangerZone['button']) ?></button>
    </form>
  <?php endif; ?>
</section>
<?php unset($dangerZone, $dangerName, $dangerValue); ?>
