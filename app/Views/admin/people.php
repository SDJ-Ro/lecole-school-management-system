<?php
$tabTitle      = 'People Directory';
$styles        = ['page-header', 'tabs', 'search-field', 'dropdown', 'datepicker', 'form-field', 'panel', 'tag', 'info-card', 'empty-box', 'people-directory', 'people-table', 'page-links', 'person-profile', 'parent-picker', 'qualification-rows', 'teacher-handover', 'record-book', 'achievements-timeline'];
$scripts       = ['dropdown', 'datepicker', 'background-save', 'people-directory', 'record-book', 'achievements-timeline', 'people-profile', 'parent-picker', 'qualification-rows'];
$grids         = ['people'];
$directoryView = 'office';

require dirname(__DIR__) . '/layouts/page_top.php';
require dirname(__DIR__) . '/components/_people_directory.php';
require dirname(__DIR__) . '/layouts/page_bottom.php';
