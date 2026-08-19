/* =========================================================================
   L'ÉCOLE — AUDIT LOGS — APPLICATION SCRIPT
   -------------------------------------------------------------------------
   DESIGN PRINCIPLE: this file only contains things that genuinely need to
   run in the browser — user interaction and state that changes after load.
   The audit log cards and the filter/select option lists are static
   content that never changes shape at runtime, so they are hand-authored
   directly in index.html and this file merely ATTACHES behaviour to them
   by reading their data-* attributes and toggling c-is-* state classes.

   Sections in this file:
     1. Sidebar behaviour (collapse + nav selection)
     2. Custom select dropdown behaviour (activity / actor filters)
     3. Audit log search + filter logic
     4. Generic modal open / close (shared machinery)
     5. Audit event detail modal — populate from a clicked card's data-*
     6. CSV export
     7. App bootstrap
   Naming reminder: elements this script queries are marked with the j-*
   class or id prefix (see the styles.css header comment for the full rule).
   ========================================================================= */

(function () {
  'use strict';



  /* =======================================================================
     2. CUSTOM SELECT DROPDOWN BEHAVIOUR (activity / actor filters)
     -------------------------------------------------------------------------
     Each .c-select follows the same pattern: click the trigger to open or
     close it, click an option to choose it, Escape or an outside click to
     dismiss it. The option list itself is static markup (see index.html),
     so this only ever toggles c-is-selected/c-is-open — it never builds menus.
     ======================================================================= */

  const AUDIENCE_COLORS = {
    'Students': { bg: 'rgba(23, 162, 184, 0.1)', color: '#17a2b8', border: 'rgba(23, 162, 184, 0.3)' },
    'Teachers': { bg: 'rgba(234, 137, 19, 0.12)', color: '#EA8913', border: 'rgba(234, 137, 19, 0.35)' },
    'Teacher': { bg: 'rgba(234, 137, 19, 0.12)', color: '#EA8913', border: 'rgba(234, 137, 19, 0.35)' },
    'Parents': { bg: 'rgba(232, 92, 53, 0.1)', color: '#e85c35', border: 'rgba(232, 92, 53, 0.3)' },
    'Parent': { bg: 'rgba(232, 92, 53, 0.1)', color: '#e85c35', border: 'rgba(232, 92, 53, 0.3)' },
    'Management': { bg: 'rgba(127, 3, 3, 0.08)', color: '#7F0303', border: 'rgba(127, 3, 3, 0.3)' },
    'All users': { bg: 'rgba(216, 186, 152, 0.22)', color: '#b48d61', border: 'rgba(216, 186, 152, 0.45)' },
    'System': { bg: 'rgba(216, 186, 152, 0.22)', color: '#b48d61', border: 'rgba(216, 186, 152, 0.45)' }
  };

  function updateActorSelectStyle(selectEl) {
    if (selectEl.id !== 'j-select-actor') return;
    const trigger = selectEl.querySelector('.c-select__trigger');
    const valueEl = selectEl.querySelector('.j-select-value');
    const value = valueEl.textContent.trim();
    const theme = AUDIENCE_COLORS[value];
    if (theme) {
      trigger.style.setProperty('background', theme.bg, 'important');
      trigger.style.setProperty('color', theme.color, 'important');
      trigger.style.setProperty('border', `1px solid ${theme.border}`, 'important');
      const chev = trigger.querySelector('.c-select__chevron, .c-select__icon');
      if (chev) chev.style.setProperty('color', theme.color, 'important');
    } else {
      trigger.style.removeProperty('background');
      trigger.style.removeProperty('color');
      trigger.style.removeProperty('border');
      const chev = trigger.querySelector('.c-select__chevron, .c-select__icon');
      if (chev) chev.style.removeProperty('color');
    }
  }

  function initFilterSelects() {
    const selectEls = Array.from(document.querySelectorAll('.c-select--filter'));

    function closeSelect(selectEl) {
      selectEl.classList.remove('c-is-menu-visible');
      selectEl.classList.remove('c-is-open');
      selectEl.querySelector('.c-select__trigger').setAttribute('aria-expanded', 'false');
    }

    function closeAllSelects(exceptEl) {
      selectEls.forEach((selectEl) => {
        if (selectEl !== exceptEl) closeSelect(selectEl);
      });
    }

    selectEls.forEach((selectEl) => {
      const trigger = selectEl.querySelector('.c-select__trigger');
      const valueEl = selectEl.querySelector('.j-select-value');
      const options = Array.from(selectEl.querySelectorAll('.c-select__option'));

      if (selectEl.id === 'j-select-actor') {
        options.forEach((option) => {
          const val = option.dataset.value;
          const theme = AUDIENCE_COLORS[val];
          if (theme) {
            option.style.setProperty('color', theme.color, 'important');
            option.addEventListener('mouseenter', () => {
              option.style.setProperty('background', theme.bg, 'important');
            });
            option.addEventListener('mouseleave', () => {
              if (!option.classList.contains('c-is-selected')) {
                option.style.removeProperty('background');
              }
            });
          }
        });
        updateActorSelectStyle(selectEl);
      }

      trigger.addEventListener('click', () => {
        const willOpen = !selectEl.classList.contains('c-is-open');
        closeAllSelects(selectEl);
        if (willOpen) {
          selectEl.classList.add('c-is-open');
          requestAnimationFrame(() => selectEl.classList.add('c-is-menu-visible'));
        } else {
          closeSelect(selectEl);
        }
        trigger.setAttribute('aria-expanded', String(willOpen));
      });

      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((opt) => {
            opt.classList.remove('c-is-selected');
            opt.style.removeProperty('background');
          });
          option.classList.add('c-is-selected');
          const val = option.dataset.value;
          const theme = AUDIENCE_COLORS[val];
          if (theme) {
            option.style.setProperty('background', theme.bg, 'important');
          }
          valueEl.textContent = val;
          closeSelect(selectEl);
          trigger.focus();
          if (selectEl.id === 'j-select-actor') {
            updateActorSelectStyle(selectEl);
          }
          applyLogFilters();
        });
      });
    });

    document.addEventListener('click', (event) => {
      const clickedInsideAnySelect = selectEls.some((el) => el.contains(event.target));
      if (!clickedInsideAnySelect) closeAllSelects();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAllSelects();
    });
  }

  /* =======================================================================
     3. AUDIT LOG SEARCH + FILTER LOGIC
     ======================================================================= */

  let applyLogFilters = function () { }; // reassigned by initLogFilters()

  function initLogFilters() {
    const searchInput = document.getElementById('j-search-input');
    const logCards = Array.from(document.querySelectorAll('.j-log-card'));
    const logEmptyState = document.getElementById('j-log-empty');
    const exportCountEl = document.getElementById('j-export-count');
    const activityValueEl = document.querySelector('#j-select-activity .j-select-value');
    const actorValueEl = document.querySelector('#j-select-actor .j-select-value');

    applyLogFilters = function () {
      const query = searchInput.value.trim().toLowerCase();
      const activityFilter = activityValueEl.textContent;
      const actorFilter = actorValueEl.textContent;

      let visibleCount = 0;
      logCards.forEach((card) => {
        const matchesQuery = card.dataset.search.includes(query);
        const matchesActivity = activityFilter === 'All activities' || card.dataset.action === activityFilter;
        const matchesActor = actorFilter === 'All actors' || card.dataset.role === actorFilter;
        const isVisible = matchesQuery && matchesActivity && matchesActor;

        card.classList.toggle('c-is-hidden', !isVisible);
        if (isVisible) visibleCount += 1;
      });

      logEmptyState.hidden = visibleCount !== 0;
      exportCountEl.textContent = String(visibleCount);
    };

    searchInput.addEventListener('input', applyLogFilters);
  }

  /* =======================================================================
     4. GENERIC MODAL OPEN / CLOSE (shared machinery)
     ======================================================================= */

  function openModal(layerEl, focusEl) {
    layerEl.classList.add('c-is-open');
    if (focusEl) window.setTimeout(() => focusEl.focus(), 50);
  }

  function closeModal(layerEl) {
    layerEl.classList.remove('c-is-open');
  }

  function initModalDismissHandlers() {
    document.querySelectorAll('.c-modal-layer').forEach((layer) => {
      layer.querySelectorAll('.j-modal-backdrop, .j-modal-close').forEach((el) => {
        el.addEventListener('click', () => closeModal(layer));
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.c-modal-layer.c-is-open').forEach((layer) => closeModal(layer));
    });
  }

  /* =======================================================================
     5. AUDIT EVENT DETAIL MODAL — populate from a clicked card's data-*
     ======================================================================= */

  const ROLE_THEME_CLASS = {
    Management: 'c-theme-management',
    Teacher: 'c-theme-teacher',
    Parent: 'c-theme-parent',
    System: 'c-theme-system'
  };
  const ALL_THEME_CLASSES = Object.values(ROLE_THEME_CLASS);

  function getInitials(fullName) {
    return fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  function initAuditDetailModal() {
    const layerEl = document.getElementById('j-modal-audit-detail');
    const headerEl = document.getElementById('j-audit-detail-header');
    const summaryEl = document.getElementById('j-audit-detail-summary');
    const actorCardEl = document.getElementById('j-audit-detail-actor');
    const gridEl = document.getElementById('j-audit-detail-grid');
    const closeBtn = layerEl.querySelector('.j-modal-close');

    const titleEl = document.getElementById('j-audit-detail-title');
    const tagActionEl = document.getElementById('j-audit-detail-tag-action');
    const tagRoleEl = document.getElementById('j-audit-detail-tag-role');
    const detailsEl = document.getElementById('j-audit-detail-details');
    const timeEl = document.getElementById('j-audit-detail-time');
    const ipEl = document.getElementById('j-audit-detail-ip');

    const studentCardEl = document.getElementById('j-audit-detail-student');
    const studentInitialsEl = document.getElementById('j-audit-detail-student-initials');
    const studentNameEl = document.getElementById('j-audit-detail-student-name');
    const studentMetaEl = document.getElementById('j-audit-detail-student-meta');

    const actorInitialsEl = document.getElementById('j-audit-detail-actor-initials');
    const actorNameEl = document.getElementById('j-audit-detail-actor-name');
    const actorRoleEl = document.getElementById('j-audit-detail-actor-role');

    function populateFrom(viewBtn) {
      const d = viewBtn.dataset;

      [headerEl, summaryEl, actorCardEl].forEach((el) => {
        el.classList.remove(...ALL_THEME_CLASSES);
        el.classList.add(ROLE_THEME_CLASS[d.role]);
      });

      titleEl.textContent = d.action;
      tagActionEl.textContent = d.action;
      tagActionEl.className = 'c-tag ' + d.toneClass;
      tagRoleEl.textContent = d.role;
      detailsEl.textContent = d.details;
      timeEl.textContent = d.time;
      if (ipEl) ipEl.textContent = d.ip;

      actorInitialsEl.textContent = getInitials(d.actor);
      actorNameEl.textContent = d.actor;
      actorRoleEl.textContent = d.role + ' account';

      if (d.studentName) {
        studentCardEl.hidden = false;
        gridEl.classList.add('c-audit-detail__grid--two-col');
        studentInitialsEl.textContent = d.studentInitials;
        studentNameEl.textContent = d.studentName;
        studentMetaEl.textContent = d.studentGrade + ' · ' + d.studentIndex;
      } else {
        studentCardEl.hidden = true;
        gridEl.classList.remove('c-audit-detail__grid--two-col');
      }
    }

    document.querySelectorAll('.j-view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        populateFrom(btn);
        openModal(layerEl, closeBtn);
      });
    });
  }

  /* =======================================================================
     6. CSV EXPORT
     ======================================================================= */

  function escapeCsvValue(value) {
    return '"' + String(value).replaceAll('"', '""') + '"';
  }

  function initCsvExport() {
    const exportBtn = document.getElementById('j-export-btn');

    exportBtn.addEventListener('click', () => {
      const visibleCards = Array.from(document.querySelectorAll('.j-log-card')).filter(
        (card) => !card.classList.contains('c-is-hidden')
      );

      const rows = visibleCards.map((card) => {
        const d = card.querySelector('.j-view-btn').dataset;
        return [
          d.time, d.actor, d.role, d.action, d.details, d.ip,
          d.studentName || '', d.studentIndex || ''
        ].map(escapeCsvValue).join(',');
      });

      const csv = ['Timestamp,Actor,Actor role,Action,Details,IP,Linked student,Student index', ...rows].join('\n');
      const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'lecole-audit-logs.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    });
  }

  /* =======================================================================
     7. APP BOOTSTRAP
     ======================================================================= */

  function init() {
    initFilterSelects();
    initLogFilters();
    initAuditDetailModal();
    initModalDismissHandlers();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
