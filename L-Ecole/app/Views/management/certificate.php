<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT CHARACTER CERTIFICATE VIEW
 * =========================================================================
 * Responsibility: Renders the Management Character Certificate interface.
 * Role: Management (`/management/certificate`)
 * Architectural Precedent: 1:1 structural port from
 *   `Management Panel/character-certificate/index.html`.
 *
 * Architecture note:
 *   This feature is intentionally 100% JS-rendered. The PHP view provides:
 *     - the shared MVC shell (head metadata, sidebar, main wrapper)
 *     - the JS mount point: <div class="page" id="app"></div>
 *     - the feature CSS and JS asset tags
 *   All feature DOM is built dynamically by script.js via app.innerHTML.
 *   The PHP layer does NOT pre-render any certificate UI elements.
 *
 * Management scope (Management-only feature — no Admin counterpart):
 *   - Certificate list/card grid
 *   - All Certificates / Issued queue tabs
 *   - Search by name, ID, cohort
 *   - Pathway filter (All / Leaving / Graduating)
 *   - Grouped-by-year display for Issued queue (collapsible)
 *   - Needing Review / Verified certificate grouping
 *   - Pending-request indicator badge on cards
 *   - Certificate detail view (A4 document rendering)
 *   - Multi-page A4 pagination engine with heading-orphan prevention
 *   - Edit certificate wording (academic / conduct / activities)
 *   - Edit student particulars (name, ID, cohort)
 *   - Finalise / issue a certificate
 *   - Print certificate (window.print())
 *   - Activity timeline per certificate
 *   - Student Requests modal (certificate copy + missing record requests)
 *   - Certificate copy request approval / rejection
 *   - Missing record request approval / rejection
 *   - Evidence file listing and preview modal
 *   - Success notice banner
 *   - Focus preservation across re-renders
 *
 * Poppins font: provided globally by /assets/css/theme.css — not repeated here.
 *
 * JS mount point: <div class="page" id="app"></div>
 *   Owned by: script.js (document.getElementById('app'))
 *   Do not pre-populate this element from PHP.
 */

$title       = "Character Certificates — L'École Management";
$featureCss  = '/assets/features/management_certificate/styles.css';
$currentRole  = 'management';
$currentRoute = '/management/certificate';

require __DIR__ . '/../components/_head.php';
?>

<link rel="stylesheet" href="<?= htmlspecialchars($featureCss) ?>" />

<div id="j-app-root" class="c-app-shell">

  <?php require __DIR__ . '/../components/_sidebar.php'; ?>

  <main id="j-main" class="c-main">
    <!--
      JS mount point.
      script.js targets document.getElementById('app') and renders
      the entire Certificate feature UI via app.innerHTML.
      Do not add static Certificate DOM here.
    -->
    <div class="page" id="app"></div>
  </main>

</div>

<script src="/assets/js/utils.js"></script>
<script src="/assets/js/sidebar.js"></script>
<script src="/assets/features/management_certificate/data.js"></script>
<script src="/assets/features/management_certificate/script.js"></script>
</body>
</html>
