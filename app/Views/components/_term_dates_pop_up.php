<?php
// The Edit Dates pop-up for this year's and next year's terms. Needs $schoolYear
// A date that is locked is shown as text and not sent. The server keeps it locked anyway
// Next year's boxes may stay empty
$dateText = fn (string $date): string => date(country('date_format'), strtotime($date));
ob_start();
?>
<form class="c-pop-up__form" method="post" action="<?= e("{$pageUrl}/terms/save") ?>" novalidate>
  <?= $csrfField ?>
  <div class="c-pop-up__body">
    <?php foreach ($schoolYear['years'] as $year => $yearCard): ?>
      <section class="c-field-section">
        <div>
          <h3 class="c-field-section__title"><?= e("{$year} · {$yearCard['label']}") ?></h3>
          <?php if ($yearCard['suggested']): ?>
            <p class="c-field-section__hint"><?= e(words('The usual dates are filled in: change any that differ, then Save. The year starts by itself on its {Term} 1.')) ?></p>
          <?php endif; ?>
        </div>

        <?php foreach ($yearCard['terms'] as $number => $term): ?>
          <div class="c-field-pair">
            <?php foreach (['start' => 'starts_on', 'end' => 'ends_on'] as $part => $key): ?>
              <div class="c-field">
                <span class="c-label"><?= e(word('term') . " {$number} " . ucfirst($part)) ?></span>
                <?php if ($term['lock'][$part]): ?>
                  <p class="c-school-year__locked" title="<?= e(words('This date has passed, or the {term} is published, so it stays.')) ?>">
                    <?= icon('lock', 13) ?><?= e($dateText($term[$key])) ?>
                  </p>
                <?php else: ?>
                  <?php
                  $datepickerId  = "j-term-{$part}-{$year}-{$number}";
                  $name          = "{$part}_{$year}_{$number}";
                  $selectedValue = $term['box'][$key];
                  $tone          = 'sky';
                  require __DIR__ . '/_datepicker.php';
                  ?>
                <?php endif; ?>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endforeach; ?>
      </section>
    <?php endforeach; ?>
  </div>
  <div class="c-pop-up__footer">
    <button type="button" class="c-btn c-btn--outline j-pop-up-close">Cancel</button>
    <button type="submit" class="c-btn c-btn--solid"><?= icon('check', 14) ?>Save Dates</button>
  </div>
</form>
<?php
$popUpContent     = ob_get_clean();
$popUpId          = 'j-term-dates';
$popUpIcon        = 'calendar';
$popUpEyebrow     = 'Academic Year';
$popUpTitle       = words('{Term} Dates');
$popUpDescription = words('This year and next. A {term} that has started keeps its start; one that has ended keeps both.');
$popUpSize        = 'wide';
$popUpOpenOnLoad  = $schoolYear['reopen'];
require __DIR__ . '/_pop_up.php';
unset($dateText, $year, $yearCard, $number, $term, $part, $key);
