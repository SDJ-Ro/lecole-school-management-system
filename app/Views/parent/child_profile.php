<?php
// Each tab is a link, so only the chosen tab is drawn
$tabTitle = 'Child Profile';
$styles   = ['page-header', 'panel', 'tabs', 'tag', 'empty-box', 'info-card', 'person-profile',
             'dropdown', 'export-pdf-button', 'record-book', 'academic-section',
             'search-field', 'extracurricular-card', 'extracurricular-hero', 'programme-panel', 'award-card', 'award-page', 'staff-card',
             'squad-roster', 'notice-card', 'calendar/calendar', 'calendar/day-card', 'calendar/day-card-popup',
             'metric-card', 'achievements-timeline', 'form-field', 'danger-zone', 'datepicker', 'leave-school',
             'certificates', 'my-requests', 'certificate-sheet'];
$scripts  = ['dropdown', 'export-pdf', 'record-book', 'academic-section', 'calendar/calendar', 'achievements-timeline', 'datepicker', 'certificate-sheet'];
$grids    = ['child-profile', 'academic', 'filter-bar', 'extracurricular', 'notice', 'metric-cards', 'certificates'];
require dirname(__DIR__) . '/layouts/page_top.php';

$title    = 'Child Profile';
$subtitle = "Welcome back, {$userName}.";
require dirname(__DIR__) . '/components/_page_header.php';
?>
<?php if ($profile === null): ?>
  <div class="c-empty-box">
    <p class="c-empty-box__text"><?= e(words('No {student} is linked to your account yet. Ask the {institution} office to link them.')) ?></p>
  </div>
<?php else: ?>
  <div class="l-child-profile__top">
    <?php
    $header       = $profile['header'];
    $headerOnPage = true;
    require dirname(__DIR__) . '/components/_person_header.php';
    ?>

    <nav class="c-tabs c-tabs--wide" aria-label="Child profile">
      <?php foreach ($tabs as $tabKey => $tabName): ?>
        <a class="c-tabs__tab" href="<?= e(url_with('/parent/child-profile', ['tab' => $tabKey])) ?>" aria-selected="<?= $tab === $tabKey ? 'true' : 'false' ?>"><?= e($tabName) ?></a>
      <?php endforeach; ?>
    </nav>
  </div>
