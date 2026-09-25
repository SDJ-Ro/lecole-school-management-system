<?php
// One award page. When $editing is true the same page becomes the add or edit form
// Needs $award, $editing, $can, $programme, $programmeUrl, $awardUrl, $csrfField and $currentRole
// Management also gets $honours for the honours board tick
$awardNew    = $award['id'] === 'new';
$awardDate   = $award['date'] !== '' ? date(country('date_format'), strtotime($award['date'])) : '';
$awardOthers = array_values(array_filter(explode(', ', $award['others'])));
$awardFacts  = [   // Each fact is its field, label and form name
    [['tournament', 'Tournament / event', 'tournament'], ['date', 'Date', ''], ['venue', 'Venue', ''], ['level', 'Scope / level', 'level'],
     ['ageGroup', 'Age Group', 'age_group'], ['representing', 'Representing (Team / Individual)', 'representing']],
    [['organisedBy', 'Organised by', 'organiser'], ['place', 'Position / result', 'place'], ['medal', 'Award / medal', 'medal']],
];
$awardPick   = [
    'level'        => country('achievement_levels'),
    'ageGroup'     => $programme['ageGroups'],   // An empty list means no age group box
    'representing' => array_values(array_unique([...array_column($programme['teams'], 'name'), ...($award['representing'] !== '' ? [$award['representing']] : []), 'Individual'])),
];
if ($programme['ageGroups'] === [] && $award['ageGroup'] === '')
{
    $awardFacts[0] = array_values(array_filter($awardFacts[0], fn (array $fact): bool => $fact[0] !== 'ageGroup'));
}
?>
<div class="c-award-bar">
  <a class="c-btn c-btn--back" href="<?= e($programmeUrl) ?>"><?= icon('arrowLeft', 16) ?><span>Back</span></a>
  <?php if ($editing): ?>
    <div class="c-award-bar__actions">
      <a class="c-btn c-btn--ghost" href="<?= e($awardNew ? $programmeUrl : $awardUrl . $award['id']) ?>">Cancel</a>
      <button type="submit" class="c-btn c-btn--solid" form="j-award-form"><?= icon('check', 14) ?><?= $awardNew ? 'Save Achievement' : 'Save Changes' ?></button>
    </div>
  <?php elseif ($can['edit']): ?>
    <a class="c-btn c-btn--sky c-btn--small" href="<?= e("{$awardUrl}{$award['id']}&edit=1") ?>"><?= icon('edit', 14) ?>Edit Achievement</a>
  <?php endif; ?>
</div>

<?php if ($editing): ?>
<form class="c-card c-award" id="j-award-form" method="post" action="<?= e("/{$currentRole}/extracurricular/award") ?>" enctype="multipart/form-data" data-warn-unsaved>
  <?= $csrfField ?>
  <input type="hidden" name="id" value="<?= e($programme['id']) ?>">
  <input type="hidden" name="award" value="<?= e($awardNew ? '' : $award['id']) ?>">
<?php else: ?>
<article class="c-card c-award">
<?php endif; ?>
  <header class="c-award__hero">
    <?php if (!$awardNew): ?>
      <div class="c-award__chips">
        <?php if ($award['place'] !== ''): ?>
          <span class="c-tag c-tag--round c-tag--sunshine"><?= e($award['place']) ?></span>
        <?php endif; ?>
        <span class="c-tag c-tag--round c-tag--sky"><?= e($award['level']) ?></span>
        <span class="c-tag c-tag--round c-award__year"><?= e($award['year']) ?></span>
      </div>
    <?php endif; ?>

    <?php if ($editing): ?>
      <input type="text" class="c-field__input c-award__title-input" name="title" value="<?= e($award['title']) ?>" placeholder="Achievement title" aria-label="Achievement title" maxlength="150" required>
      <div class="c-award__meta">
        <?= icon('calendar', 16) ?><input type="date" class="c-field__input c-field__input--small c-award__meta-box" name="date" value="<?= e($award['date']) ?>" max="<?= e(date('Y-m-d')) ?>" aria-label="Date" required>
        <?= icon('mapPin', 16) ?><input type="text" class="c-field__input c-field__input--small c-award__meta-box" name="venue" value="<?= e($award['venue']) ?>" placeholder="Venue" aria-label="Venue" maxlength="150">
      </div>
    <?php else: ?>
      <h1 class="c-award__title"><?= e($award['title']) ?></h1>
      <p class="c-award__meta"><?= icon('calendar', 16) ?><span><?= e($awardDate) ?></span><span aria-hidden="true">·</span><?= icon('mapPin', 16) ?><span><?= e($award['venue'] !== '' ? $award['venue'] : '—') ?></span></p>
    <?php endif; ?>
  </header>

  <div class="c-award__body">
    <?php if ($editing): ?>
      <section>
        <h2 class="c-award__heading"><?= icon('imagePlus', 18) ?>Cover photo</h2>
        <?php
        $imagePicker = ['variant' => 'row', 'name' => 'cover', 'image' => $award['image'], 'label' => 'Choose Cover Photo'];
        require __DIR__ . '/_image_picker.php';
        ?>
      </section>
      <label class="c-field">
        <span class="c-label c-field__label">Achievement Summary / Bio</span>
        <textarea class="c-field__input c-field__input--area" name="summary" rows="3" maxlength="600" placeholder="What happened, and why it matters…"><?= e($award['summary']) ?></textarea>
      </label>
      <?php if ($honours): ?>
        <?php
        $honoursTicked = $award['honours'];
        require __DIR__ . '/_honours_tick.php';
        ?>
      <?php endif; ?>
    <?php elseif ($award['summary'] !== ''): ?>
      <p class="c-award__summary"><?= e($award['summary']) ?></p>
    <?php endif; ?>
