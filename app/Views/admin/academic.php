<?php
$tabTitle = 'Academic Overview';
$styles   = ['page-header', 'dropdown', 'panel', 'chart', 'bar-chart', 'calendar/calendar', 'calendar/day-card', 'calendar/day-card-popup', 'calendar/event-editor', 'form-field', 'datepicker', 'tag', 'empty-box', 'section-box', 'school-year', 'grade-card', 'grade-class-row', 'grade-class-editor', 'teacher-workload', 'curriculum-card'];
$scripts  = ['dropdown', 'datepicker', 'chart', 'bar-chart', 'calendar/calendar', 'calendar/event-editor', 'background-save', 'academic'];
$grids    = ['chart-calendar', 'grade'];

require dirname(__DIR__) . '/layouts/page_top.php';
require dirname(__DIR__) . '/components/_academic_overview.php';
require dirname(__DIR__) . '/layouts/page_bottom.php';
