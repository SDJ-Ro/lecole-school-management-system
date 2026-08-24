<?php
// A button that opens a short list to pick from. Needs $pickMenu and $csrfField
// It is a details element, so it works without any script. Picking an option sends the form
$pickField = $pickMenu['field'] ?? 'choice';
?>
<details class="c-pick-menu c-pick-menu--<?= e($pickMenu['variant']) ?>">
  <summary class="c-pick-menu__button" title="<?= e($pickMenu['title']) ?>">
    <?php if ($pickMenu['variant'] === 'change'): ?><?= icon('edit', 11) ?><?php endif; ?>
    <span><?= e($pickMenu['label']) ?></span>
    <?php if ($pickMenu['variant'] !== 'change'): ?><?= icon('chevronDown', 13) ?><?php endif; ?>
  </summary>
  <form class="c-pick-menu__list" method="post" action="<?= e($pickMenu['action']) ?>" aria-label="<?= e($pickMenu['title']) ?>">
    <?= $csrfField ?>
    <?php foreach ($pickMenu['hidden'] ?? [] as $pickHidden => $pickHiddenValue): ?>
      <input type="hidden" name="<?= e($pickHidden) ?>" value="<?= e($pickHiddenValue) ?>">
    <?php endforeach; ?>
    <?php foreach ($pickMenu['options'] as $pickOption): ?>
      <?php [$pickValue, $pickLabel] = is_array($pickOption) ? [(string) $pickOption['value'], $pickOption['label']] : [$pickOption, $pickOption]; ?>
      <button type="submit" class="c-pick-menu__option" name="<?= e($pickField) ?>" value="<?= e($pickValue) ?>" aria-pressed="<?= $pickValue === (string) $pickMenu['chosen'] ? 'true' : 'false' ?>">
        <span><?= e($pickLabel) ?></span>
        <?php if ($pickMenu['variant'] === 'assign'): ?><?= icon('chevronRight', 12) ?><?php endif; ?>
      </button>
    <?php endforeach; ?>
  </form>
</details>
<?php unset($pickMenu, $pickField, $pickHidden, $pickHiddenValue, $pickOption, $pickValue, $pickLabel); ?>
