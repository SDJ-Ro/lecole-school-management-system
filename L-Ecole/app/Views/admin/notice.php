<?php
/**
 * =========================================================================
 * L'ÉCOLE — ADMIN NOTICE BOARD VIEW
 * =========================================================================
 * Responsibility: Renders the Admin Notice Board interface.
 * Role: Admin (`/admin/notice`)
 * Architectural Precedent: 1:1 structural port from `Admin/Notice/index.html`.
 */

$title = "L'École Notice Board";
$featureCss = "/assets/features/admin_notice/styles.css";
$currentRole = 'admin';
$currentRoute = '/admin/notice';

require __DIR__ . '/../components/_head.php';
?>

<div id="j-app-root" class="c-app-shell">

  <?php require __DIR__ . '/../components/_sidebar.php'; ?>

  <!-- MAIN CONTENT -->
  <main class="c-main" id="j-main">
    <div class="c-main-inner">
      <div class="c-main-container">
        <div class="c-page-stack">

          <!-- VIEW 1 — NOTICE BOARD -->
          <section class="c-view c-is-active" id="j-view-notice-board" data-view="notices">

            <header class="c-page-header">
              <div>
                <h1 class="c-page-header__title c-font-display">Notice Board</h1>
                <p class="c-page-header__subtitle">Manage institutional announcements across all audiences.</p>
              </div>
              <button type="button" class="c-btn c-btn--sky j-go-post-notice">
                <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Post Notice
              </button>
            </header>

            <section class="c-filter-bar" aria-label="Filter notices">
              <label class="c-search-field">
                <span class="c-sr-only">Search notices</span>
                <svg class="c-icon c-search-field__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" class="c-search-field__input j-search-input" placeholder="Search notices..." autocomplete="off" />
              </label>
              <div class="c-filter-bar__selects">
                <!-- Audience Filter Select -->
                <div class="c-select" id="j-select-audience-filter" aria-label="Filter by audience">
                  <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                    <span class="c-select__value j-select-value">All</span>
                    <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div class="c-select__menu" role="listbox" aria-label="Filter by audience">
                    <div class="c-select__option c-is-selected" data-value="All" role="option">All</div>
                    <div class="c-select__option" data-value="Students" role="option">Students</div>
                    <div class="c-select__option" data-value="Teachers" role="option">Teachers</div>
                    <div class="c-select__option" data-value="Parents" role="option">Parents</div>
                    <div class="c-select__option" data-value="Management" role="option">Management</div>
                  </div>
                </div>
                <!-- Category Filter Select -->
                <div class="c-select" id="j-select-category-filter" aria-label="Filter by category">
                  <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                    <span class="c-select__value j-select-value">All</span>
                    <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div class="c-select__menu" role="listbox" aria-label="Filter by category">
                    <div class="c-select__option c-is-selected" data-value="All" role="option">All</div>
                    <div class="c-select__option" data-value="Academic" role="option">Academic</div>
                    <div class="c-select__option" data-value="Administrative" role="option">Administrative</div>
                    <div class="c-select__option" data-value="Events & Sports" role="option">Events & Sports</div>
                    <div class="c-select__option" data-value="General" role="option">General</div>
                    <div class="c-select__option" data-value="Urgent" role="option">Urgent</div>
                  </div>
                </div>
              </div>
            </section>

            <div class="c-notice-grid" id="j-notice-grid"></div>

            <div class="c-empty-state" id="j-empty-state" hidden>
              <p class="c-empty-state__message">No notices found matching your filters.</p>
              <button type="button" class="c-btn c-btn--link c-empty-state__clear j-clear-filters">Clear filters</button>
            </div>
          </section>

          <!-- VIEW 2 — POST NOTICE -->
          <section class="c-view" id="j-view-post-notice" data-view="post-notice">
            <div class="c-post-notice">
              <button type="button" class="c-back-link j-go-notice-board">
                <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back
              </button>

              <form class="c-notice-form" id="j-post-notice-form" novalidate>
                <header class="c-notice-form__header">
                  <h1 class="c-notice-form__header-title c-font-display">Post New Notice</h1>
                  <p class="c-notice-form__header-subtitle">Create and publish an announcement to the school portal.</p>
                </header>

                <div class="c-notice-form__body">
                  <div class="c-info-banner">
                    <svg class="c-icon c-info-banner__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    <p class="c-info-banner__text">Notices appear immediately on the central board for the selected audience.</p>
                  </div>

                  <p class="c-form-message j-post-form-message" aria-live="polite"></p>

                  <div class="c-form-grid">
                    <div class="c-form-field c-form-field--span-2">
                      <label class="c-form-field__label" for="j-post-title">Notice Title <span class="c-form-field__required">*</span></label>
                      <input type="text" id="j-post-title" class="c-text-input" placeholder="e.g. End of Term Examinations Schedule" />
                    </div>

                    <div class="c-form-field">
                      <span class="c-form-field__label">Category <span class="c-form-field__required">*</span></span>
                      <div class="c-select" id="j-select-post-category" aria-label="Category">
                        <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                          <span class="c-select__value j-select-value">Select category</span>
                          <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div class="c-select__menu" role="listbox" aria-label="Category">
                          <div class="c-select__option" data-value="Academic" role="option">Academic</div>
                          <div class="c-select__option" data-value="Administrative" role="option">Administrative</div>
                          <div class="c-select__option" data-value="Events & Sports" role="option">Events & Sports</div>
                          <div class="c-select__option" data-value="General" role="option">General</div>
                          <div class="c-select__option" data-value="Urgent" role="option">Urgent</div>
                        </div>
                      </div>
                    </div>

                    <div class="c-form-field">
                      <span class="c-form-field__label">Target Audience <span class="c-form-field__required">*</span></span>
                      <div class="c-tag-field" id="j-post-audience-field">
                        <div class="c-tag-field__chips j-tag-chips"></div>
                        <div class="c-select" id="j-select-post-audience" aria-label="Add audience">
                          <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                            <span class="c-select__value j-select-value">Add audience…</span>
                            <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                          <div class="c-select__menu" role="listbox" aria-label="Add audience">
                            <div class="c-select__option" data-value="All" role="option">All</div>
                            <div class="c-select__option" data-value="Students" role="option">Students</div>
                            <div class="c-select__option" data-value="Teachers" role="option">Teachers</div>
                            <div class="c-select__option" data-value="Parents" role="option">Parents</div>
                            <div class="c-select__option" data-value="Management" role="option">Management</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="c-form-field c-form-field--span-2">
                      <label class="c-form-field__label" for="j-post-body">Message Body <span class="c-form-field__required">*</span></label>
                      <textarea id="j-post-body" class="c-textarea" rows="6" placeholder="Write your announcement here..."></textarea>
                    </div>

                    <div class="c-form-field c-form-field--span-2">
                      <span class="c-form-field__label">Attachments</span>
                      <input type="file" id="j-post-attachment-input" class="c-sr-only" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                      <button type="button" class="c-file-drop j-attachment-trigger">
                        <svg class="c-icon c-file-drop__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.234 20.252 21 12.3"/><path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"/></svg>
                        <span class="c-file-drop__filename j-attachment-name">Click to upload a file</span>
                        <span class="c-file-drop__hint">PDF, DOCX, JPG or PNG (max 5MB)</span>
                      </button>
                    </div>

                    <div class="c-form-field c-form-field--span-2">
                      <div class="c-checkbox j-checkbox" id="j-post-pin-checkbox">
                        <button type="button" class="c-checkbox__box" role="checkbox" aria-checked="false" id="j-post-pin-box">
                          <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </button>
                        <label class="c-checkbox__label" for="j-post-pin-box">Pin this notice to the top of the board</label>
                      </div>
                    </div>
                  </div>

                  <div class="c-notice-form__footer">
                    <button type="submit" class="c-btn c-btn--dark">
                      <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
                      Publish Notice
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>

        </div>
      </div>
    </div>
  </main>
</div>

<!-- MODAL: NOTICE DETAIL / EDIT / DELETE -->
<div class="c-modal-layer" id="j-modal-notice" role="presentation">
  <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close notice dialog"></button>
  <section class="c-modal" role="dialog" aria-modal="true" id="j-modal-notice-panel">
    
    <!-- VIEW MODE -->
    <div id="j-modal-view-mode" style="display:none;">
      <div class="c-modal__accent-bar" id="j-modal-view-accent"></div>
      <div class="c-modal__scroll">
        <div class="c-modal__view-body">
          <div class="c-modal__view-top">
            <div class="c-notice-card__tags" id="j-modal-view-tags"></div>
            <div class="c-modal__view-actions">
              <span class="c-modal__view-pin" id="j-modal-view-pin" style="display:none;" aria-label="Pinned notice">
                <svg class="c-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
              </span>
              <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close notice">
                <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>
          <h2 class="c-modal__title c-font-display" id="j-modal-view-title"></h2>
          <p class="c-modal__body-text" id="j-modal-view-body"></p>
          <footer class="c-modal__view-footer">
            <div class="c-modal__view-author">
              <span class="c-avatar c-modal__author-avatar" id="j-modal-view-author-initials"></span>
              <div>
                <p class="c-modal__author-name" id="j-modal-view-author-name"></p>
                <p class="c-modal__author-date" id="j-modal-view-author-date"></p>
              </div>
            </div>
            <button type="button" class="c-btn c-btn--sky j-modal-edit-trigger">
              <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              Edit notice
            </button>
          </footer>
        </div>
      </div>
    </div>

    <!-- DELETE MODE -->
    <div id="j-modal-delete-mode" class="c-modal__delete-body" style="display:none;">
      <span class="c-modal__delete-icon">
        <svg class="c-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </span>
      <h2 class="c-modal__delete-title c-font-display">Delete notice?</h2>
      <p class="c-modal__delete-text">This will remove the notice from the central Notice Board.</p>
      <div class="c-modal__delete-actions">
        <button type="button" class="c-btn c-btn--outline j-modal-cancel-delete">Cancel</button>
        <button type="button" class="c-btn c-btn--danger j-modal-confirm-delete">Delete notice</button>
      </div>
    </div>

    <!-- EDIT MODE -->
    <form class="c-modal__edit-form" id="j-edit-notice-form" style="display:none;" novalidate>
      <header class="c-modal__edit-header">
        <div>
          <h2 class="c-modal__edit-title c-font-display">Edit notice</h2>
          <p class="c-modal__edit-subtitle">Update this announcement for the central Notice Board.</p>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Cancel editing">
          <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </header>
      <div class="c-modal__edit-body">
        <div class="c-form-field">
          <label class="c-form-field__label" for="j-edit-title">Notice title</label>
          <input type="text" id="j-edit-title" class="c-text-input" required />
        </div>
        <div class="c-form-field">
          <span class="c-form-field__label">Category</span>
          <div class="c-select" id="j-select-edit-category" aria-label="Category">
            <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
              <span class="c-select__value j-select-value">Select category</span>
              <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="c-select__menu" role="listbox" aria-label="Category">
              <div class="c-select__option" data-value="Academic" role="option">Academic</div>
              <div class="c-select__option" data-value="Administrative" role="option">Administrative</div>
              <div class="c-select__option" data-value="Events & Sports" role="option">Events & Sports</div>
              <div class="c-select__option" data-value="General" role="option">General</div>
              <div class="c-select__option" data-value="Urgent" role="option">Urgent</div>
            </div>
          </div>
        </div>
        <div class="c-form-field">
          <span class="c-form-field__label">Target audience</span>
          <div class="c-tag-field" id="j-edit-audience-field">
            <div class="c-tag-field__chips j-tag-chips"></div>
            <div class="c-select" id="j-select-edit-audience" aria-label="Add audience">
              <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                <span class="c-select__value j-select-value">Add audience…</span>
                <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div class="c-select__menu" role="listbox" aria-label="Add audience">
                <div class="c-select__option" data-value="All users" role="option">All users</div>
                <div class="c-select__option" data-value="Students" role="option">Students</div>
                <div class="c-select__option" data-value="Teachers" role="option">Teachers</div>
                <div class="c-select__option" data-value="Parents" role="option">Parents</div>
                <div class="c-select__option" data-value="Management" role="option">Management</div>
              </div>
            </div>
          </div>
        </div>
        <div class="c-form-field">
          <label class="c-form-field__label" for="j-edit-body">Message body</label>
          <textarea id="j-edit-body" class="c-textarea c-textarea--edit" rows="6" required></textarea>
        </div>
        <div class="c-checkbox j-checkbox" id="j-edit-pin-checkbox">
          <button type="button" class="c-checkbox__box" role="checkbox" aria-checked="false" id="j-edit-pin-box">
            <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
          <label class="c-checkbox__label" for="j-edit-pin-box">Pin this notice to the top</label>
        </div>
      </div>
      <footer class="c-modal__edit-footer">
        <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
        <button type="submit" class="c-btn c-btn--sky">Save changes</button>
      </footer>
    </form>

  </section>
</div>

<script src="/assets/js/utils.js"></script>
<script src="/assets/js/sidebar.js"></script>
<script src="/assets/features/admin_notice/data.js"></script>
<script src="/assets/features/admin_notice/script.js"></script>
</body>
</html>
