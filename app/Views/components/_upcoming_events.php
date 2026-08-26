<?php
// The next events this person can see, from today on. Needs $upcomingEvents
$eventList  = $upcomingEvents ?? [];
$eventCount = count($eventList);
?>
<section class="c-panel">
  <div class="c-panel__head">
    <h2 class="c-panel__title">Upcoming Events</h2>
    <?php if ($eventCount > 0): ?>
      <span class="c-tag c-tag--round c-tag--grey"><?= e($eventCount . ' ' . ($eventCount === 1 ? 'event' : 'events')) ?></span>
    <?php endif; ?>
  </div>

  <div class="c-events-list">
    <?php foreach ($eventList as $event): ?>
      <div class="c-event-row">
        <time class="c-event-row__date" datetime="<?= e($event['date']) ?>">
          <span class="c-event-row__day"><?= e($event['day']) ?></span>
          <span class="c-label c-event-row__month"><?= e($event['month']) ?></span>
        </time>
        <div>
          <h3 class="c-event-row__name"><?= e($event['name']) ?></h3>
          <span class="c-tag c-tag--<?= e($event['tagColor']) ?>"><?= e($event['tag']) ?></span>
        </div>
      </div>
    <?php endforeach; ?>

    <?php if ($eventCount === 0): ?>
      <p class="c-events-list__empty">No upcoming events.</p>
    <?php endif; ?>
  </div>
</section>
<?php unset($eventList, $eventCount, $event); ?>
