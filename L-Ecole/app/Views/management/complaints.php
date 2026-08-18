<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT COMPLAINTS OVERVIEW VIEW
 * =========================================================================
 * Responsibility: Renders the Management Complaints & Inquiries interface.
 * Role: Management (`/management/complaints`)
 * Architectural Precedent: 1:1 structural port from
 *   `Management Panel/complaints/index.html`.
 */

$title       = "Complaints & Inquiries — L'École Management";
$featureCss  = '/assets/features/management_complaints/styles.css';
$currentRole  = 'management';
$currentRoute = '/management/complaints';

require __DIR__ . '/../components/_head.php';
?>

<link rel="stylesheet" href="<?= htmlspecialchars($featureCss) ?>" />

<div id="j-app-root" class="c-app-shell">

  <?php require __DIR__ . '/../components/_sidebar.php'; ?>

  <main id="j-main" class="c-main">
    <div class="page">

      <div class="header-row">
        <div>
          <h1 class="page-title">Complaints &amp; Inquiries</h1>
          <p class="page-subtitle">Manage and track parent feedback and issues.</p>
        </div>
      </div>

      <div class="controls-row">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="searchInput" placeholder="Search complaints..." />
        </div>
        <div class="filters">
          <div class="select-wrap" id="categorySelectWrap">
            <button type="button" class="select-trigger" id="categoryTrigger">
              <span id="categoryTriggerLabel">All Categories</span>
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="select-menu" id="categoryMenu"></div>
          </div>
          <div class="select-wrap" id="statusSelectWrap">
            <button type="button" class="select-trigger" id="statusTrigger">
              <span id="statusTriggerLabel">All Statuses</span>
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="select-menu" id="statusMenu"></div>
          </div>
        </div>
      </div>

      <div class="complaints-list" id="complaintsList"></div>

      <div class="empty-state" id="emptyState" hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="32" height="32"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
        <h3>No complaints found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>

    </div>
  </main>

</div>

<script src="/assets/js/utils.js"></script>
<script src="/assets/js/sidebar.js"></script>
<script src="/assets/features/management_complaints/data.js"></script>
<script src="/assets/features/management_complaints/script.js"></script>
</body>
</html>
