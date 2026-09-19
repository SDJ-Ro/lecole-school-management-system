<?php
// The Academic Year cards for this year and next. Needs $schoolYear
// If next year is not saved yet, it shows the usual dates with a warning to check them
$yearTags  = ['Current' => 'sky', 'Next' => 'sand'];
$stateTags = ['Finished' => 'grey', 'Now' => 'moss', 'Coming' => 'sky', 'Usual' => 'sand'];
$dateText  = fn (string $date): string => date(country('date_format'), strtotime($date));
?>
<div class="l-stage-grid">
  <?php foreach ($schoolYear['years'] as $year => $yearCard): ?>
    <article class="c-card c-school-year">
      <div class="c-school-year__head">
        <h3 class="c-panel__title"><?= e((string) $year) ?></h3>
        <span class="c-tag c-tag--round c-tag--<?= e($yearTags[$yearCard['label']]) ?>"><?= e($yearCard['label']) ?></span>
      </div>

      <?php if ($yearCard['usual']): ?>
        <p class="c-banner c-banner--warning"><?= icon('alertTriangle', 16) ?><span><?= e(words('Filled in from the usual dates because none were typed: please check them.')) ?></span></p>
      <?php elseif ($yearCard['suggested']): ?>
        <p class="c-school-year__empty"><?= e(words("The usual dates, not saved yet: Edit Dates → Save keeps them or changes them. If nobody does, they are saved by themselves when this year's last {term} ends.")) ?></p>
      <?php endif; ?>

      <?php if (!$yearCard['set']): ?>
        <p class="c-school-year__empty"><?= e(words('No {term} dates yet.')) ?></p>
      <?php else: ?>
        <?php foreach ($yearCard['terms'] as $number => $term): ?>
          <div class="c-school-year__term">
            <span class="c-label"><?= e(word('term') . " {$number}") ?></span>
            <?php if ($term['state'] === null): ?>
              <?php // Happens when a term was added after this year was saved ?>
              <span class="c-school-year__dates c-school-year__dates--none">No dates yet</span>
            <?php else: ?>
              <span class="c-school-year__dates"><?= e($dateText($term['starts_on']) . ' – ' . $dateText($term['ends_on'])) ?></span>
              <span class="c-tag c-tag--round c-tag--<?= e($stateTags[$term['state']]) ?>"><?= e($term['state']) ?></span>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </article>
  <?php endforeach; ?>
</div>

<?php if ($schoolYear['past'] !== []): ?>
  <div class="c-school-year__more">
    <button type="button" class="c-btn c-btn--ghost c-btn--small" data-pop-up-open="j-past-years"><?= icon('calendar', 13) ?>View All Years</button>
  </div>
<?php endif; ?>
<?php unset($yearTags, $stateTags, $dateText, $year, $yearCard, $number, $term); ?>
