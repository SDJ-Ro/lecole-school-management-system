<?php
$tabTitle = 'Settings';
$styles   = ['page-header', 'panel', 'section-header', 'form-field', 'info-card', 'settings'];
$scripts  = ['file-box', 'edit-toggle'];
$grids    = ['settings'];

require dirname(__DIR__) . '/layouts/page_top.php';
require dirname(__DIR__) . '/components/_settings.php';
require dirname(__DIR__) . '/layouts/page_bottom.php';
