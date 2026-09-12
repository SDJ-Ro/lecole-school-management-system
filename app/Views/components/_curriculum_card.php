<?php
// One curriculum stage card, or the stage editor. Needs $curriculumVariant, $pageUrl and $csrfField
// The card variant needs $stage. A stage whose subjects have marks can't be deleted
// The editor is hidden, and academic.js moves it to the pressed card and fills it in
// After a refused save the page reopens the editor with $stageForm
// A save that removes subject teachers asks first
?>
<?php if ($curriculumVariant === 'card'): ?>
  <?php
  $stageTitle = grade_range($stage['first_grade'], $stage['last_grade']);
  $stageCount = count($stage['subjects']);
  ?>
  <article class="c-curriculum-card" id="stage-<?= e($stage['id']) ?>">
    <div class="c-curriculum-card__top">
      <div>
        <h3 class="c-curriculum-card__range"><?= e($stageTitle) ?></h3>
        <?php if ($stage['description']): ?>
          <p class="c-curriculum-card__desc"><?= e($stage['description']) ?></p>
        <?php endif; ?>
      </div>

      <div class="c-curriculum-card__actions">
        <span class="c-tag c-tag--round c-curriculum-card__count"><?= e($stageCount . ' ' . ($stageCount === 1 ? word('subject') : plural('subject'))) ?></span>
        <button type="button" class="c-btn c-btn--icon c-curriculum-card__icon j-stage-edit" aria-label="Edit <?= e($stageTitle) ?>"
                data-stage="<?= e(json_encode(['id' => $stage['id'], 'first_grade' => (string) $stage['first_grade'], 'last_grade' => (string) $stage['last_grade'],
                    'description' => $stage['description'] ?? '', 'assigned' => $stage['assigned'],
                    'subjects' => array_map(fn (int $id, string $name): array => ['id' => $id, 'name' => $name], array_keys($stage['subjects']), $stage['subjects'])])) ?>">
          <?= icon('edit', 14) ?>
        </button>
        <form method="post" action="<?= e("{$pageUrl}/stages/delete") ?>"
              data-question-title="<?= e("Delete the {$stageTitle} curriculum?") ?>"
              data-question-text="<?= e($stageTitle . words(' will have no {subjects}, and their {subject} {teachers} will be removed.')) ?>"
              data-question-button="Delete Curriculum"
              data-question-blocked="<?= e($stage['marks'] > 0 ? words('Its {subjects} have ') . $stage['marks'] . " marks, so it can't be deleted." : '') ?>">
          <?= $csrfField ?>
          <input type="hidden" name="id" value="<?= e($stage['id']) ?>">
          <button type="submit" class="c-btn c-btn--icon c-curriculum-card__icon" aria-label="Delete <?= e($stageTitle) ?>"><?= icon('trash', 14) ?></button>
        </form>
      </div>
    </div>
