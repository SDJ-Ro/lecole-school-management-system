<?php
// A person's information as sections of small cards. Needs $sections and $infoCardForm
?>
<?php foreach ($sections as $section): ?>
  <section class="c-person__section">
    <h3 class="c-person__section-title"><?= icon($section['icon'], 16) ?><?= e($section['title']) ?></h3>
    <div class="c-info-card-grid c-info-card-grid--<?= $section['columns'] === 4 ? 'four' : 'two' ?>">
      <?php
      $infoCardVariant = 'rounded';
      foreach ($section['cards'] as $card)
      {
          require __DIR__ . '/_info_card.php';
      }
      ?>
    </div>
  </section>
<?php endforeach; ?>
<?php unset($section, $card, $infoCardVariant); ?>
