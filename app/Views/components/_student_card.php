<?php
// One student card for a teacher. Needs $studentCard and $studentCardVariant
// The grid card has View and Record, the marks card has Edit Marks
// The banner card sits on top of the student's timeline
$card      = $studentCard;
$cardIssue = $studentCardVariant === 'grid' && $card['issue'];   // Not called $issue because the page already uses that name
$initials  = initials($card['name']);
?>
<?php if ($studentCardVariant !== 'banner'): ?>
  <article class="c-student-card c-student-card--<?= e($card['tone']) ?><?= $cardIssue ? ' c-student-card--issue' : '' ?> j-student-card"
           data-name="<?= e($card['name']) ?>" data-code="<?= e($card['code']) ?>" data-from="<?= e($card['from'] ?? '') ?>" data-initials="<?= e($initials) ?>">
    <?php if ($card['photo'] !== ''): ?>
      <img class="c-avatar c-avatar--large c-student-card__avatar" src="<?= e($card['photo']) ?>" alt="<?= e($card['name']) ?>">
    <?php else: ?>
      <span class="c-avatar c-avatar--large c-student-card__avatar c-student-card__avatar--initials" aria-hidden="true"><?= e($initials) ?></span>
    <?php endif; ?>

    <h2 class="c-student-card__name"><?= e($card['name']) ?></h2>
    <p class="c-student-card__code"><?= e($card['code']) ?></p>
