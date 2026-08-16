<?php
/**
 * =========================================================================
 * L'ÉCOLE — ADMIN EXTRACURRICULAR VIEW
 * =========================================================================
 * Responsibility: Renders the Admin Extracurricular ("Sports & Clubs") interface.
 * Role: Admin (`/admin/extracurricular`)
 * Architectural Precedent: 1:1 structural port from `Admin/extracurricular/index.html`.
 */

$title = "L'École Admin Dashboard Interface — Extracurricular";
$featureCss = "/assets/features/admin_extracurricular/styles.css";
$currentRole = 'admin';
$currentRoute = '/admin/extracurricular';

require __DIR__ . '/../components/_head.php';
?>

<div id="j-app-root" class="c-app-shell">

  <?php require __DIR__ . '/../components/_sidebar.php'; ?>

  <!-- =================================================================
       MAIN CONTENT
       Two mutually-exclusive containers, toggled by the router in
       script.js (only one is visible at a time):

       - j-overview-shell: static chrome for the Overview route (title,
         subtitle, search bar, filter tabs).
       - j-view-root: swapped by the router between detail and achievement views.
       ================================================================= -->
  <main class="c-main" id="j-main">
    <div class="c-main-inner">
      <div class="c-main-container">
        <div class="c-page-stack" id="j-overview-shell" style="display: none;">
          <header class="c-page-header-row j-ex-1">
            <div>
              <h1 class="c-page-header__title c-font-display">Sports &amp; Clubs</h1>
              <p class="c-page-header__subtitle">Browse every sport and club offered at school, and manage your enrollments.</p>
            </div>
            <div class="j-ex-2">
              <div class="c-search-bar j-ex-3">
                <span class="j-ex-4"><svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
                <input class="j-ex-5" type="text" id="j-club-search" placeholder="Search activities (e.g. Cricket, Debating...)" />
              </div>
              <div class="j-ex-6">
                <div class="c-segmented-tabs j-ex-7">
                  <button type="button" class="c-segmented-tab is-active" data-value="All">All</button>
                  <button type="button" class="c-segmented-tab" data-value="Sports">Sports</button>
                  <button type="button" class="c-segmented-tab" data-value="Clubs and Societies">Clubs</button>
                </div>
              </div>
            </div>
          </header>

          <div id="j-list-feedback-slot"></div>

          <div class="c-club-grid" id="j-club-grid">
            <!-- filled by renderOverviewView() in script.js -->
          </div>
        </div>

        <div class="c-page-stack" id="j-view-root">
          <!-- filled by renderDetailView() / renderAchievementView() in script.js based on hash route -->
        </div>
      </div>
    </div>
  </main>
</div>

<!-- =====================================================================
     MODAL LAYER — reusable modal container written by script.js
     ===================================================================== -->
<div class="c-modal-layer" id="j-modal-layer" role="presentation">
  <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close dialog"></button>
  <section class="c-modal" id="j-modal" role="dialog" aria-modal="true" tabindex="-1"></section>
</div>

<script src="/assets/js/utils.js"></script>
<script src="/assets/js/sidebar.js"></script>
<script src="/assets/features/admin_extracurricular/data.js"></script>
<script src="/assets/features/admin_extracurricular/script.js"></script>
</body>
</html>
