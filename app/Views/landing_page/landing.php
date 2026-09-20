<!DOCTYPE html>
<html lang="<?= e(country('language')) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e(school('name')) ?> — <?= e(school('tagline')) ?></title>
    <link rel="icon" href="<?= e(school('logo')) ?>">
    <link rel="stylesheet" href="<?= e(asset('css/global.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset('css/components/button.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset('css/components/label.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset('css/components/tag.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset('css/landing.css')) ?>">
    <script src="<?= e(asset('js/reveal.js')) ?>" defer></script>
</head>
<body>

<?php require dirname(__DIR__) . '/components/icons.php'; ?>

<main class="l-hero">
    <img class="l-hero-photo" src="<?= e(school('campus_image')) ?>" alt="The <?= e(school('name')) ?> campus">
    <div class="l-hero-scrim" aria-hidden="true"></div>

