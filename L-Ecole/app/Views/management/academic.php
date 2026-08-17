<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT ACADEMIC OVERVIEW VIEW
 * =========================================================================
 * Responsibility: Renders the Management Academic Overview interface.
 * Role: Management (`/management/academic`)
 * Architectural Precedent: 1:1 structural port from `Management Panel/academic/index.html`.
 */

$title = "Academic Overview — L'École Management";
$featureCss = "/assets/features/management_academic/styles.css";
$currentRole = 'management';
$currentRoute = '/management/academic';

require __DIR__ . '/../components/_head.php';
?>

<div id="j-app-root" class="c-app-shell">

  <?php require __DIR__ . '/../components/_sidebar.php'; ?>

  <!-- MAIN CONTENT — ACADEMIC OVERVIEW -->
  <main class="c-main" id="j-main">
    <div class="c-main-inner">
      <div class="c-main-container">
        <div class="c-page-stack">

          <header class="c-page-header">
            <div>
              <h1 class="c-page-header__title c-font-display">Academic Overview</h1>
              <p class="c-page-header__subtitle">Manage curriculum structure, assessment progress, and term schedules.</p>
            </div>
          </header>

          <!-- CLASS SECTION PERFORMANCE + TERM 2 EXAM CALENDAR -->
          <div class="c-top-grid">
            <section class="c-panel c-performance-card">
              <div class="c-performance-card__head">
                <div class="c-panel__title-row">
                  <h2 class="c-panel__title">Class section performance</h2>
                </div>
                <div class="c-performance-card__filters">
                  <!-- grade filter select -->
                  <div class="c-select c-select--cream" id="j-select-perf-grade" style="min-width:9rem">
                    <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                      <span class="j-select-value">Grade 6</span>
                      <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div class="c-select__menu" role="listbox" aria-label="Choose grade"></div>
                  </div>
                  <!-- subject filter select -->
                  <div class="c-select c-select--cream" id="j-select-perf-subject" style="min-width:10rem">
                    <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                      <span class="j-select-value">Mathematics</span>
                      <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div class="c-select__menu" role="listbox" aria-label="Choose subject"></div>
                  </div>
                  <!-- term filter select -->
                  <div class="c-select c-select--cream" id="j-select-perf-term" style="min-width:8rem">
                    <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                      <span class="j-select-value">Term 1</span>
                      <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div class="c-select__menu" role="listbox" aria-label="Choose term"></div>
                  </div>
                </div>
              </div>

              <div class="c-performance-card__body">
                <div class="c-perf-chart" id="j-perf-chart" style="position: relative; padding-left: 32px;">
                  <div style="position: absolute; left: 0; top: 15px; bottom: 40px; width: 24px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: var(--moss); font-weight: 600; font-size: 0.875rem; letter-spacing: 0.05em; transform: rotate(-90deg); white-space: nowrap;">SCORE</span>
                  </div>
                  <div class="c-perf-chart__plot">
                    <svg class="c-perf-chart__svg" id="j-perf-chart-svg" viewBox="0 0 600 340"></svg>
                  </div>
                  <div class="c-perf-chart__legend">
                    <span class="c-perf-chart__legend-item"><span class="c-perf-chart__legend-dot" style="background:var(--sky-blue)"></span>Class average</span>
                    <span class="c-perf-chart__legend-item"><span class="c-perf-chart__legend-dot" style="background:var(--maroon)"></span>Highest average</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Term 2 examination calendar -->
            <section class="c-calendar" id="j-exam-calendar" aria-label="Term 2 examination calendar">
              <header class="c-calendar__header">
                <div class="c-calendar__header-row">
                  <div class="c-calendar__nav">
                    <button type="button" class="c-calendar__nav-btn" id="j-exam-calendar-prev" aria-label="Previous month">
                      <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button type="button" class="c-calendar__nav-btn" id="j-exam-calendar-next" aria-label="Next month">
                      <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>

                  <div class="c-calendar__month-year">
                    <div class="c-select c-select--month" id="j-select-exam-month">
                      <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                        <span class="j-select-value">June</span>
                        <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <div class="c-select__menu" role="listbox" aria-label="Choose calendar month"></div>
                    </div>
                    <div class="c-select c-select--year" id="j-select-exam-year">
                      <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                        <span class="j-select-value">2026</span>
                        <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <div class="c-select__menu" role="listbox" aria-label="Choose calendar year"></div>
                    </div>
                  </div>

                </div>
              </header>

              <div class="c-calendar__weekdays" id="j-exam-calendar-weekdays"></div>
              <div class="c-calendar__days" id="j-exam-calendar-days"></div>

              <div class="c-calendar__footer">
                <div class="c-calendar__footer-row">
                  <p class="c-calendar__event-count" id="j-exam-calendar-event-count" aria-live="polite">0 events scheduled</p>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <button type="button" class="c-calendar__view-all-btn" id="j-open-exam-day-schedule">View all</button>
                  </div>
                </div>
                <div class="c-calendar__day-detail" id="j-exam-calendar-sessions" aria-live="polite"></div>
              </div>
            </section>
          </div>

          <!-- GRADE & CLASS STRUCTURE -->
          <section class="c-structure-section">
            <div class="c-structure-section__head">
              <div class="c-structure-section__head-left">
                <div class="c-structure-section__icon-badge" aria-hidden="true">
                  <svg class="c-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
                </div>
                <div>
                  <h2 class="c-structure-section__title">Grade & class structure</h2>
                </div>
              </div>
              <button type="button" class="c-btn-add" id="j-open-add-grade">
                <svg class="c-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add grade
              </button>
            </div>

            <div class="c-grade-grid j-grade-grid" id="j-grade-grid"></div>
          </section>

          <!-- CURRICULUM SUBJECTS -->
          <section class="c-curriculum-section">
            <div class="c-curriculum-section__head">
              <div class="c-curriculum-section__head-left">
                <div class="c-curriculum-section__icon-badge" aria-hidden="true">
                  <svg class="c-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
                </div>
                <div>
                  <h2 class="c-curriculum-section__title">Curriculum subjects</h2>
                </div>
              </div>
              <button type="button" class="c-btn-add c-btn-add--small" id="j-open-add-curriculum" style="background: rgba(255,255,255,0.85); color: var(--maroon);">
                <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add subject section
              </button>
            </div>

            <div class="c-curriculum-grid j-curriculum-grid" id="j-curriculum-grid"></div>
          </section>

        </div>
      </div>
    </div>
  </main>
</div>

<!-- MODAL: ADD A GRADE -->
<div class="c-modal-layer" id="j-modal-add-grade" role="presentation">
  <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close add grade dialog"></button>
  <section class="c-modal" role="dialog" aria-modal="true" aria-labelledby="j-add-grade-title">
    <header class="c-modal__header c-modal__header--grade">
      <div class="c-modal__heading-group">
        <div class="c-modal__icon-badge c-modal__icon-badge--cherry" aria-hidden="true">
          <svg class="c-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        </div>
        <div>
          <p class="c-modal__eyebrow">Academic structure</p>
          <h2 class="c-modal__title" id="j-add-grade-title">Add a grade</h2>
        </div>
      </div>
      <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">
        <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </header>

    <form class="c-grade-form" id="j-add-grade-form">
      <div>
        <label class="c-grade-form__field-label" for="j-add-grade-name">Grade name</label>
        <input class="c-grade-form__input" id="j-add-grade-name" placeholder="e.g. Grade 14" type="text" />
        <p class="c-grade-form__hint">The grade will become available in reporting and the student directory.</p>
      </div>
      <div class="c-grade-form__footer">
        <button type="button" class="c-btn-plain j-modal-close">Cancel</button>
        <button type="submit" class="c-btn-create-grade" id="j-add-grade-submit" disabled>
          <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Create grade
        </button>
      </div>
    </form>
  </section>
</div>

<!-- MODAL: ADD / EDIT EXAM CALENDAR EVENT -->
<div class="c-modal-layer" id="j-modal-exam-editor" role="presentation">
  <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close event editor"></button>
  <section class="c-modal" role="dialog" aria-modal="true" aria-labelledby="j-exam-editor-title">
    <header class="c-modal__header c-modal__header--event">
      <div class="c-modal__heading-group">
        <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">
          <svg class="c-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 19h6"/><path d="M16 2v4"/><path d="M19 16v6"/><path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.598"/><path d="M3 10h18"/><path d="M8 2v4"/></svg>
        </div>
        <div>
          <p class="c-modal__eyebrow" id="j-exam-editor-month">June 2026 exam calendar</p>
          <h2 class="c-modal__title" id="j-exam-editor-title">Add an event</h2>
          <p class="c-modal__description">This event is saved to the exam calendar for this session.</p>
        </div>
      </div>
      <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close event editor">
        <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </header>

    <form class="c-event-form" id="j-exam-event-form" novalidate>
      <div class="c-event-form__error-banner" id="j-exam-event-error-banner">
        Complete the highlighted event details before saving.
      </div>

      <div>
        <label class="c-field-label" for="j-exam-field-category">Event category</label>
        <select class="c-field-input" id="j-exam-field-category">
          <option value="Other">General / Other</option>
          <option value="Academic" selected>Academic</option>
          <option value="Extracurricular">Extracurricular</option>
        </select>
      </div>

      <div id="j-exam-field-extracurricular-wrap" style="display: none; margin-top: 1rem;">
        <label class="c-field-label" for="j-exam-field-extracurricular-target">Sport / Club / Society</label>
        <select class="c-field-input" id="j-exam-field-extracurricular-target">
          <option value="">Select target...</option>
          <optgroup label="Sports">
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
            <option value="Swimming">Swimming</option>
            <option value="Athletics">Athletics</option>
          </optgroup>
          <optgroup label="Clubs & Societies">
            <option value="Science Society">Science Society</option>
            <option value="Debate">Debate</option>
            <option value="Music">Music</option>
            <option value="Robotics">Robotics</option>
          </optgroup>
        </select>
      </div>

      <div style="margin-top: 1rem;">
        <label class="c-field-label">Visible to (Audiences)</label>
        <div class="c-multi-select" id="j-exam-audience-select" style="position: relative; margin-top: 0.25rem;">
          <div class="c-field-input" id="j-exam-audience-trigger" style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 38px; align-items: center; cursor: pointer; padding: 4px 8px;">
            <span style="color: var(--midnight); opacity: 0.5; font-size: 0.875rem; padding: 4px;" id="j-exam-audience-placeholder">Select audiences...</span>
          </div>
          <div id="j-exam-audience-menu" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--color-border); border-radius: 6px; margin-top: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; max-height: 200px; overflow-y: auto;">
            <div class="j-exam-audience-option" data-val="Students" style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">Students<span class="j-exam-audience-check" style="display:none; color: var(--color-sunshine);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></div>
            <div class="j-exam-audience-option" data-val="Teachers" style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">Teachers<span class="j-exam-audience-check" style="display:none; color: var(--color-sunshine);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></div>
            <div class="j-exam-audience-option" data-val="Parents" style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">Parents<span class="j-exam-audience-check" style="display:none; color: var(--color-sunshine);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></div>
            <div class="j-exam-audience-option" data-val="Management" style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">Management<span class="j-exam-audience-check" style="display:none; color: var(--color-sunshine);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></div>
          </div>
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <label class="c-field-label" for="j-exam-field-time">Time</label>
        <input class="c-field-input" id="j-exam-field-time" placeholder="e.g. 08:30–10:30" type="text" />
        <p class="c-field-error" id="j-exam-field-time-error">Enter the event time.</p>
      </div>

      <div>
        <label class="c-field-label" for="j-exam-field-title">Event title</label>
        <input class="c-field-input" id="j-exam-field-title" placeholder="e.g. Chemistry practical assessment" type="text" />
        <p class="c-field-error" id="j-exam-field-title-error">Enter an event title.</p>
      </div>

      <div>
        <label class="c-field-label" for="j-exam-field-details">Details or location</label>
        <textarea class="c-field-input c-field-input--textarea" id="j-exam-field-details" placeholder="e.g. Grades 9–11 · Computer laboratories"></textarea>
        <p class="c-field-error" id="j-exam-field-details-error">Add details or a location.</p>
      </div>

      <footer class="c-event-form__footer">
        <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
        <button type="submit" class="c-btn c-btn--solid">
          <svg class="c-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 19h6"/><path d="M16 2v4"/><path d="M19 16v6"/><path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.598"/><path d="M3 10h18"/><path d="M8 2v4"/></svg>
          <span id="j-exam-submit-label">Save event</span>
        </button>
      </footer>
    </form>
  </section>
</div>

<!-- MODAL: FULL DAY SCHEDULE -->
<div class="c-modal-layer c-modal-layer--day-schedule" id="j-modal-exam-day-schedule" role="presentation">
  <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close day schedule"></button>
  <section class="c-modal c-modal--day-schedule" role="dialog" aria-modal="true" aria-labelledby="j-exam-day-schedule-title" tabindex="-1">
    <header class="c-modal__header">
      <div class="c-modal__heading-group">
        <span class="c-modal__icon-badge c-modal__icon-badge--sky-solid" aria-hidden="true">
          <svg class="c-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
        </span>
        <div>
          <p class="c-modal__eyebrow">Day schedule</p>
          <h2 class="c-modal__title" id="j-exam-day-schedule-title"></h2>
          <p class="c-modal__description" id="j-exam-day-schedule-description"></p>
        </div>
      </div>
      <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close day schedule">
        <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </header>
    <div class="c-day-schedule__body" id="j-exam-day-schedule-body"></div>
  </section>
</div>

<!-- shared chart tooltip -->
<div class="c-chart-tooltip" id="j-chart-tooltip" role="status"></div>

<script src="/assets/js/utils.js"></script>
<script src="/assets/features/management_academic/data.js"></script>
<script src="/assets/features/management_academic/script.js"></script>
<script src="/assets/js/sidebar.js"></script>
</body>
</html>
