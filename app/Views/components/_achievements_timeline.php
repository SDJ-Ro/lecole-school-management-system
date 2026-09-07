<?php
// Achievements timeline, grouped by year. Needs $timeline and $timelineVariant
// Staff also pass $timelineStaff, which adds View Evidence, Edit and Delete to items they may edit
$timelineGroups = config('achievements.groups');
$staff          = $timelineStaff ?? null;
?>
<section class="c-timeline c-timeline--<?= e($timelineVariant) ?><?= $timelineVariant === 'panel' ? ' c-card' : '' ?> j-timeline" aria-labelledby="j-timeline-heading">
  <h2 class="c-panel__title c-timeline__heading" id="j-timeline-heading">Full Timeline</h2>

  <div class="c-timeline__filters" role="group" aria-label="Show">
    <button type="button" class="c-timeline__filter j-timeline-filter" data-group="all" aria-pressed="true">All</button>
    <?php foreach ($timelineGroups as $key => $group): ?>
      <button type="button" class="c-timeline__filter j-timeline-filter" data-group="<?= e($key) ?>" aria-pressed="false"><?= e($group['label']) ?></button>
    <?php endforeach; ?>
  </div>

  <?php foreach ($timeline as $year => $items): ?>
    <div class="c-timeline__year">
      <p class="c-timeline__year-label"><?= e($year) ?></p>
      <?php foreach ($items as $item): ?>
        <div class="c-timeline__item" data-group="<?= e($item['group']) ?>">
          <span class="c-timeline__marker" aria-hidden="true">
            <span class="c-timeline__dot"></span>
            <span class="c-timeline__line"></span>
          </span>
          <div class="c-timeline__card">
            <div class="c-timeline__header">
              <h3 class="c-timeline__title"><?= e($item['title']) ?></h3>
              <span class="c-tag c-tag--round c-tag--<?= e($timelineGroups[$item['group']]['tone']) ?>"><?= e($timelineGroups[$item['group']]['label']) ?></span>
              <?php if ($staff !== null && !empty($item['editable'])): ?>
                <?php $staffUrl = "/{$staff['role']}/achievements"; ?>
                <div class="c-timeline__actions">
                  <?php if ($item['evidence']): ?>
                    <a class="c-btn c-btn--icon" href="<?= e("{$staffUrl}/evidence?id={$item['id']}") ?>" target="_blank" rel="noopener"
                       aria-label="<?= e("View the evidence for {$item['title']}") ?>" title="View Evidence"><?= icon('fileText', 16) ?></a>
                  <?php endif; ?>
                  <a class="c-btn c-btn--icon" href="<?= e("{$staffUrl}?student=" . rawurlencode($staff['code']) . "&edit={$item['id']}") ?>"
                     aria-label="<?= e("Edit {$item['title']}") ?>" title="Edit"><?= icon('edit', 16) ?></a>
                  <form method="post" action="<?= e("{$staffUrl}/delete") ?>" data-question-title="<?= e("Delete '{$item['title']}'?") ?>"
                        data-question-text="<?= e(words('It goes from every {student} it belongs to, with its evidence. This cannot be undone.')) ?>"
                        data-question-button="Delete Achievement">
                    <?= $csrfField ?>
                    <input type="hidden" name="id" value="<?= e($item['id']) ?>">
                    <input type="hidden" name="student" value="<?= e($staff['code']) ?>">
                    <button type="submit" class="c-btn c-btn--icon c-timeline__delete" aria-label="<?= e("Delete {$item['title']}") ?>" title="Delete"><?= icon('trash', 16) ?></button>
                  </form>
                </div>
              <?php endif; ?>
            </div>
            <p class="c-timeline__date"><?= e($item['month']) ?></p>
            <?php if ($item['description'] !== ''): ?>
              <p class="c-timeline__description"><?= e($item['description']) ?></p>
            <?php endif; ?>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endforeach; ?>

  <p class="c-timeline__empty j-timeline-empty"<?= $timeline === [] ? '' : ' hidden' ?>>No achievements found in this category.</p>
</section>
<?php unset($timelineGroups, $timelineVariant, $timelineStaff, $staff, $staffUrl); ?>
