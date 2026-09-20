<?php
$tabTitle = 'Audit Logs';
$styles   = ['page-header', 'search-field', 'dropdown', 'panel', 'tag', 'empty-box', 'page-links', 'audit'];
$scripts  = ['dropdown'];

$actorNames = ['' => 'All actors'];
foreach (array_keys(config('audit.tones')) as $actorRole)
{
    $actorNames[$actorRole] = $actorRole === 'system' ? 'System' : word($actorRole);
}

require dirname(__DIR__) . '/layouts/page_top.php';
?>
<div class="c-audit">
  <?php
  $title    = 'Audit Logs';
  $subtitle = 'System-wide activity tracking and security monitoring.';
  require dirname(__DIR__) . '/components/_page_header.php';
  ?>

  <form class="c-audit__toolbar" method="get" action="<?= e("/{$currentRole}/audit") ?>" role="search" data-submit-on-change>
    <label class="c-search c-audit__search">
      <?= icon('search', 16) ?>
      <input type="search" class="c-search__input" name="q" value="<?= e($filters['q']) ?>" placeholder="Search by actor or details…" autocomplete="off" aria-label="Search the audit log">
    </label>

