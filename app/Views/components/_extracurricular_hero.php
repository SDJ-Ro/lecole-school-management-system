<?php
// Top banner of a club or sport page. Needs $heroBack, $programme, $can and $teachers
// With no $heroBack there is no Back button
?>
<?php if ($heroBack !== null): ?>
  <a class="c-btn c-btn--back c-hero-back" href="<?= e($heroBack) ?>"><?= icon('chevronLeft', 16) ?><span>Back</span></a>
<?php endif; ?>

<header class="c-programme-hero l-programme__hero">
  <img class="c-programme-hero__photo" src="<?= e($programme['image']) ?>" alt="">
  <span class="c-programme-hero__created"><?= icon('calendar', 14) ?>Created: <?= e(date(country('date_format'), strtotime($programme['created']))) ?></span>
  <?php if ($can['edit']): ?>
    <button type="button" class="c-programme-hero__edit" data-pop-up-open="j-programme-edit"><?= icon('edit', 14) ?>Edit program</button>
  <?php endif; ?>

  <div class="c-programme-hero__content">
    <p class="c-programme-hero__tags">
      <span><?= e(config("extracurricular.types.{$programme['type']}.name")) ?></span>
      <span class="c-programme-hero__dot" aria-hidden="true">•</span>
      <span><?= e($programme['category']) ?></span>
    </p>
    <h1 class="c-programme-hero__name"><?= e($programme['name']) ?></h1>
    <p class="c-programme-hero__text"><?= e($programme['description']) ?></p>
  </div>
</header>

<?php if ($can['edit']): ?>
  <?php
  $programmePopUp = 'edit';
  require __DIR__ . '/_programme_pop_up.php';
  ?>
<?php endif; ?>
<?php unset($heroBack); ?>
