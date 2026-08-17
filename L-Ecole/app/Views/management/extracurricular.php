<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT EXTRACURRICULAR VIEW
 * =========================================================================
 * Responsibility: Renders the Management Extracurricular interface.
 * Role: Management (`/management/extracurricular`)
 * Architectural Precedent: 1:1 structural port from `Management Panel/extracurricular/index.html`.
 */

$title = "L'École — Extracurricular";
$featureCss = "/assets/features/management_extracurricular/styles.css";
$currentRole = 'management';
$currentRoute = '/management/extracurricular';

require __DIR__ . '/../components/_head.php';
?>

<div id="j-app-root" class="c-app-shell">

  <?php require __DIR__ . '/../components/_sidebar.php'; ?>

  <!-- MAIN CONTENT -->
  <main class="c-main" id="j-main">
    <div class="c-main-inner">
      <div class="c-main-container">
        <div class="c-page-stack" id="j-view-root">
          <!-- filled by renderOverviewView() / renderDetailView() /
               renderAchievementView() in script.js based on the current
               location.hash route -->
        </div>
      </div>
    </div>
  </main>
</div>

<!-- MODAL LAYER -->
<div class="c-modal-layer" id="j-modal-layer" role="presentation">
  <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close dialog"></button>
  <section class="c-modal" id="j-modal" role="dialog" aria-modal="true" tabindex="-1"></section>
</div>

<script src="/assets/js/utils.js"></script>
<script src="/assets/features/management_extracurricular/data.js"></script>
<script src="/assets/features/management_extracurricular/script.js"></script>
<script src="/assets/js/sidebar.js"></script>
</body>
</html>
