<?php
// A club's notices, for reading only. Needs $programme, $currentRole and $csrfField
?>
<section class="c-card c-programme-panel">
  <header class="c-programme-panel__head">
    <h2 class="c-panel__title c-programme-panel__title"><span class="c-programme-panel__icon c-programme-panel__icon--boxed"><?= icon('bell', 20) ?></span>Notice Board</h2>
  </header>

  <?php if ($programme['noticeCards'] === []): ?>
    <div class="c-empty-box">
      <p class="c-empty-box__text"><?= e("No recent notices posted for {$programme['name']}.") ?></p>
    </div>
  <?php else: ?>
    <div class="l-notice-grid">
      <?php foreach ($programme['noticeCards'] as $notice): ?>
        <?php
        $showActions = false;
        require __DIR__ . '/_notice_card.php';
        ?>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</section>
