<?php
$tabTitle = 'Achievements';
$styles   = ['page-header', 'panel', 'search-field', 'dropdown', 'empty-box', 'tag', 'student-card', 'achievements-timeline', 'form-field', 'datepicker', 'record-achievement', 'evidence-preview'];
$scripts  = ['dropdown', 'datepicker', 'achievements-timeline', 'student-cards', 'file-box', 'record-achievement'];
$grids    = ['student-cards'];

require dirname(__DIR__) . '/layouts/page_top.php';

if ($student === null)
{
    $title    = 'Achievements';
    $subtitle = words('Track {student} and {institution} honours, awards, and recognitions.');
    require dirname(__DIR__) . '/components/_page_header.php';
}

require dirname(__DIR__) . '/components/_student_achievements.php';
require dirname(__DIR__) . '/layouts/page_bottom.php';
