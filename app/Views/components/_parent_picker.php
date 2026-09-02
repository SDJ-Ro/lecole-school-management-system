<?php
// Search box for picking a registered parent. Needs $parentPicker
// The search runs on the server and the chosen parent's id goes in a hidden field
$ppChosen = $parentPicker['row'];
?>
<div class="c-parent-picker j-parent-picker" data-url="<?= e($parentPicker['url']) ?>">
  <input type="hidden" class="j-parent-id" name="<?= e($parentPicker['name']) ?>" value="<?= e($ppChosen['id'] ?? '') ?>">

  <div class="c-parent-picker__chosen j-parent-chosen"<?= $ppChosen === null ? ' hidden' : '' ?>>
    <?php
    if ($ppChosen !== null)
    {
        $parentRow = $ppChosen;
        require __DIR__ . '/_parent_row.php';
    }
    ?>
    <button type="button" class="c-btn c-btn--outline c-btn--small j-parent-change">Change <?= e(word('parent')) ?></button>
  </div>

  <div class="c-parent-picker__search j-parent-search"<?= $ppChosen !== null ? ' hidden' : '' ?>>
    <span class="c-label"><?= e(words('Search Registered {Parents}')) ?></span>
    <label class="c-search c-search--small">
      <?= icon('search', 14) ?>
      <input type="search" class="c-search__input j-parent-query" placeholder="<?= e(words('Name, code, email, phone or a {student}’s name…')) ?>"
             autocomplete="off" aria-label="<?= e(words('Search registered {parents}')) ?>">
    </label>
    <p class="c-field__hint j-parent-count">Searching…</p>
    <div class="c-parent-picker__results j-parent-results" aria-live="polite"></div>
  </div>
</div>
<?php unset($parentPicker, $ppChosen); ?>
