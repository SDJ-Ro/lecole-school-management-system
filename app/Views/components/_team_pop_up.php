<?php
// The Add Team pop-up, or one Edit pop-up per team. With no $team it is a new one
// The age group only shows when the programme uses age groups
$teamId   = $team === null ? 'j-team-new' : "j-team-{$team['id']}";
$teamRows = "{$teamId}-roster";
$teamName = $team['name'] ?? 'Team';
ob_start();
?>
<form class="c-pop-up__form" method="post" action="<?= e("/{$currentRole}/extracurricular/team") ?>" enctype="multipart/form-data">
  <?= $csrfField ?>
  <input type="hidden" name="id" value="<?= e($programme['id']) ?>">
  <input type="hidden" name="team" value="<?= e($team['id'] ?? '') ?>">
  <div class="c-pop-up__body">
    <div class="c-field-pair">
      <div class="c-team-pop-up__column">
        <label class="c-field">
          <span class="c-label c-field__label">Team Name <span class="c-field__required c-field__required--terracotta">*</span></span>
          <input type="text" class="c-field__input" name="name" value="<?= e($team['name'] ?? '') ?>" placeholder="e.g. Senior Team" maxlength="100" required>
        </label>
        <?php if ($programme['ageGroups'] !== []): ?>
          <div class="c-field">
            <span class="c-label c-field__label">Age Group <span class="c-field__required c-field__required--terracotta">*</span></span>
            <?php
            $dropdownId    = "{$teamId}-age";
            $dropdownLabel = 'Age group';
            $name          = 'age_group';
            $options       = $programme['ageGroups'];
            $selectedValue = in_array($team['ageGroup'] ?? '', $options, true) ? $team['ageGroup'] : null;
            $placeholder   = 'Select age group';
            $required      = 'Please choose the team\'s age group.';
            require __DIR__ . '/_dropdown.php';
            ?>
          </div>
        <?php endif; ?>
      </div>
      <div class="c-field">
        <span class="c-label c-field__label">Panel Cover</span>
        <?php
        $imagePicker = ['variant' => 'box', 'name' => 'cover', 'image' => $team['cover'] ?? '', 'label' => 'Team cover photo'];
        require __DIR__ . '/_image_picker.php';
        ?>
      </div>
    </div>
