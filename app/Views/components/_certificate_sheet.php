<?php
// The certificate, for both the screen and the PDF. Needs $sheet and $sheetFor
// Dompdf reads this HTML too, so its CSS avoids flex and grid
// Optional $sheetEditable lets management edit the sections in place
$sheetOnScreen = $sheetFor === 'screen';
$sheetIcon     = fn (string $name): string => $sheetOnScreen ? icon($name, 17) : icon_image($name, 17, 'terracotta');
$sheetFacts    = [
    [['Full name', $sheet['name']], ['Name with initials', $sheet['withInitials']]],
    [[words('{Student} index no.'), $sheet['id']], [words('Current {class}'), $sheet['cohort']]],
    [['Period of study', $sheet['period']], null],
];
?>
<?php if ($sheetOnScreen): ?>
  <div class="j-certificate-pages">
    <div class="c-certificate-pages__paper">
      <div class="c-certificate-pages__strip j-certificate-strip">
<?php endif; ?>

<article class="c-certificate<?= !empty($sheetEditable) ? ' j-certificate-sheet' : '' ?>">
  <header class="c-certificate__header">
    <p class="c-certificate__school"><?= e(school('name')) ?></p>
    <p class="c-certificate__motto"><?= e(school('motto')) ?></p>
    <div class="c-certificate__rule"></div>
    <h2 class="c-certificate__title">Character Certificate</h2>
    <p class="c-certificate__awarded"><span class="c-certificate__soft">Awarded to</span> <strong><?= e($sheet['name']) ?></strong></p>
  </header>

  <section class="c-certificate__section">
    <div class="c-certificate__heading">
      <h3 class="c-certificate__heading-title"><?= e(words('{Student} particulars')) ?></h3>
      <span class="c-certificate__note">Verified <?= e(strtolower(word('student'))) ?> record</span>
    </div>
    <table class="c-certificate__facts">
      <?php foreach ($sheetFacts as $sheetRow): ?>
        <tr>
          <?php foreach ($sheetRow as $sheetColumn => $sheetFact): ?>
            <?php if ($sheetColumn === 1): ?><td class="c-certificate__gap"></td><?php endif; ?>
            <?php if ($sheetFact === null): ?>
              <td colspan="2"></td>
            <?php else: ?>
              <td class="c-certificate__fact-label"><?= e($sheetFact[0]) ?></td>
              <td class="c-certificate__fact-value"><?= e($sheetFact[1]) ?></td>
            <?php endif; ?>
          <?php endforeach; ?>
        </tr>
      <?php endforeach; ?>
    </table>
  </section>
