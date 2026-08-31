<?php
// Needs $name and $lines. Each line becomes a paragraph.
?>
<p style="margin: 0 0 16px;">Hi <strong><?= e($name) ?></strong>,</p>

<?php foreach ($lines as $line): ?>
    <p style="margin: 0 0 16px;"><?= e($line) ?></p>
<?php endforeach; ?>
