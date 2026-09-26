<?php
// A teacher with one programme sees its hero at the top instead of a page header
// A teacher with several programmes sees the list first
$tabTitle = 'Extracurricular';
$styles   = ['page-header', 'panel', 'tag', 'empty-box', 'search-field', 'tabs', 'dropdown', 'form-field', 'image-picker',
             'extracurricular-card', 'extracurricular-hero', 'programme-panel', 'award-card', 'award-page', 'metric-card', 'join-request-card',
             'staff-card', 'notice-card', 'calendar/calendar', 'calendar/day-card', 'calendar/day-card-popup', 'calendar/event-editor',
             'teams-panel', 'team-card', 'team-pop-up', 'danger-zone', 'info-card', 'person-profile', 'achievements-timeline'];
$scripts  = ['dropdown', 'calendar/calendar', 'calendar/event-editor', 'image-picker', 'repeat-list', 'achievements-timeline', 'people-profile'];
$grids    = ['filter-bar', 'extracurricular', 'metric-cards', 'notice'];
require dirname(__DIR__) . '/layouts/page_top.php';

if ($programme === null)
{
    $title    = 'Extracurricular';
    $subtitle = 'The clubs and sports you are in charge of.';
    require dirname(__DIR__) . '/components/_page_header.php';
}

require dirname(__DIR__) . '/components/' . ($programme === null ? '_extracurricular_list.php' : '_programme_view.php');
require dirname(__DIR__) . '/layouts/page_bottom.php';
