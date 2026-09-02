<?php
$tabTitle = words('{Teacher} Feedback');
$styles   = ['page-header', 'search-field', 'dropdown', 'panel', 'tag', 'empty-box', 'feedback'];
$scripts  = ['dropdown', 'feedback-card'];
$grids    = ['filter-bar', 'feedback'];

require dirname(__DIR__) . '/layouts/page_top.php';

$title    = words('{Teacher} Feedback');
$subtitle = words('Read updates and feedback from your {teachers}.');
require dirname(__DIR__) . '/components/_page_header.php';

require dirname(__DIR__) . '/components/_feedback_board.php';
require dirname(__DIR__) . '/layouts/page_bottom.php';
