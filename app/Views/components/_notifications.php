<?php
// Shows the two newest unread notifications. View All opens the rest in a pop-up
// Needs $notifications, $currentRole and $csrfField
$notificationList  = $notifications ?? [];
$notificationCount = count($notificationList);
$notificationPill  = "{$notificationCount} new";   // The CSS shows it in capitals
?>
<section class="c-panel c-notifications-card">
  <div class="c-panel__head">
    <h2 class="c-panel__title c-notifications-card__title">
      <span class="c-notifications-card__bell" aria-hidden="true"><?= icon('bell', 18) ?></span>
      <span>Notifications</span>
    </h2>
    <div class="c-notifications-card__actions">
      <span class="c-tag c-tag--round c-tag--cherry"><?= e($notificationPill) ?></span>
      <button type="button" class="c-label c-notifications-card__view-all" data-pop-up-open="j-notifications-pop-up" aria-label="View all notifications">View All</button>
    </div>
  </div>

  <div class="c-notifications-card__list">
    <?php foreach (array_slice($notificationList, 0, 2) as $notification): ?>
      <a class="c-notifications-card__item" href="<?= e($notification['link']) ?>">
        <h3 class="c-notifications-card__item-title"><?= e($notification['title']) ?></h3>
        <p class="c-notifications-card__item-text"><?= e($notification['text']) ?></p>
      </a>
    <?php endforeach; ?>

    <?php if ($notificationCount <= 1): ?>
      <div class="c-notifications-card__empty">
        <h3 class="c-notifications-card__empty-title">Nothing else new</h3>
        <p class="c-notifications-card__empty-text">You are up to date.</p>
      </div>
    <?php endif; ?>
  </div>
</section>

