<?php
/**
 * =========================================================================
 * L'ÉCOLE — ADMIN AUDIT LOGS VIEW
 * =========================================================================
 * Responsibility: Renders the Admin Audit Logs interface.
 * Role: Admin (`/admin/audit`)
 * Architectural Precedent: 1:1 structural port from `Admin/audit/index.html`.
 */

$title = "L'École — Audit Logs";
$featureCss = "/assets/features/admin_audit/styles.css";
$currentRole = 'admin';
$currentRoute = '/admin/audit';

require __DIR__ . '/../components/_head.php';
?>

<div id="j-app-root" class="c-app-shell">

  <?php require __DIR__ . '/../components/_sidebar.php'; ?>

  <!-- MAIN CONTENT -->
  <main class="c-main" id="j-main">
    <div class="c-main-inner">
      <div class="c-main-container">
        <div class="c-page-stack">

          <header class="c-audit-header">
            <div>
              <h1 class="c-page-header__title c-font-display">Audit Logs</h1>
              <p class="c-page-header__subtitle">System-wide activity tracking and security monitoring.</p>
            </div>
          </header>

          <!-- TOOLBAR: search + activity/actor filters -->
          <div class="c-toolbar">
            <div class="c-search-field">
              <svg class="c-icon c-search-field__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="search" class="c-search-field__input j-search-input" id="j-search-input" placeholder="Search by actor or details..." autocomplete="off" />
            </div>

            <div class="c-toolbar__filters">
              <div class="c-select c-select--sky c-select--filter" id="j-select-activity" data-filter-key="activity">
                <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                  <span class="c-select__value j-select-value">All activities</span>
                  <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <ul class="c-select__menu" role="listbox">
                  <li><button type="button" class="c-select__option c-is-selected" role="option" data-value="All activities">All activities <svg class="c-icon c-select__option-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Mark Edit">Mark Edit</button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Notice Posted">Notice Posted</button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Logout">Logout</button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Cert. Authorised">Cert. Authorised</button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Login">Login</button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Account Activation">Account Activation</button></li>
                </ul>
              </div>

              <div class="c-select c-select--sky c-select--filter c-select--narrow" id="j-select-actor" data-filter-key="actor">
                <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                  <span class="c-select__value j-select-value">All actors</span>
                  <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <ul class="c-select__menu" role="listbox">
                  <li><button type="button" class="c-select__option c-is-selected" role="option" data-value="All actors">All actors <svg class="c-icon c-select__option-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Management">Management</button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Teacher">Teacher</button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="Parent">Parent</button></li>
                  <li><button type="button" class="c-select__option" role="option" data-value="System">System</button></li>
                </ul>
              </div>

              <div class="c-toolbar__sliders" aria-hidden="true">
                <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
              </div>
            </div>
          </div>

          <!-- AUDIT LOG LIST -->
          <div class="c-log-list" id="j-log-list" aria-live="polite">

            <article class="c-log-card c-theme-management j-log-card" data-role="Management" data-action="Mark Edit"
              data-search="alex thompson mark edit updated term 1 mathematics score for nethmi perera (S2021-091).">
              <div class="c-log-card__row">
                <div class="c-log-card__actor">
                  <div class="c-log-card__avatar">AT</div>
                  <div class="c-log-card__actor-text">
                    <span class="c-tag c-log-card__actor-pill">Alex Thompson</span>
                    <span class="c-log-card__actor-role">Management account</span>
                  </div>
                </div>
                <div class="c-log-card__body">
                  <span class="c-tag c-tone-tan">Mark Edit</span>
                  <p class="c-log-card__details">Updated Term 1 Mathematics score for Nethmi Perera (S2021-091).</p>
                  <div class="c-log-card__time">
                    <p class="c-log-card__date">2024-06-15</p>
                    <p class="c-log-card__clock">09:42:11</p>
                  </div>
                </div>
              </div>
              <div class="c-log-card__footer">
                <span class="c-log-card__linked">Linked student: Nethmi Perera · S2021-091</span>
              </div>
            </article>

            <article class="c-log-card c-theme-system j-log-card" data-role="System" data-action="Notice Posted"
              data-search="system notice posted auto-published scheduled notice: “end of term examinations schedule”.">
              <div class="c-log-card__row">
                <div class="c-log-card__actor">
                  <div class="c-log-card__avatar">S</div>
                  <div class="c-log-card__actor-text">
                    <span class="c-tag c-log-card__actor-pill">System</span>
                    <span class="c-log-card__actor-role">System account</span>
                  </div>
                </div>
                <div class="c-log-card__body">
                  <span class="c-tag c-tone-tan">Notice Posted</span>
                  <p class="c-log-card__details">Auto-published scheduled notice: “End of Term Examinations Schedule”.</p>
                  <div class="c-log-card__time">
                    <p class="c-log-card__date">2024-06-15</p>
                    <p class="c-log-card__clock">09:15:00</p>
                  </div>
                </div>
              </div>
              <div class="c-log-card__footer">
              </div>
            </article>

            <article class="c-log-card c-theme-teacher j-log-card" data-role="Teacher" data-action="Logout"
              data-search="mrs. ratnayake logout user logged out successfully after updating the music department notice board.">
              <div class="c-log-card__row">
                <div class="c-log-card__actor">
                  <div class="c-log-card__avatar">MR</div>
                  <div class="c-log-card__actor-text">
                    <span class="c-tag c-log-card__actor-pill">Mrs. Ratnayake</span>
                    <span class="c-log-card__actor-role">Teacher account</span>
                  </div>
                </div>
                <div class="c-log-card__body">
                  <span class="c-tag c-tone-tan">Logout</span>
                  <p class="c-log-card__details">User logged out successfully after updating the music department notice board.</p>
                  <div class="c-log-card__time">
                    <p class="c-log-card__date">2024-06-14</p>
                    <p class="c-log-card__clock">16:30:22</p>
                  </div>
                </div>
              </div>
              <div class="c-log-card__footer">
              </div>
            </article>

            <article class="c-log-card c-theme-management j-log-card" data-role="Management" data-action="Cert. Authorised"
              data-search="alex thompson cert. authorised signed off character certificate for julian montgomery (S2024-096).">
              <div class="c-log-card__row">
                <div class="c-log-card__actor">
                  <div class="c-log-card__avatar">AT</div>
                  <div class="c-log-card__actor-text">
                    <span class="c-tag c-log-card__actor-pill">Alex Thompson</span>
                    <span class="c-log-card__actor-role">Management account</span>
                  </div>
                </div>
                <div class="c-log-card__body">
                  <span class="c-tag c-tone-tan">Cert. Authorised</span>
                  <p class="c-log-card__details">Signed off Character Certificate for Julian Montgomery (S2024-096).</p>
                  <div class="c-log-card__time">
                    <p class="c-log-card__date">2024-06-14</p>
                    <p class="c-log-card__clock">14:20:05</p>
                  </div>
                </div>
              </div>
              <div class="c-log-card__footer">
                <span class="c-log-card__linked">Linked student: Julian Montgomery · S2024-096</span>
              </div>
            </article>

            <article class="c-log-card c-theme-teacher j-log-card" data-role="Teacher" data-action="Login"
              data-search="james wilson login user logged in successfully from the science department workstation.">
              <div class="c-log-card__row">
                <div class="c-log-card__actor">
                  <div class="c-log-card__avatar">JW</div>
                  <div class="c-log-card__actor-text">
                    <span class="c-tag c-log-card__actor-pill">James Wilson</span>
                    <span class="c-log-card__actor-role">Teacher account</span>
                  </div>
                </div>
                <div class="c-log-card__body">
                  <span class="c-tag c-tone-tan">Login</span>
                  <p class="c-log-card__details">User logged in successfully from the Science department workstation.</p>
                  <div class="c-log-card__time">
                    <p class="c-log-card__date">2024-06-14</p>
                    <p class="c-log-card__clock">08:05:12</p>
                  </div>
                </div>
              </div>
              <div class="c-log-card__footer">
              </div>
            </article>

            <article class="c-log-card c-theme-parent j-log-card" data-role="Parent" data-action="Account Activation"
              data-search="mr. kapoor account activation activated parent account for maya kapoor (S2022-092).">
              <div class="c-log-card__row">
                <div class="c-log-card__actor">
                  <div class="c-log-card__avatar">MK</div>
                  <div class="c-log-card__actor-text">
                    <span class="c-tag c-log-card__actor-pill">Mr. Kapoor</span>
                    <span class="c-log-card__actor-role">Parent account</span>
                  </div>
                </div>
                <div class="c-log-card__body">
                  <span class="c-tag c-tone-tan">Account Activation</span>
                  <p class="c-log-card__details">Activated parent account for Maya Kapoor (S2022-092).</p>
                  <div class="c-log-card__time">
                    <p class="c-log-card__date">2024-06-13</p>
                    <p class="c-log-card__clock">11:10:45</p>
                  </div>
                </div>
              </div>
              <div class="c-log-card__footer">
                <span class="c-log-card__linked">Linked student: Maya Kapoor · S2022-092</span>
              </div>
            </article>

            <div class="c-log-empty" id="j-log-empty" hidden>No audit events match those filters.</div>
          </div>

        </div>
      </div>
    </div>
  </main>
</div>

<!-- MODAL: AUDIT EVENT DETAIL -->
<div class="c-modal-layer" id="j-modal-audit-detail" role="presentation">
  <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close audit log details"></button>
  <section class="c-modal" role="dialog" aria-modal="true" aria-labelledby="j-audit-detail-title">
    <header class="c-modal__header" id="j-audit-detail-header">
      <div>
        <p class="c-modal__eyebrow">Audit event details</p>
        <h2 class="c-modal__title" id="j-audit-detail-title"></h2>
      </div>
      <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">
        <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </header>

    <div class="c-audit-detail__body">
      <div class="c-audit-detail__summary" id="j-audit-detail-summary">
        <div class="c-audit-detail__tags">
          <span class="c-tag" id="j-audit-detail-tag-action"></span>
          <span class="c-tag c-audit-detail__role-pill" id="j-audit-detail-tag-role"></span>
        </div>
        <p class="c-audit-detail__details" id="j-audit-detail-details"></p>
        <div class="c-audit-detail__meta">
          <span class="c-audit-detail__meta-item">
            <svg class="c-icon c-audit-detail__meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            <span id="j-audit-detail-time"></span>
          </span>
          <span class="c-audit-detail__meta-item">
            <svg class="c-icon c-audit-detail__meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
          </span>
        </div>
      </div>

      <div class="c-audit-detail__grid" id="j-audit-detail-grid">
        <article class="c-audit-detail__student" id="j-audit-detail-student" hidden>
          <div class="c-audit-detail__card-heading">
            <svg class="c-icon c-audit-detail__card-heading-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
            <h3>Connected student</h3>
          </div>
          <div class="c-audit-detail__card-body">
            <div class="c-audit-detail__avatar c-audit-detail__avatar--student" id="j-audit-detail-student-initials"></div>
            <div class="c-audit-detail__card-text">
              <p class="c-audit-detail__card-name" id="j-audit-detail-student-name"></p>
              <p class="c-audit-detail__card-sub" id="j-audit-detail-student-meta"></p>
            </div>
          </div>
        </article>

        <article class="c-audit-detail__actor" id="j-audit-detail-actor">
          <div class="c-audit-detail__card-heading">
            <svg class="c-icon c-audit-detail__card-heading-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            <h3>Actor profile</h3>
          </div>
          <div class="c-audit-detail__card-body">
            <div class="c-audit-detail__avatar" id="j-audit-detail-actor-initials"></div>
            <div class="c-audit-detail__card-text">
              <span class="c-tag c-audit-detail__actor-pill" id="j-audit-detail-actor-name"></span>
              <span class="c-audit-detail__card-role" id="j-audit-detail-actor-role"></span>
            </div>
          </div>
          <p class="c-audit-detail__verified">
            <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Verified institutional account
          </p>
        </article>
      </div>
    </div>
  </section>
</div>

<script src="/assets/js/utils.js"></script>
<script src="/assets/js/sidebar.js"></script>
<script src="/assets/features/admin_audit/data.js"></script>
<script src="/assets/features/admin_audit/script.js"></script>
</body>
</html>
