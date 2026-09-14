<?php
$tabTitle = 'Inquiries & Complaints';
$styles   = ['page-header', 'search-field', 'dropdown', 'panel', 'tag', 'empty-box', 'form-field', 'complaints'];
$scripts  = ['dropdown'];
$grids    = ['filter-bar', 'complaints'];

require dirname(__DIR__) . '/layouts/page_top.php';

$title        = 'Inquiries & Complaints';
$subtitle     = words('Submit, track, and review communications with {institution} administration regarding your child.');
$headerButton = ['label' => 'New Inquiry', 'popUp' => 'j-new-inquiry'];
require dirname(__DIR__) . '/components/_page_header.php';

require dirname(__DIR__) . '/components/_new_inquiry_pop_up.php';

$searchText = 'Search by subject, category, or keywords…';
$canResolve = false;
require dirname(__DIR__) . '/components/_complaints_board.php';
require dirname(__DIR__) . '/layouts/page_bottom.php';
