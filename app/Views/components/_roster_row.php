<?php
// One member row in a team's pop-up. Only students in the team's age group can be picked
// With no $member it draws the empty row that Add Member copies
?>
<div class="c-roster-row" data-repeat-row>
  <?php
  $dropdownId    = $rosterRowId;
  $dropdownLabel = word('student');
  $name          = 'member[]';
  $options       = array_map(fn (array $person): array => ['value' => $person['id'], 'label' => $person['name'],
                       'sub' => ($person['grade'] !== null ? grade_name((int) $person['grade']) : '—') . " · {$person['ageGroup']}"],
                   array_values(array_filter($programme['members'], fn (array $person): bool => in_array($team['ageGroup'] ?? '', ['', $person['ageGroup']], true))));
  $selectedValue = $member['id'] ?? null;
  $placeholder   = 'Choose a member';
  require __DIR__ . '/_dropdown.php';
  ?>
  <input type="text" class="c-field__input" name="member_position[]" value="<?= e($member['position'] ?? '') ?>" placeholder="Role / position" maxlength="50" aria-label="Role or position">
  <button type="button" class="c-roster-row__remove" data-repeat-remove aria-label="Remove member"><?= icon('close', 16) ?></button>
</div>
