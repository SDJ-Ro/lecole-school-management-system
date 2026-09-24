<?php
// One grade card with its classes. Needs $grade, $teacherOptions, $subjectTeachers, $pageUrl and $csrfField
// Delete asks which classes to remove
// A class with students or past records can't be ticked, and the server checks this again
$cardName    = grade_name($grade['number']);
$cardClasses = count($grade['classes']);
$cardFormId  = "j-delete-grade-{$grade['id']}";
$studentWord = fn (int $count): string => $count . ' ' . strtolower($count === 1 ? word('student') : plural('student'));
// Why a class can't be deleted, or empty if it can
$cardReason  = fn (array $row): string => match (true)
{
    $row['students'] > 0      => $studentWord($row['students']),
    $row['past_students'] > 0 => "Kept: earlier years' records point to it",
    default                   => '',
};
$cardFree    = array_filter($grade['classes'], fn (array $class): bool => $cardReason($class) === '');
$cardBlocked = $cardFree === [] && $cardReason($grade) !== ''
    ? "Nothing in {$cardName} can be deleted: its " . strtolower(plural('class')) . ' have ' . strtolower(plural('student')) . " or earlier years' records."
    : '';
?>
<article class="c-card c-grade-card" id="grade-<?= e($grade['id']) ?>">
  <div class="c-grade-card__head">
    <div>
      <h3 class="c-grade-card__name"><?= e($cardName) ?></h3>
      <p class="c-grade-card__meta">
        <?= icon('usersRound', 14) ?>
        <?= e($studentWord($grade['students']) . ' · ' . $cardClasses . ' ' . strtolower($cardClasses === 1 ? word('class') : plural('class'))) ?>
      </p>
    </div>

