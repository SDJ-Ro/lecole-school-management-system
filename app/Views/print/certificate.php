<?php
// Dompdf cannot use the internet, so the CSS files are loaded from disk
?>
<!doctype html>
<html lang="<?= e(country('language')) ?>">
<head>
  <meta charset="UTF-8" />
  <title><?= e("{$certificate['name']} — Character Certificate") ?></title>
  <link rel="stylesheet" href="global.css" />
  <link rel="stylesheet" href="components/certificate-sheet.css" />
  <link rel="stylesheet" href="pdf.css" />
</head>
<body>
  <?php
  $sheet    = $certificate;
  $sheetFor = 'pdf';
  require dirname(__DIR__) . '/components/_certificate_sheet.php';
  ?>
</body>
</html>
