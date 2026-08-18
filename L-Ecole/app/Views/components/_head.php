<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= htmlspecialchars($title ?? $pageTitle ?? "L'École Admin Dashboard Interface") ?></title>
  <link rel="stylesheet" href="/assets/css/sidebar.css" />
  <link rel="stylesheet" href="/assets/css/theme.css" />
  <?php if (!empty($featureCss)): ?>
    <link rel="stylesheet" href="<?= htmlspecialchars($featureCss) ?>" />
  <?php endif; ?>
</head>
<body>
