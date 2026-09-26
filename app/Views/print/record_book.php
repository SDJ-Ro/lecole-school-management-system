<?php
// No sidebar here, because export-pdf.js loads this page hidden just to print it
$gradeName   = $book['label'];
$termName    = word('term') . " {$term}";
$teacherName = word('class') . ' ' . word('teacher');
?>
<!doctype html>
<html lang="<?= e(country('language')) ?>">
<head>
  <meta charset="UTF-8" />
  <title><?= e("{$student['name']} — {$gradeName} ({$termName}) Record Book") ?></title>
  <link rel="stylesheet" href="<?= e(asset('css/global.css')) ?>" />
  <link rel="stylesheet" href="<?= e(asset('css/print.css')) ?>" />
</head>
<body class="c-print">
  <header class="c-print__letterhead">
    <div class="c-print__school">
      <img class="c-print__logo" src="<?= e(school('logo')) ?>" alt="">
      <div>
        <h1 class="c-print__name"><?= e(school('name')) ?></h1>
        <p class="c-print__motto"><?= e(school('motto')) ?></p>
      </div>
    </div>
    <div class="c-print__badge">
      <span class="c-print__pill">Official Transcript</span>
      <p class="c-print__date">Date: <?= e(date(country('date_format'))) ?></p>
    </div>
  </header>
