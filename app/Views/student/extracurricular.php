<?php
$tabTitle = 'Extracurricular';
$styles   = ['page-header', 'panel', 'tag', 'empty-box', 'search-field', 'tabs', 'extracurricular-card', 'extracurricular-hero',
             'programme-panel', 'award-card', 'award-page', 'staff-card', 'squad-roster', 'notice-card', 'dropdown', 'calendar/calendar',
             'calendar/day-card', 'calendar/day-card-popup'];
$scripts  = ['dropdown', 'calendar/calendar'];
$grids    = ['filter-bar', 'extracurricular', 'notice'];
require dirname(__DIR__) . '/layouts/page_top.php';

$title    = 'Extracurricular';
$subtitle = 'Browse every sport and club offered at ' . strtolower(word('institution')) . ', and manage your enrollments.';
require dirname(__DIR__) . '/components/_page_header.php';

require dirname(__DIR__) . '/components/' . ($programme === null ? '_extracurricular_list.php' : '_student_programme_view.php');
require dirname(__DIR__) . '/layouts/page_bottom.php';
