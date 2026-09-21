<?php
// One result in the parent search. Clicking it picks that parent. Needs $parentRow
?>
<button type="button" class="c-parent-row j-parent-pick" data-id="<?= e($parentRow['id']) ?>">
  <span class="c-avatar c-avatar--row c-avatar--terracotta" aria-hidden="true"><?= e(initials($parentRow['full_name'])) ?></span>
  <span class="c-parent-row__text">
    <span class="c-parent-row__top">
      <span class="c-parent-row__name"><?= e($parentRow['full_name']) ?></span>
      <span class="c-tag c-tag--terracotta"><?= e($parentRow['code']) ?></span>
    </span>
    <span class="c-parent-row__meta"><?= e(implode(' · ', array_filter([$parentRow['relationship'], $parentRow['phone'], $parentRow['identifier']]))) ?></span>
    <?php if ($parentRow['children'] !== null): ?>
      <span class="c-parent-row__children"><?= e('Siblings: ' . $parentRow['children']) ?></span>
    <?php endif; ?>
  </span>
  <span class="c-parent-row__select"><?= e('Select ' . word('parent')) ?></span>
</button>
<?php unset($parentRow); ?>
