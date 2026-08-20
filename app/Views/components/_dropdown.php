<?php
// A styled dropdown instead of a native select. Needs $dropdownId and $options
// Optional $selectedValue, $placeholder, $dropdownLabel, $name, $prefix, $variant, $tone, $isMultiSelect and $required
// Every setting is cleared at the end, so the next dropdown starts fresh
// An option may have a sub line, and a disabled option uses it to say why
// An empty selected value is a real choice when one option has an empty value
// A multi-select takes a list of values and a name ending in brackets
// $required is the error shown when the form is sent with nothing chosen
// dropdown.js sends a dropdown:change event when the choice changes
$dId      = $dropdownId;
$dLabel   = $dropdownLabel ?? 'Dropdown';
$dHolder  = $placeholder ?? 'Select option';
$dVal     = $selectedValue ?? null;
$dName    = $name ?? '';
$dPrefix  = $prefix ?? '';
$dVariant = $variant ?? 'default';
$dTone    = $tone ?? '';
$isMulti  = !empty($isMultiSelect);
$dMissing = $required ?? '';

// Give every option a value and a label, and keep each value once
$formattedOptions = [];
foreach ($options ?? [] as $opt)
{
    $val = (string) (is_array($opt) ? ($opt['value'] ?? $opt['label']) : $opt);
    $formattedOptions[$val] ??= [
        'value'    => $val,
        'label'    => is_array($opt) ? ($opt['label'] ?? $val) : (string) $opt,
        'sub'      => is_array($opt) ? ($opt['sub'] ?? '') : '',
        'disabled' => is_array($opt) && !empty($opt['disabled']),
    ];
}
$formattedOptions = array_values($formattedOptions);
$labels           = array_column($formattedOptions, 'label', 'value');

$selectedValues = $isMulti ? array_map('strval', (array) ($dVal ?? [])) : [];
$hasSelected    = !$isMulti && $dVal !== null && isset($labels[(string) $dVal]);
$displayLabel   = $hasSelected ? $labels[(string) $dVal] : $dHolder;

$dClasses = 'c-dropdown c-dropdown--' . $dVariant
          . ($dTone !== '' ? ' c-dropdown--' . $dTone : '')
          . ($isMulti ? ' c-dropdown--multi' : '');
?>
