<?php
$tabTitle = 'Notice Board';
$styles   = ['page-header', 'dropdown', 'search-field', 'tabs', 'empty-box', 'tag', 'notice-board', 'notice-card', 'datepicker', 'form-card', 'form-field', 'add-notice'];
$scripts  = ['dropdown', 'notice-filter', 'datepicker', 'add-notice'];
$grids    = ['filter-bar', 'notice'];

require dirname(__DIR__) . '/layouts/page_top.php';
require dirname(__DIR__) . '/components/_notice_board.php';
require dirname(__DIR__) . '/layouts/page_bottom.php';
