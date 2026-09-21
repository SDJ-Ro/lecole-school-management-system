<?php
// Activity list, oldest first. Needs $activityItems
// Optional $activitySmall gives the smaller look used on request cards
// Optional $activityWords means each date is already written in words
?>
<ol class="c-activity<?= !empty($activitySmall) ? ' c-activity--small' : '' ?>">
  <?php foreach ($activityItems as [$activityWhen, $activityWhat, $activityWho]): ?>
    <li class="c-activity__item">
      <p class="c-activity__what"><?= e($activityWhat) ?></p>
      <p class="c-activity__when"><?= e((!empty($activityWords) ? $activityWhen : date(country('date_format') . ', g:i A', strtotime($activityWhen))) . " · {$activityWho}") ?></p>
    </li>
  <?php endforeach; ?>
</ol>
<?php unset($activityItems, $activitySmall, $activityWords, $activityWhen, $activityWhat, $activityWho); ?>
