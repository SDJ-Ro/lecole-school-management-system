<?php
// One club or sport card. Needs $programmeCard, $can, $listPath, $listKeep, $teachers, $csrfField and $currentRole
// A student who can't join sees the reason from JoinRules instead of the join button
$cardState   = $programmeCard['state'];
$cardType    = config("extracurricular.types.{$programmeCard['type']}");
$cardPill    = match ($cardState)
{
    'waiting'  => ['Pending Approval', 'waiting'],
    'archived' => ['Archived', 'waiting'],
    'enrolled' => ['Enrolled', 'enrolled'],
    default    => [$cardType['pill'], $programmeCard['type']],
};
$cardContact = match (true)   // Icon, words, and whether it looks greyed out
{
    $programmeCard['watched']                                  => ['lock', 'Academic Watch: no new clubs or sports for now', true],
    $programmeCard['answer'] !== null                          => ['close', $programmeCard['answer'], true],
    $cardState === 'waiting'                                   => ['lock', 'Contact hidden until program approval', true],
    $programmeCard['whyNot'] !== null || ($can['join'] && $cardState !== 'enrolled') => ['lock', 'Coach contact hidden until enrollment', true],
    default                                                    => ['phone', $programmeCard['phone'] !== '' ? $programmeCard['phone'] : 'No coach contact yet', false],
};
$cardAction  = "/{$currentRole}/extracurricular";
$cardForm    = "j-programme-reject-{$programmeCard['id']}";
?>
<article class="c-programme-card<?= in_array($cardState, ['waiting', 'archived'], true) || $programmeCard['watched'] ? ' c-programme-card--waiting' : '' ?>">
  <div class="c-programme-card__top">
    <img class="c-programme-card__photo" src="<?= e($programmeCard['image']) ?>" alt="" loading="lazy">
    <span class="c-tag c-tag--round c-programme-card__pill c-programme-card__pill--<?= e($cardPill[1]) ?>">
      <?php if ($cardState === 'enrolled'): ?><?= icon('check', 10) ?><?php endif; ?><?= e($cardPill[0]) ?>
    </span>
    <div class="c-programme-card__titles">
      <p class="c-label c-programme-card__category"><?= e($programmeCard['category']) ?></p>
      <h2 class="c-programme-card__name"><?= e($programmeCard['name']) ?></h2>
    </div>
  </div>
