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

    <?php foreach ($sections as $section): ?>
      <section class="c-panel">
        <?php
        $sectionHeader = $section['header'];
        require __DIR__ . '/_section_header.php';
        ?>
        <div class="c-info-card-grid">
          <?php foreach ($section['cards'] as $card): ?>
            <?php
            $infoCardForm    = '';
            $infoCardVariant = 'cream';
            require __DIR__ . '/_info_card.php';
            ?>
          <?php endforeach; ?>

          <?php if ($section['logo']): ?>
            <div class="c-settings__logo-row">
              <?php if ($section['beside'] !== null): ?>
                <?php
                $card            = $section['beside'];
                $infoCardForm    = '';
                $infoCardVariant = 'cream';
                require __DIR__ . '/_info_card.php';
                ?>
              <?php endif; ?>
              <div class="c-info-card c-info-card--cream c-settings__logo">
                <p class="c-label c-info-card__label"><?= icon('imagePlus', 14) ?>Logo</p>
                <img class="c-settings__logo-image" src="<?= e($logo['now']) ?>" alt="The logo in use">
                <button type="button" class="c-btn c-btn--outline c-settings__logo-change" data-pop-up-open="j-logo-pop-up">Change Logo</button>
              </div>
            </div>
          <?php endif; ?>
        </div>
      </section>
    <?php endforeach; ?>

    <?php
    // The Change Logo pop-up sits inside this form, so the chosen file is sent with Save Changes
    // Done only closes the pop-up
    ob_start();
    ?>
    <div class="c-pop-up__form">
      <div class="c-pop-up__body">
        <?php
        $fileBoxName     = 'logo';
        $fileBoxRequired = false;
        $fileBoxTypes    = $logo['types'];
        $fileBoxKb       = $logo['kb'];
        require __DIR__ . '/_file_box.php';
        ?>
        <?php if ($logo['own']): ?>
          <label class="c-field__choice">
            <input type="checkbox" class="c-field__checkbox" name="logo_default" value="1">
            Use the default logo
          </label>
        <?php endif; ?>
      </div>
      <footer class="c-pop-up__footer">
        <button type="button" class="c-btn c-btn--solid j-pop-up-close">Done</button>
      </footer>
    </div>
    <?php
    $popUpContent     = ob_get_clean();
    $popUpId          = 'j-logo-pop-up';
    $popUpTitle       = 'Change Logo';
    $popUpIcon        = 'imagePlus';
    $popUpDescription = 'The new logo is saved with Save Changes.';
    require __DIR__ . '/_pop_up.php';
    ?>

    <div class="c-settings__actions">
      <button type="reset" class="c-btn c-btn--ghost">Cancel</button>
      <button type="submit" class="c-btn c-btn--solid"><?= icon('check', 14) ?> Save Changes</button>
    </div>
  </form>
</div>
<?php unset($section, $card); ?>
