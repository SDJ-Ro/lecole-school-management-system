<?php
/**
 * =========================================================================
 * L'ÉCOLE — ADMIN USERS DIRECTORY VIEW
 * =========================================================================
 * Responsibility: Renders the Admin Users Directory interface.
 * Role: Admin (`/admin/people`)
 * Architectural Precedent: 1:1 structural port from `Admin/people/index.html`.
 */

$title = "L'École Admin Users Directory";
$featureCss = "/assets/features/admin_people/styles.css";
$currentRole = 'admin';
$currentRoute = '/admin/people';

require __DIR__ . '/../components/_head.php';
?>

<div id="j-app-root" class="c-app-shell">

  <?php require __DIR__ . '/../components/_sidebar.php'; ?>

  <!-- =====================================================================
     MAIN CONTENT
     ===================================================================== -->
  <main id="j-main" class="c-main">
    <div class="c-main-inner">
      <div class="c-main-container">

        <!-- ============================= PEOPLE DIRECTORY PAGE ============================= -->
        <section id="j-page-people" class="c-page">
          <div class="c-stack-6">
            <header class="c-page-header">
              <div>
                <h1 class="c-page-title c-font-display">Users Directory</h1>
                <p class="c-page-subtitle">Find students, staff, and families by the details that matter.</p>
              </div>
              <div id="j-directory-tablist" class="c-tablist" role="tablist" aria-label="Directory roles"></div>
            </header>

            <p id="j-directory-feedback" class="c-feedback-banner" style="display:none;" aria-live="polite"></p>

            <div id="j-directory-panel-host"></div>
          </div>
        </section>

        <!-- ============================= ENROLLMENT PAGE ============================= -->
        <section id="j-page-enrollment" class="c-page">
          <div class="c-form-page">
            <button class="c-form-back j-nav-link" data-j-route="people" type="button">
              <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back
            </button>
            <form id="j-enrollment-form" class="c-form-card">
              <header class="c-form-header c-header-sky">
                <div class="c-form-header-row">
                  <h1 class="c-form-header-title c-font-display">Add Student Account</h1>
                  <span id="j-enrollment-draft-pill" class="c-draft-pill">Draft</span>
                </div>
              </header>
              <section class="c-form-body">
                <div class="c-form-section-head">
                  <h2 class="c-form-section-title">Student personal data</h2>
                  <p class="c-form-section-desc">Enter these details once; index number and email are generated
                    automatically.</p>
                </div>
                <div id="j-enrollment-notice" style="display:none;"></div>
                <div id="j-enrollment-fields" class="c-form-grid"></div>
                <footer class="c-form-footer">
                  <p class="c-required-note">Fields marked <span class="c-req-star">*</span> are required to enroll a
                    student.</p>
                  <div class="c-form-footer-actions">
                    <button id="j-enrollment-save-draft" class="c-btn-outline-sky" type="button">
                      <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path
                          d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                      </svg>
                      Save draft
                    </button>
                    <button id="j-enrollment-submit" class="c-btn-solid-sky" type="submit">
                      <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                        <path d="m9 11 3 3L22 4" />
                      </svg>
                      <span id="j-enrollment-submit-label">Enroll student</span>
                    </button>
                  </div>
                </footer>
              </section>
            </form>
          </div>
        </section>

        <!-- ============================= ADD TEACHER PAGE ============================= -->
        <section id="j-page-add-teacher" class="c-page">
          <div class="c-form-page">
            <button class="c-form-back j-nav-link" data-j-route="people" type="button">
              <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back
            </button>
            <form id="j-add-teacher-form" class="c-form-card">
              <header class="c-form-header c-header-sunshine">
                <h1 class="c-form-header-title c-font-display">Add Teacher Account</h1>
              </header>
              <div class="c-form-body">
                <div id="j-add-teacher-notice" style="display:none;"></div>
                <div id="j-add-teacher-fields" class="c-form-grid"></div>
                <section class="c-form-section"
                  style="border-top:1px solid var(--color-alabaster);padding-top:1.25rem;">
                  <h2 class="c-form-section-title" style="margin-bottom:1rem;">Professional Details</h2>
                  <div id="j-add-teacher-professional-fields" class="c-form-grid"></div>
                </section>
                <section class="c-form-section"
                  style="border-top:1px solid var(--color-alabaster);padding-top:1.25rem;">
                  <h2 class="c-form-section-title" style="margin-bottom:1rem;">Qualifications & Experience</h2>
                  <div id="j-add-teacher-qual-fields"></div>
                </section>
                <section class="c-form-section"
                  style="border-top:1px solid var(--color-alabaster);padding-top:1.25rem;">
                  <h2 class="c-form-section-title" style="margin-bottom:1rem;">Emergency Contact</h2>
                  <div id="j-add-teacher-emergency-fields" class="c-form-grid"></div>
                </section>
                <div class="c-status-note-box">
                  <div>
                    <p class="c-status-note-title">Account Status</p>
                    <p class="c-status-note-desc">New teacher accounts are marked pending verification.</p>
                  </div>
                  <span class="c-status-note-pill">Pending save</span>
                </div>
                <div
                  style="display:flex;justify-content:flex-end;border-top:1px solid var(--color-alabaster);padding-top:1rem;">
                  <button class="c-btn-solid-tone c-tone-sunshine" type="submit">
                    <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path
                        d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                    </svg>
                    Save Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <!-- ============================= ADD PARENT PAGE ============================= -->
        <section id="j-page-add-parent" class="c-page">
          <div class="c-form-page">
            <button class="c-form-back j-nav-link" data-j-route="people" type="button">
              <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back
            </button>
            <form id="j-add-parent-form" class="c-form-card">
              <header class="c-form-header c-header-terracotta">
                <h1 class="c-form-header-title c-font-display">Add Parent / Guardian Account</h1>
              </header>
              <div class="c-form-body">
                <div id="j-add-parent-notice" style="display:none;"></div>
                <div id="j-add-parent-fields" class="c-form-grid"></div>
                <div
                  style="display:flex;justify-content:flex-end;border-top:1px solid var(--color-alabaster);padding-top:1rem;">
                  <button class="c-btn-solid-tone c-tone-terracotta" type="submit">
                    <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path
                        d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                    </svg>
                    Save Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <!-- ============================= ADD MANAGEMENT PAGE ============================= -->
        <section id="j-page-add-management" class="c-page">
          <div class="c-form-page">
            <button class="c-form-back j-nav-link" data-j-route="people" type="button">
              <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back
            </button>
            <form id="j-add-management-form" class="c-form-card">
              <header class="c-form-header c-header-maroon">
                <h1 class="c-form-header-title c-font-display">Add Management Panel Account</h1>
              </header>
              <div class="c-form-body">
                <div id="j-add-management-notice" style="display:none;"></div>
                <div id="j-add-management-fields" class="c-form-grid"></div>
                <section style="border-top:1px solid var(--color-alabaster);padding-top:1.25rem;">
                  <h2 class="c-form-section-title" style="margin-bottom:1rem;">Employment details</h2>
                  <div id="j-add-management-employment-fields" class="c-form-grid"></div>
                </section>
                <section style="border-top:1px solid var(--color-alabaster);padding-top:1.25rem;">
                  <h2 class="c-form-section-title" style="margin-bottom:1rem;">Emergency Contact</h2>
                  <div id="j-add-management-emergency-fields" class="c-form-grid"></div>
                </section>
                <p class="c-form-warning-box">A temporary password would be sent to the personal email after
                  verification.</p>
                <div
                  style="display:flex;justify-content:flex-end;border-top:1px solid var(--color-alabaster);padding-top:1rem;">
                  <button class="c-btn-solid-tone c-tone-maroon" type="submit">
                    <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path
                        d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                    </svg>
                    Save Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

      </div>
    </div>
  </main>

  <!-- =====================================================================
     PROFILE MODAL + PORTAL MOUNTS
     ===================================================================== -->
  <div id="j-modal-root"></div>
  <div id="j-portal-root"></div>

</div>

<script src="/assets/js/utils.js"></script>
<script src="/assets/js/sidebar.js"></script>
<script src="/assets/features/admin_people/data.js"></script>
<script src="/assets/features/admin_people/validation.js"></script>
<script src="/assets/features/admin_people/app.js"></script>
</body>
</html>
