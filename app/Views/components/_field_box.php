<?php
// One input box, picked by the field's kind. Needs $fieldBox, $fieldBoxVariant, $fieldBoxTone and $fieldBoxForm
// The caller draws the label, and every setting is cleared at the end
// $fieldBoxForm is only set when the box sits outside its form
$fbName  = $fieldBox['name'];
$fbBox   = $fieldBox['box'];
$fbCard  = $fieldBoxVariant === 'card';
$fbId    = "j-{$fieldBoxVariant}-" . str_replace('_', '-', $fbName);
$fbClass = 'c-field__input' . ($fbCard ? ' c-field__input--small c-info-card__input' : '');
$fbType  = str_contains($fbName, 'phone') ? 'tel' : (str_contains($fbName, 'email') ? 'email' : 'text');
?>
<?php if ($fbBox === 'date'): ?>
  <?php
  $datepickerId  = $fbId;
  $name          = $fbName;
  $selectedValue = $fieldBox['value'];
  $tone          = $fbCard ? 'sky' : $fieldBoxTone;
  $minAge        = $fieldBox['minAge'] ?? '';
  $maxAge        = $fieldBox['maxAge'] ?? '';
  require __DIR__ . '/_datepicker.php';
  ?>