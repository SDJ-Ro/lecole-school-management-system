/* =========================================================================
   L'ÉCOLE ADMIN DASHBOARD — EXTRACURRICULAR PAGE SCRIPT
   -------------------------------------------------------------------------
   Naming convention (identical rule to the Dashboard page's script.js):
     c-*   -> CSS-only class, defined in styles.css. JS never selects these
              for logic (it may still toggle a state class like c-is-open).
     j-*   -> JavaScript hook, as an id="j-*" (single element) or
              class="j-*" (repeated element). Carries no styling of its own.
     c-is-* / c-has-* -> state classes toggled by JS on top of a c-* element.
   This page is a small single-page app (three views: overview / detail /
   achievement) navigated with a hash router, plus a handful of on-demand
   modals (create club, edit programme, edit team, add/edit calendar event,
   day schedule). Unlike the Dashboard page — whose charts are fully static
   markup that JS merely wires up — everything on this page is genuinely
   data-driven (club list, per-club calendar, per-club roster), so more of
   it is legitimately built in JS. Where a piece of UI *is* static chrome
   (the sidebar, the modal shell) this file follows the Dashboard page's
   lead and treats it as content, not something to rebuild on every render.

   Sections in this file:
     1. Icon system (inline SVG lookup — no runtime icon library)
     2. Seed data (extracurriculars + notices)
     3. Date helpers (same names/behaviour as the Dashboard page's helpers,
        plus a couple of extra parsing helpers this page's seed data needs)
     4. Application state
     5. Sidebar behaviour (same approach as the Dashboard page)
     6. Router
     7. Overview view
     8. Detail view (hero, achievements, staff, notices, schedule, teams)
     9. Achievement view
    10. Custom select dropdown (same builder pattern as the Dashboard page)
    11. Generic modal open/close (same openModal/closeModal pair, adapted
        for one shared modal shell whose content is written per use)
    12. Modal: create extracurricular
    13. Modal: edit programme
    14. Modal: edit team
    15. Modal: add/edit calendar event
    16. Modal: day schedule ("View all")
    17. App bootstrap
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. ICON SYSTEM
     -------------------------------------------------------------------------
     Every icon is rendered as inline SVG (class="c-icon") — the same
     approach as the Dashboard page, so no icon library is ever loaded.
     Icons shared with the Dashboard page (chevrons, check, x, pen, bell,
     calendar, calendar-plus, users, map-pin) use the exact same path data
     as that page's index.html so the glyphs are pixel-identical everywhere.
     ======================================================================= */

  const ICONS = {
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    'trash-2': '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'calendar-days': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'calendar-plus': '<path d="M16 19h6"/><path d="M16 2v4"/><path d="M19 16v6"/><path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.598"/><path d="M3 10h18"/><path d="M8 2v4"/>',
    'calendar-off': '<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9"/><path d="m17 22 5-5"/><path d="m17 17 5 5"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    'image-plus': '<path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',
    mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    medal: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>',
    pen: '<path d="M21 6.5a1.5 1.5 0 0 0-3-3l-9.9 9.9a2 2 0 0 0-.5.83l-.9 3.02c-.1.34.23.67.57.57l3.02-.9a2 2 0 0 0 .83-.5z"/>',
    phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    trophy: '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
    users: '<path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    music: '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
    basketball: '<circle cx="12" cy="12" r="10"/><path d="M5.4 5.4l13.2 13.2"/><path d="M18.6 5.4l-13.2 13.2"/><path d="M2 12h20"/><path d="M12 2v20"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    grid: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'
  };

  /** Builds an inline <svg class="c-icon"> string — mirrors the markup the
   *  Dashboard page hand-writes directly in its HTML, just generated for
   *  the pieces of this page that are rendered dynamically. */
  function icon(name, size, extraClass) {
    const px = size || 16;
    const inner = ICONS[name] || '';
    const cls = extraClass ? `c-icon ${extraClass}` : 'c-icon';
    return `<svg class="${cls}" width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  }

  /* =======================================================================
     2. SEED DATA
     ======================================================================= */

  const mockData = window.EXTRACURRICULAR_MOCK_DATA || {};
  function unsplash(id) {
    return mockData.unsplash ? mockData.unsplash(id) : `https://images.unsplash.com/photo-${id}?w=100&h=100&fit=crop&crop=faces`;
  }
  const TYPE_LABELS = mockData.TYPE_LABELS || {};
  const STATUS_BADGE_CLASS = mockData.STATUS_BADGE_CLASS || {};
  const CALENDAR_VOCAB = mockData.CALENDAR_VOCAB || {};
  const EXTRACURRICULARS = mockData.EXTRACURRICULARS || [];
  const NOTICES = mockData.NOTICES || [];

  /* =======================================================================
     3. DATE HELPERS
     -------------------------------------------------------------------------
     Same function names/behaviour as the Dashboard page's script.js where
     the concept overlaps (sameCalendarDay, startOfMonth, daysInMonth,
     formatMonthYear, formatMonthDay, formatMonthDayYear, changeCalendarView,
     numberWithCommas) plus two extra helpers this page's seed data needs
     (parseCalendarEventDate, getCalendarEventTimeValue).
     ======================================================================= */

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MIN_CALENDAR_YEAR = 1980;
  const MAX_CALENDAR_YEAR = 2080;

  function sameCalendarDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function daysInMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); }
  function formatMonthYear(date) { return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`; }
  function formatMonthDayYear(date) { return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`; }
  function formatMonthDay(date) { return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`; }
  function numberWithCommas(value) { return Number(value).toLocaleString(); }

  /** Moves the selected day to a new month while clamping to the last valid day. */
  function changeCalendarView(currentSelectedDate, nextViewDate) {
    const normalized = startOfMonth(nextViewDate);
    const lastDay = daysInMonth(normalized);
    return new Date(normalized.getFullYear(), normalized.getMonth(), Math.min(currentSelectedDate.getDate(), lastDay));
  }

  /** Turns loose seed-data strings like "Oct 28, 2024" / "Dec 2024" /
   *  "Every Tue" into a concrete Date, anchored to Oct 2024. */
  function parseCalendarEventDate(value, fallbackIndex) {
    const specificDay = value.match(/([A-Za-z]{3})\w*\s+(\d{1,2}),\s*(\d{4})/);
    if (specificDay) {
      const month = MONTH_SHORT.findIndex((s) => s.toLowerCase() === specificDay[1].slice(0, 3).toLowerCase());
      if (month >= 0) return new Date(Number(specificDay[3]), month, Number(specificDay[2]));
    }
    const monthYear = value.match(/([A-Za-z]{3})\w*\s+(\d{4})/);
    if (monthYear) {
      const month = MONTH_SHORT.findIndex((s) => s.toLowerCase() === monthYear[1].slice(0, 3).toLowerCase());
      if (month >= 0) return new Date(Number(monthYear[2]), month, 1);
    }
    return new Date(2024, 9, (fallbackIndex % 28) + 1);
  }

  /** Turns a free-text time string into minutes-after-midnight so a day's
   *  agenda list can be time-sorted. */
  function getCalendarEventTimeValue(time) {
    const match = time && time.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]m?)?/i);
    if (!match) return Number.MAX_SAFE_INTEGER;
    let hour = Number(match[1]);
    const minutes = Number(match[2] || '0');
    const meridiem = match[3] ? match[3].toLowerCase().charAt(0) : undefined;
    if (meridiem === 'p' && hour < 12) hour += 12;
    if (meridiem === 'a' && hour === 12) hour = 0;
    return hour * 60 + minutes;
  }

  /* =======================================================================
     4. APPLICATION STATE
     -------------------------------------------------------------------------
     Mutable, in-memory only (resets on reload) — same philosophy as the
     Dashboard page's `state` object. Per-club runtime edits (programme
     info, teams, calendar events) are stashed directly on each club object
     as club._program / club._calendar so they survive navigating to an
     achievement page and back.
     ======================================================================= */

  const state = {
    sidebarCollapsed: false,
    clubs: EXTRACURRICULARS,
    notices: NOTICES,
    typeFilter: 'All',
    listFeedback: '',
    enrolledIds: new Set([1, 2]),
    pendingIds: new Set([5]),
    programs: []
  };

  function getClub(id) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return state.clubs.find((club) => club.id === numId);
  }

  /* =======================================================================
     5. SIDEBAR BEHAVIOUR
     -------------------------------------------------------------------------
     Same approach as the Dashboard page's initSidebar(): the sidebar is
     static markup in index.html, this just wires up collapse + selection.
     The only difference is the default selected item (Extracurricular
     instead of Dashboard, since that's the page we're on) and that
     clicking the "Extracurricular" item re-navigates to the overview
     route instead of only toggling a visual state.
     ======================================================================= */

  function initSidebar() { }

  /** Restores the sidebar's selected item back to "Extracurricular" —
   *  mirrors the Dashboard page always keeping one nav item authoritative
   *  for "where you are", called after every route change on this page. */
  function reselectExtracurricularNav() {
    document.querySelectorAll('.j-nav-item').forEach((item) => {
      const isExtracurricular = item.dataset.navName === 'Extracurricular';
      item.classList.toggle('c-is-selected', isExtracurricular);
      item.setAttribute('aria-pressed', String(isExtracurricular));
    });
  }

  /* =======================================================================
     6. ROUTER
     -------------------------------------------------------------------------
     Small hash router covering this page's three views:
       #/extracurricular
       #/extracurricular/:id
       #/extracurricular/:id/achievements/:achievementIndex
     ======================================================================= */

  const viewRootEl = document.getElementById('j-view-root');

  function parseRoute() {
    const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (parts[0] === 'extracurricular' && parts[1] && parts[2] === 'achievements' && parts[3] === 'add') {
      return { name: 'add-achievement', id: parts[1] };
    }
    if (parts[0] === 'extracurricular' && parts[1] && parts[2] === 'achievements' && parts[3] !== undefined) {
      return { name: 'achievement', id: parts[1], achievementIndex: parts[3] };
    }
    if (parts[0] === 'extracurricular' && parts[1]) {
      return { name: 'detail', id: parts[1] };
    }
    return { name: 'overview' };
  }

  function navigate(hash) {
    if (window.location.hash === hash) {
      route();
    } else {
      window.location.hash = hash;
    }
  }

  function route() {
    closeAllSelects();
    closeModal(document.getElementById('j-modal-layer'));
    reselectExtracurricularNav();

    const r = parseRoute();
    if (r.name === 'overview') {
      renderOverviewView();
    } else if (r.name === 'detail') {
      renderDetailView(r.id);
    } else if (r.name === 'achievement') {
      renderAchievementView(r.id, r.achievementIndex);
    } else if (r.name === 'add-achievement') {
      renderAddAchievementView(r.id);
    }
    document.getElementById('j-main').scrollTop = 0;
  }

  window.addEventListener('hashchange', route);

  /* =======================================================================
     7. OVERVIEW VIEW
     ======================================================================= */

  function renderOverviewView() {
    state.searchQuery = state.searchQuery || '';
    const filtered = state.clubs.filter((c) => {
      const matchType = state.typeFilter === 'All'
        || (state.typeFilter === 'Sports' && c.type === 'Sports')
        || (state.typeFilter === 'Clubs and Societies' && c.type !== 'Sports');
      return matchType;
    });

    filtered.sort((a, b) => {
      const getPriority = (club) => {
        if (club.status === 'Active') return 1;
        if (club.status === 'Pending') return 3;
        return 2;
      };
      return getPriority(a) - getPriority(b);
    });

    viewRootEl.innerHTML = `
      <header class="c-page-header-row" style="flex-direction: column; align-items: stretch; gap: 1.5rem;">
        <div>
          <h1 class="c-page-header__title c-font-display">Sports & Clubs</h1>
          <p class="c-page-header__subtitle">Browse every sport and club offered at school, and manage your enrollments.</p>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; justify-content: space-between;">
          <div class="c-search-bar" style="flex: 1; min-width: 250px; display: flex; align-items: center; background: #fff; padding: 0.625rem 1rem; border-radius: 2rem; border: 1px solid var(--color-border);">
            <span style="color: rgba(15, 65, 74, 0.5); margin-right: 0.5rem; display: flex;">${icon('search', 16)}</span>
            <input type="text" id="j-club-search" placeholder="Search activities (e.g. Cricket, Debating...)" value="${escapeHtml(state.searchQuery)}" style="border: none; background: transparent; outline: none; flex: 1; font-family: inherit; font-size: 0.875rem; color: var(--midnight);" />
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <div class="c-segmented-tabs" style="display: flex; background: #fff; border-radius: 2rem; border: 1px solid var(--color-border); padding: 0.25rem;">
              <button class="c-segmented-tab ${state.typeFilter === 'All' ? 'is-active' : ''}" data-value="All">All</button>
              <button class="c-segmented-tab ${state.typeFilter === 'Sports' ? 'is-active' : ''}" data-value="Sports">Sports</button>
              <button class="c-segmented-tab ${state.typeFilter === 'Clubs and Societies' ? 'is-active' : ''}" data-value="Clubs and Societies">Clubs</button>
            </div>
          </div>
        </div>
      </header>

      ${state.listFeedback ? `
        <div class="c-banner" id="j-list-feedback">
          ${icon('check', 16)}
          <span>${escapeHtml(state.listFeedback)}</span>
          <button type="button" class="c-banner__dismiss-btn" id="j-dismiss-feedback" aria-label="Dismiss">${icon('x', 15)}</button>
        </div>` : ''}

      <div class="c-club-grid">
        ${filtered.map((club, index) => renderClubCard(club, index)).join('')}
        <button type="button" class="c-club-card--create" id="j-open-create-club">
          <span class="c-club-card--create__icon">${icon('plus', 20)}</span>
          <span class="c-club-card--create__title c-font-display">Create New Extracurricular</span>
          <span class="c-club-card--create__desc">Set up a new sport, society, club, or arts program.</span>
        </button>
      </div>
    `;

    const searchInput = document.getElementById('j-club-search');
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      const search = state.searchQuery.toLowerCase();
      document.querySelectorAll('.j-club-card').forEach((card) => {
        const title = card.querySelector('.c-club-card__name').textContent.toLowerCase();
        const cat = card.querySelector('.c-club-card__category').textContent.toLowerCase();
        if (!search || title.includes(search) || cat.includes(search)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });

    document.querySelectorAll('.c-segmented-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        state.typeFilter = tab.dataset.value;
        renderOverviewView();
      });
    });

    const dismissBtn = document.getElementById('j-dismiss-feedback');
    if (dismissBtn) dismissBtn.addEventListener('click', () => { state.listFeedback = ''; renderOverviewView(); });

    document.getElementById('j-open-create-club').addEventListener('click', openCreateClubModal);

    viewRootEl.querySelectorAll('.j-club-card').forEach((card) => {
      card.addEventListener('click', () => {
        const club = getClub(card.dataset.clubId);
        if (club) navigate(`#/extracurricular/${club.id}`);
      });
    });
    viewRootEl.querySelectorAll('.j-approve-club').forEach((btn) => {
      btn.addEventListener('click', (event) => { event.stopPropagation(); approveClub(Number(btn.dataset.clubId)); });
    });
    viewRootEl.querySelectorAll('.j-reject-club').forEach((btn) => {
      btn.addEventListener('click', (event) => { event.stopPropagation(); rejectClub(Number(btn.dataset.clubId)); });
    });
    viewRootEl.querySelectorAll('.j-edit-card-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        const club = getClub(Number(btn.dataset.clubId));
        if (club) openEditCardModal(club);
      });
    });
  }

  function renderClubCard(club, index) {
    const isEnrolled = club.status === 'Active' || club.status === 'Enrolled' || (state.enrolledIds && state.enrolledIds.has(club.id));
    const isPending = club.status === 'Pending' || (state.pendingIds && state.pendingIds.has(club.id));

    // Determine icon and theme based on type/category
    let cardTheme = club.type === 'Sports' ? 'sport' : 'club';
    let bgIcon = club.type === 'Sports' ? 'trophy' : 'users';

    if (club.type === 'Sports' || club.category === 'Athletics') {
      if (club.name && club.name.includes('Cricket')) { bgIcon = 'medal'; cardTheme = 'main-sport'; }
      else if (club.name && club.name.includes('Basketball')) { bgIcon = 'basketball'; cardTheme = 'team-sport'; }
      else if (club.name && club.name.includes('Swimming')) { bgIcon = 'droplet'; cardTheme = 'aquatics'; }
      else { bgIcon = 'trophy'; cardTheme = 'main-sport'; }
    } else if (club.category === 'Creative Arts') {
      bgIcon = 'palette'; cardTheme = 'creative-arts';
    } else if (club.category === 'Mental Sport') {
      bgIcon = 'grid'; cardTheme = 'mental-sport';
    }

    const program = (state.programs && Array.isArray(state.programs)) ? state.programs.find((p) => p.id === club.id) : (club._program || null);
    const coach = (program && program.coach) || club.coach || {
      name: 'Coach Dinesh',
      avatar: unsplash('1500648767791-00dcc994a43e'),
      specialty: 'UEFA B Licensed'
    };

    const pillStyle = isPending ? 'c-club-card__pill--pending' :
      (isEnrolled ? 'c-club-card__pill--enrolled' : (club.type === 'Sports' ? 'c-club-card__pill--sport' : 'c-club-card__pill--club'));
    const pillText = isPending ? 'PENDING APPROVAL' :
      (isEnrolled ? `${icon('check', 10)} ENROLLED` : (club.type === 'Sports' ? 'SPORT' : 'CLUB'));

    const contactPhone = (coach && coach.phone) || (club.tic && club.tic.phone) || '+94 77 123 4567';

    const contactRow = isEnrolled
      ? `<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
           <span style="background: #7a1f26; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
             ${icon('phone', 13)}
           </span>
           <span style="font-size: 0.8125rem; font-weight: 700; color: var(--midnight);">${escapeHtml(contactPhone)}</span>
         </div>`
      : `<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
           <span style="background: rgba(15, 65, 74, 0.08); color: var(--midnight); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
             ${icon('lock', 12)}
           </span>
           <span style="font-size: 0.75rem; font-weight: 600; color: rgba(15, 65, 74, 0.7);">Coach contact hidden until enrollment</span>
         </div>`;

    let buttonRow = '';
    if (isPending) {
      buttonRow = `
        <div style="display: flex; gap: 0.4rem; width: 100%;">
          <button type="button" class="c-btn c-btn--maroon j-reject-club" data-club-id="${club.id}" style="flex: 1; height: 36px; border-radius: 9999px; font-weight: 700; font-size: 0.8125rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">${icon('x', 13)} Reject</button>
          <button type="button" class="c-btn c-btn--moss j-approve-club" data-club-id="${club.id}" style="flex: 1; height: 36px; border-radius: 9999px; font-weight: 700; font-size: 0.8125rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">${icon('check', 13)} Accept</button>
        </div>
      `;
    } else {
      buttonRow = `<button type="button" class="c-club-card__btn" style="background: var(--midnight); color: #ffffff; border-radius: 9999px; width: 100%; height: 36px; font-weight: 700; font-size: 0.8125rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">View Details &rarr;</button>`;
    }

    return `
      <article class="c-club-card ${isPending ? 'c-club-card--pending' : (isEnrolled ? 'c-club-card--is-enrolled c-club-card--clickable' : 'c-club-card--clickable')} j-club-card" style="animation-delay:${index * 40}ms; border-radius: 18px; overflow: hidden; background: #ffffff; border: 2px solid var(--color-border); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);" data-club-id="${club.id}">
        <div class="c-club-card__top c-club-card__top--${cardTheme}" ${club.image ? `style="background: url('${club.image}') center/cover no-repeat;"` : ''}>
          ${club.image ? '' : `<div class="c-club-card__bg-icon">${icon(bgIcon, 140)}</div>`}
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; z-index: 10; position: relative;">
            <div class="c-club-card__pill ${pillStyle}">${pillText}</div>
            <button type="button" class="c-club-card__edit-btn j-edit-card-btn" data-club-id="${club.id}" title="Edit Card Images" style="background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;">${icon('pen', 12)}</button>
          </div>
          <div class="c-club-card__titles" ${club.image ? `style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 1rem; margin: 0 -1.25rem -1.25rem -1.25rem; z-index: 10; position: relative;"` : ''}>
            <p class="c-club-card__category">${escapeHtml(club.category).toUpperCase()}</p>
            <h2 class="c-club-card__name">${escapeHtml(club.name)}</h2>
          </div>
        </div>
        <div class="c-club-card__bottom" style="padding: 0.75rem 0.875rem;">
          <div style="background: var(--cream); border-radius: 10px; padding: 0.5rem 0.75rem; margin-bottom: 0.4rem;">
            <div class="c-club-card__tic" style="display: flex; align-items: center; gap: 0.625rem;">
              ${club.tic && club.tic.avatar ? `<img src="${club.tic.avatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff;" />` : ''}
              <div>
                <div class="c-club-card__tic-label" style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(15, 65, 74, 0.5); margin-bottom: 0.05rem;">TEACHER IN CHARGE</div>
                <div class="c-club-card__tic-name" style="font-size: 0.8125rem; font-weight: 700; color: var(--midnight);">${escapeHtml(club.tic ? club.tic.name : 'Staff Member')}</div>
              </div>
            </div>
          </div>

          ${contactRow}
          ${buttonRow}
        </div>
      </article>`;
  }

  function openEditCardModal(club) {
    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('image', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">Edit Card Images</p>
            <h2 class="c-modal__title">${escapeHtml(club.name)}</h2>
            <p class="c-modal__description">Update the main card image and the Teacher in Charge avatar.</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-edit-card-form" novalidate>
        <div class="c-form-row c-form-row--two-col">
          <div>
            <label class="c-field-label">Card Background Image</label>
            <label class="c-cover-upload c-cover-upload--sky" for="j-ecc-image-input" id="j-ecc-image-preview">
              ${club.image ? `<img src="${club.image}" alt="Card preview" />` : `<span class="c-cover-upload__placeholder">${icon('image-plus', 22)}Upload image</span>`}
            </label>
            <input class="c-visually-hidden" id="j-ecc-image-input" type="file" accept="image/*" />
          </div>
          <div>
            <label class="c-field-label">Teacher in Charge Avatar</label>
            <label class="c-cover-upload c-cover-upload--sky" for="j-ecc-avatar-input" id="j-ecc-avatar-preview">
              ${club.tic && club.tic.avatar ? `<img src="${club.tic.avatar}" alt="Avatar preview" />` : `<span class="c-cover-upload__placeholder">${icon('image-plus', 22)}Upload avatar</span>`}
            </label>
            <input class="c-visually-hidden" id="j-ecc-avatar-input" type="file" accept="image/*" />
          </div>
        </div>
        <footer class="c-event-form__footer" style="margin-top: 1.5rem;">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">Save Changes</button>
        </footer>
      </form>
    `;

    openModalWithContent(html, '#j-ecc-image-input');

    document.getElementById('j-ecc-image-input').addEventListener('change', (e) => {
      if (e.target.files[0]) {
        const url = URL.createObjectURL(e.target.files[0]);
        document.getElementById('j-ecc-image-preview').innerHTML = `<img src="${url}" alt="Card preview" />`;
        club.image = url; // Optimistic update
      }
    });

    document.getElementById('j-ecc-avatar-input').addEventListener('change', (e) => {
      if (e.target.files[0]) {
        const url = URL.createObjectURL(e.target.files[0]);
        document.getElementById('j-ecc-avatar-preview').innerHTML = `<img src="${url}" alt="Avatar preview" />`;
        if (club.tic) club.tic.avatar = url; // Optimistic update
      }
    });

    document.getElementById('j-edit-card-form').addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal(document.getElementById('j-modal-layer'));
      renderOverviewView();
    });
  }

  function approveClub(id) {
    const club = state.clubs.find((c) => c.id === id);
    if (!club) return;
    club.status = 'Recruitment Open';
    state.listFeedback = `${club.name} was approved and is now open for recruitment.`;
    renderOverviewView();
  }

  function rejectClub(id) {
    const club = state.clubs.find((c) => c.id === id);
    if (!club) return;
    state.clubs = state.clubs.filter((c) => c.id !== id);
    state.listFeedback = `${club.name} was declined and removed from the pending queue.`;
    renderOverviewView();
  }

  function createClub(values, positions) {
    const template = state.clubs[0];
    const nextId = Math.max(0, ...state.clubs.map((c) => c.id)) + 1;
    const nextClub = Object.assign({}, template, {
      id: nextId, name: values.name, type: values.type, category: values.category, desc: values.description,
      status: 'Pending',
      positions: positions.filter((p) => p.title.trim()).map((p) => ({ title: p.title.trim(), showOnCard: p.showOnCard })),
      teams: [], notices: [], fixtures: [], tournaments: [], awards: []
    });
    delete nextClub._program;
    delete nextClub._calendar;
    state.clubs = state.clubs.concat([nextClub]);
    closeModal(document.getElementById('j-modal-layer'));
    state.listFeedback = `${values.name} was created and added to the pending queue.`;
    renderOverviewView();
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getInitials(name) {
    if (!name) return '??';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function avatarFor(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=7FC7CC&color=0F414A&bold=true`;
  }

  function singularize(word) { return word.endsWith('s') ? word.slice(0, -1) : word; }

  function readImageFile(file) {
    return new Promise((resolve) => {
      if (!file || !(file instanceof File || file instanceof Blob)) return resolve('');
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = String(e.target.result || '');
        if (!rawDataUrl.startsWith('data:image')) {
          return resolve(rawDataUrl);
        }
        const img = new Image();
        img.onload = () => {
          try {
            const MAX_DIM = 1200;
            let width = img.width || 800;
            let height = img.height || 600;

            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressedDataUrl);
          } catch (err) {
            resolve(rawDataUrl.length < 2000000 ? rawDataUrl : '');
          }
        };
        img.onerror = () => {
          resolve(rawDataUrl.length < 2000000 ? rawDataUrl : '');
        };
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  /* =======================================================================
     8. DETAIL VIEW
     ======================================================================= */

  function ensureClubRuntime(club) {
    if (!club._program) {
      club._selectedAgeGroup = club.ageGroups && club.ageGroups.length ? club.ageGroups[0] : null;
      club._program = {
        category: club.category || '',
        coach: club.coach ? Object.assign({}, club.coach, { email: club.coach.email || '' }) : undefined,
        description: club.desc || '',
        image: club.image || '',
        name: club.name || ''
      };
    }
    if (!club._calendar) {
      const vocabulary = CALENDAR_VOCAB[club.type] || { fixture: 'Session', tournament: 'Competition' };
      const fixtures = club.fixtures || [];
      const tournaments = club.tournaments || [];
      const seeded = [].concat(
        fixtures.map((f, i) => Object.assign({}, f, { date: parseCalendarEventDate(f.date, i), id: `fixture-${i}-${f.title}`, tone: 'c-tone-sky', type: vocabulary.fixture })),
        tournaments.map((t, i) => Object.assign({}, t, { date: parseCalendarEventDate(t.date, fixtures.length + i), id: `tournament-${i}-${t.title}`, tone: 'c-tone-sunshine', type: vocabulary.tournament }))
      );
      club._calendar = { seeded, overrides: {}, added: [], viewDate: new Date(2024, 9, 1), selectedDate: new Date(2024, 9, 12) };
    }
  }

  function loadSharedExtracurricularEvents(clubName) {
    try {
      const stored = localStorage.getItem('lecole_shared_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.filter(e => e.category === 'Extracurricular' && e.extracurricularTarget === clubName).map(e => ({
          ...e,
          date: new Date(e.date)
        }));
      }
    } catch (e) { }
    return [];
  }

  function getCalendarEvents(club) {
    const cal = club._calendar;
    const resolved = cal.seeded.map((e) => cal.overrides[e.id] || e).concat(cal.added).concat(loadSharedExtracurricularEvents(club.name));
    return resolved.filter((e) => !e.deleted);
  }

  function renderDetailView(id) {
    const club = getClub(id);
    if (!club) {
      viewRootEl.innerHTML = `
        <div style="display:flex;height:24rem;flex-direction:column;align-items:center;justify-content:center;color:rgba(15,65,74,0.5);">
          ${icon('trophy', 48)}
          <p style="margin-top:1rem;">Extracurricular program not found.</p>
          <button type="button" class="c-btn c-btn--ghost" id="j-back-to-overview" style="margin-top:1rem;">Return to Overview</button>
        </div>`;
      document.getElementById('j-back-to-overview').addEventListener('click', () => navigate('#/extracurricular'));
      return;
    }
    ensureClubRuntime(club);
    const program = club._program;
    const typeLabels = TYPE_LABELS[club.type] || { teamWord: 'Teams', memberWord: 'Members' };
    const singularTeamWord = singularize(typeLabels.teamWord);

    viewRootEl.innerHTML = `
      <div class="c-view">
        <button type="button" class="c-back-link-btn" id="j-back-to-overview" style="margin-bottom: 1rem;">${icon('arrow-left', 16)} Back</button>
        ${renderDetailHero(club, program)}
        ${renderAchievementsPanel(club)}
        ${renderSchedulePanel(club, program)}
        ${renderNoticeBoardPanel(club)}
        ${renderTeamsPanel(club, typeLabels, singularTeamWord)}
        ${renderDeleteCardPanel(club)}
      </div>`;

    document.getElementById('j-back-to-overview').addEventListener('click', () => navigate('#/extracurricular'));
    document.getElementById('j-open-program-edit').addEventListener('click', () => openProgramEditModal(club));

    const addAwardBtn = document.getElementById('j-open-add-award');
    if (addAwardBtn) addAwardBtn.addEventListener('click', () => navigate(`#/extracurricular/${club.id}/achievements/add`));

    const editDetailsBtn = document.getElementById('j-open-edit-details');
    if (editDetailsBtn) editDetailsBtn.addEventListener('click', () => openDetailsEditModal(club));

    viewRootEl.querySelectorAll('.j-achievement-card').forEach((cardEl) => {
      cardEl.addEventListener('click', () => navigate(`#/extracurricular/${club.id}/achievements/${cardEl.dataset.achIndex}`));
    });

    document.getElementById('j-open-team-create').addEventListener('click', () => openTeamModal(club, 'create', null, typeLabels));
    viewRootEl.querySelectorAll('.j-edit-team').forEach((btn) => {
      btn.addEventListener('click', () => openTeamModal(club, 'edit', Number(btn.dataset.teamIndex), typeLabels));
    });

    const editCoachBtn = document.getElementById('j-edit-coach-btn');
    if (editCoachBtn) editCoachBtn.addEventListener('click', () => openEditCoachModal(club));

    const deleteClubBtn = viewRootEl.querySelector('.j-delete-club-card-btn');
    if (deleteClubBtn) {
      deleteClubBtn.addEventListener('click', () => {
        showConfirmDeleteModal({
          title: 'Delete card?',
          description: `This will remove the program card "${program.name}" and all its data.`,
          buttonText: 'Delete card',
          onConfirm: () => {
            deleteClubCard(club.id);
          }
        });
      });
    }

    mountSchedulePanel(club);
    mountTeamsPanel(club, typeLabels, singularTeamWord);
  }

  function renderDeleteCardPanel(club) {
    return `
      <section class="c-panel" style="border: 1px solid rgba(127,3,3,0.3); background: rgba(127,3,3,0.02); border-radius: var(--radius-xl); padding: 1.5rem; margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0; font-size: 1rem; font-weight: 700; color: #7f0303; display: flex; align-items: center; gap: 6px;">
            ${icon('trash-2', 18)} Danger Zone
          </h3>
          <p style="margin: 0.25rem 0 0; font-size: 0.8125rem; color: rgba(15, 65, 74, 0.75);">
            Permanently delete this extracurricular program card and all of its associated teams, notices, achievements, and schedules.
          </p>
        </div>
        <button type="button" class="c-btn j-delete-club-card-btn" data-club-id="${club.id}" style="background: #7f0303; color: #fff; border: none; padding: 0.625rem 1.25rem; font-size: 0.8125rem; font-weight: 600; border-radius: var(--radius-lg); cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
          Delete Card
        </button>
      </section>
    `;
  }

  function renderDetailHero(club, program) {
    return `
      <section class="c-detail-hero">
        <div class="c-detail-hero__media">
          ${program.image ? `<img src="${program.image}" alt="${escapeHtml(program.name)}" />` : ''}
          <div class="c-detail-hero__tint"></div>
        </div>
        <span class="c-status-pill c-detail-hero__badge" style="background: rgba(15, 65, 74, 0.15); color: var(--midnight); border: 1px solid rgba(15, 65, 74, 0.25); font-weight: 700; padding: 0.35rem 0.75rem;">
          ${icon('calendar', 12)} Created Date: ${escapeHtml(club.createdAt || '15 Jan 2024')}
        </span>
        <button type="button" class="c-detail-hero__edit-btn" id="j-open-program-edit">${icon('pen', 14)} Edit program</button>
        <div class="c-detail-hero__content">
          <div class="c-detail-hero__tags">
            <span class="c-detail-hero__type">${club.type}</span>
            <span class="c-detail-hero__sep">•</span>
            <span class="c-detail-hero__category">${escapeHtml(program.category)}</span>
          </div>
          <h1 class="c-detail-hero__name c-font-display">${escapeHtml(program.name)}</h1>
          <p class="c-detail-hero__desc">${escapeHtml(program.description)}</p>
        </div>
      </section>`;
  }

  function renderAchievementsPanel(club) {
    return `
      <section class="c-panel">
        <div class="c-panel__header-row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
          <div class="c-panel__heading-row" style="margin:0;">
            <span class="c-panel__heading-icon">${icon('medal', 20)}</span>
            <h2 class="c-panel__title c-font-display">Achievements &amp; Gallery</h2>
          </div>
          <button type="button" class="c-btn c-btn--sky c-btn--sm" id="j-open-add-award" style="display:inline-flex;align-items:center;gap:0.35rem;">${icon('plus', 14)} Add Achievement</button>
        </div>
        ${club.awards && club.awards.length ? `
          <div class="c-achv-grid">
            ${club.awards.map((a, i) => `
              <div class="c-achv-card j-achievement-card" data-ach-index="${i}" aria-label="View details for ${escapeHtml(a.title)}" style="cursor: pointer;">
                ${a.image ? `<div class="c-achv-card__media"><img class="c-achv-card__img" src="${a.image}" alt="" /></div>` : `<div class="c-achv-card__media-empty">${icon('trophy', 28)}</div>`}
                <div class="c-achv-card__body">
                  <div class="c-achv-card__row">
                    <span class="c-achv-card__title">${escapeHtml(a.title)}</span>
                    <span class="c-achv-card__year">${escapeHtml(a.year)}</span>
                  </div>
                  <div class="c-achv-card__tags">
                    <span class="c-achv-card__level">${escapeHtml(a.level)}</span>
                    <span class="c-achv-card__dot">•</span>
                    <span class="c-achv-card__kind">${escapeHtml(a.kind)}</span>
                  </div>
                </div>
              </div>`).join('')}
          </div>` : `<div class="c-empty-box">No achievements recorded yet. Click "+ Add Achievement" above to add one.</div>`}
      </section>`;
  }

  function renderStaffCard(role, person, isEditable, onEditClickId) {
    return `
      <article style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <h2 class="c-staff-card__role" style="margin: 0;">${role}</h2>
          ${isEditable ? `<button type="button" class="c-btn c-btn--ghost c-btn--sm" id="${onEditClickId}" style="padding: 0.15rem 0.4rem; font-size: 11px; color: var(--midnight); display: inline-flex; align-items: center; gap: 0.25rem;" title="Edit coach details">${icon('pen', 12)} Edit</button>` : ''}
        </div>
        <div class="c-staff-card__person" style="margin-bottom: 0.4rem;">
          <img src="${person.avatar}" alt="${escapeHtml(person.name)}" />
          <div style="min-width: 0;">
            <p class="c-staff-card__name">${escapeHtml(person.name)}</p>
            <p class="c-staff-card__specialty">${escapeHtml(person.specialty)}</p>
          </div>
        </div>
        <div class="c-staff-card__contact" style="display: flex; flex-direction: column; gap: 0.35rem;">
          <p class="c-staff-card__contact-row" style="margin: 0;">${icon('mail', 14)}<span>${escapeHtml(person.email || 'Not provided')}</span></p>
          <p class="c-staff-card__contact-row" style="margin: 0;">${icon('phone', 14)}<span>${escapeHtml(person.phone || 'Not provided')}</span></p>
        </div>
      </article>`;
  }

  function renderNoticeBoardPanel(club) {
    const linked = state.notices
      .filter((n) => n.target.kind === 'all' || (n.target.kind === 'program' && n.target.programId === club.id))
      .slice().sort((a, b) => Number(b.pinned) - Number(a.pinned));
    const allNotices = linked.concat(club.notices || []);
    const hasAny = allNotices.length > 0;

    return `
      <section class="c-panel">
        <div class="c-panel__heading-row" style="margin-bottom:1.25rem;">
          <span class="c-panel__heading-icon">${icon('bell', 20)}</span>
          <h2 class="c-panel__title c-font-display">Notice Board</h2>
        </div>
        ${hasAny ? `
          <div class="c-notice-grid">
            ${allNotices.map((n, idx) => {
              const cat = n.category || (n.target && n.target.kind === 'all' ? 'General' : 'Extracurricular');
              const aud = n.audience || (n.target && n.target.kind === 'all' ? ['All users'] : ['Students']);
              const author = n.author || `${club.name} Admin`;
              const date = (n.date || '').toUpperCase();
              const initials = getInitials(author);

              return `
                <article class="c-notice-card" data-category="${escapeHtml(cat)}" tabindex="0" style="animation-delay:${idx * 40}ms">
                  ${n.pinned ? `<span class="c-notice-card__pin" aria-label="Pinned notice" title="Pinned notice">${icon('pin', 18)}</span>` : ''}
                  <div class="c-notice-card__tags">
                    <span class="c-tag c-tag--category">${escapeHtml(cat)}</span>
                    ${aud.map((a) => `<span class="c-tag c-tag--audience">${escapeHtml(a)}</span>`).join('')}
                  </div>
                  <h3 class="c-notice-card__title">${escapeHtml(n.title)}</h3>
                  <p class="c-notice-card__body">${escapeHtml(n.body)}</p>
                  <footer class="c-notice-card__footer">
                    <div class="c-notice-card__author">
                      <span class="c-avatar">${escapeHtml(initials)}</span>
                      <div>
                        <p class="c-notice-card__author-name">${escapeHtml(author)}</p>
                        <p class="c-notice-card__date">${escapeHtml(date)}</p>
                      </div>
                    </div>
                  </footer>
                </article>`;
            }).join('')}
          </div>` : `<div class="c-empty-box">No recent notices posted.</div>`}
      </section>`;
  }

  /* ---- Schedule & Events panel -------------------------------------------
     Same dark-calendar component/classes as the Dashboard page
     (c-calendar, c-calendar__day, c-has-events, c-is-selected, etc.) with
     an inline agenda list beside it instead of below it (this page shows
     one club's calendar at a time inside a two-column c-schedule-grid,
     rather than the Dashboard's single full-width calendar). Function
     names mirror the Dashboard page's calendar functions
     (renderCalendarGrid / refreshCalendar / updateCalendarView / etc.)
     scoped to whichever club is currently on screen. ------------------- */

  const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  function renderSchedulePanel(club, program) {
    return `
      <section class="c-panel">
        <div class="c-panel__heading-row" style="margin-bottom:1.5rem;">
          <span class="c-panel__heading-icon">${icon('calendar-days', 20)}</span>
          <h2 class="c-panel__title c-font-display">Schedule &amp; Events</h2>
        </div>
        <div class="c-schedule-grid">
          <section class="c-calendar" id="j-calendar">
            <header class="c-calendar__header">
              <div class="c-calendar__header-row">
                <div class="c-calendar__nav">
                  <button type="button" class="c-calendar__nav-btn" id="j-calendar-prev" aria-label="Previous month">${icon('chevron-left', 14)}</button>
                  <button type="button" class="c-calendar__nav-btn" id="j-calendar-next" aria-label="Next month">${icon('chevron-right', 14)}</button>
                </div>
                <div class="c-calendar__month-year">
                  <div class="c-select c-select--month" id="j-select-month">
                    <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                      <span class="j-select-value"></span>
                      <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div class="c-select__menu" role="listbox" aria-label="Choose calendar month"></div>
                  </div>
                  <div class="c-select c-select--year" id="j-select-year">
                    <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                      <span class="j-select-value"></span>
                      <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div class="c-select__menu" role="listbox" aria-label="Choose calendar year"></div>
                  </div>
                </div>
              </div>
            </header>
            <div class="c-calendar__weekdays" id="j-calendar-weekdays"></div>
            <div class="c-calendar__days" id="j-calendar-days"></div>
            <div class="c-calendar__footer">
              <div class="c-calendar__footer-row">
                <p class="c-calendar__event-count" id="j-calendar-event-count" aria-live="polite">0 events scheduled</p>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <button type="button" class="c-calendar__view-all-btn" id="j-open-day-schedule">View all</button>
                </div>
              </div>
              <div class="c-calendar__day-detail" id="j-agenda-body"></div>
            </div>
          </section>

          <section class="c-staff-sidebar" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; gap: 0.75rem;">
            <div style="background: var(--cream); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 0.75rem 1rem;">
              ${renderStaffCard('Teacher in Charge', { avatar: club.tic.avatar, name: club.tic.name, specialty: club.tic.subject, email: club.tic.email, phone: club.tic.phone })}
            </div>

            <div style="background: var(--cream); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 0.75rem 1rem; position: relative;">
              ${renderStaffCard('Coach / Instructor', {
                avatar: (program.coach && program.coach.avatar) || club.tic.avatar,
                name: (program.coach && program.coach.name) || 'Coach details pending',
                specialty: (program.coach && program.coach.specialty) || 'Not recorded',
                email: program.coach && program.coach.email,
                phone: program.coach && program.coach.phone
              }, true, 'j-edit-coach-btn')}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
              <div style="background: var(--cream); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 1.1rem 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                  <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--midnight); margin: 0;">Details</h4>
                  <button type="button" class="c-btn c-btn--ghost c-btn--sm" id="j-open-edit-details" style="padding: 0.2rem 0.5rem; font-size: 12px; color: var(--midnight);">${icon('pen', 13)} Edit</button>
                </div>
                
                <div style="display: flex; gap: 0.625rem; align-items: flex-start; margin-bottom: 0.75rem;">
                  <span style="background: rgba(127, 199, 204, 0.2); border-radius: 8px; padding: 0.45rem; display: flex; color: var(--sky-blue); flex-shrink: 0;">
                    ${icon('clock', 15)}
                  </span>
                  <div style="min-width: 0;">
                    <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(15, 65, 74, 0.5); margin: 0 0 0.15rem;">Schedule</p>
                    <p style="font-size: 0.875rem; font-weight: 600; color: var(--midnight); margin: 0; line-height: 1.4;">${escapeHtml(club.schedule || 'Tuesdays & Thursdays, 3:30 – 5:30 PM')}</p>
                  </div>
                </div>

                <div style="display: flex; gap: 0.625rem; align-items: flex-start;">
                  <span style="background: rgba(127, 199, 204, 0.2); border-radius: 8px; padding: 0.45rem; display: flex; color: var(--sky-blue); flex-shrink: 0;">
                    ${icon('map-pin', 15)}
                  </span>
                  <div style="min-width: 0;">
                    <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(15, 65, 74, 0.5); margin: 0 0 0.15rem;">Location</p>
                    <p style="font-size: 0.875rem; font-weight: 600; color: var(--midnight); margin: 0; line-height: 1.4;">${escapeHtml(club.location || 'Main Cricket Ground')}</p>
                  </div>
                </div>
              </div>

              <div style="background: var(--cream); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 1.1rem 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--midnight); margin-top: 0; margin-bottom: 0.75rem;">Created Date</h4>
                <div style="display: flex; gap: 0.625rem; align-items: flex-start; margin-bottom: auto;">
                  <span style="background: rgba(127, 199, 204, 0.2); border-radius: 8px; padding: 0.45rem; display: flex; color: var(--sky-blue); flex-shrink: 0;">
                    ${icon('calendar', 15)}
                  </span>
                  <div style="min-width: 0;">
                    <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(15, 65, 74, 0.5); margin: 0 0 0.15rem;">Date Added</p>
                    <p style="font-size: 0.875rem; font-weight: 600; color: var(--midnight); margin: 0; line-height: 1.4;">${escapeHtml(club.createdAt || '15 Jan 2024')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>`;
  }

  function mountSchedulePanel(club) {
    const cal = club._calendar;

    document.getElementById('j-calendar-weekdays').innerHTML = WEEKDAY_LABELS.map((d) => `<span class="c-calendar__weekday">${d}</span>`).join('');

    function getEventsOnDate(date) { return getCalendarEvents(club).filter((e) => sameCalendarDay(e.date, date)); }

    function renderCalendarGrid() {
      const daysEl = document.getElementById('j-calendar-days');
      const monthStart = startOfMonth(cal.viewDate);
      const weekStartsOn = 0; // Sunday
      const leadingBlanks = (monthStart.getDay() - weekStartsOn + 7) % 7;
      const totalDays = daysInMonth(cal.viewDate);
      const dateCells = Array.from({ length: totalDays }, (_, i) => new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1));
      const trailingCount = (7 - ((leadingBlanks + dateCells.length) % 7)) % 7;
      const cellCount = Math.max(35, leadingBlanks + dateCells.length + trailingCount);
      const finalTrailing = cellCount - leadingBlanks - dateCells.length;
      const cells = [
        ...Array.from({ length: leadingBlanks }, () => null),
        ...dateCells,
        ...Array.from({ length: finalTrailing }, () => null)
      ];

      daysEl.innerHTML = '';
      cells.forEach((date) => {
        if (!date) {
          const blank = document.createElement('span');
          blank.className = 'c-calendar__day-blank';
          blank.setAttribute('aria-hidden', 'true');
          daysEl.appendChild(blank);
          return;
        }
        const eventCount = getEventsOnDate(date).length;
        const hasEvents = eventCount > 0;
        const isSelected = sameCalendarDay(cal.selectedDate, date);
        const dateLabel = formatMonthDayYear(date);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'c-calendar__day';
        if (hasEvents) btn.classList.add('c-has-events');
        if (isSelected) btn.classList.add('c-is-selected');
        btn.setAttribute('aria-pressed', String(isSelected));
        btn.setAttribute('aria-label', hasEvents ? `View ${eventCount} ${eventCount === 1 ? 'event' : 'events'} for ${dateLabel}` : `View ${dateLabel}, no events scheduled`);
        btn.innerHTML = `<span style="line-height:1">${date.getDate()}</span>`;
        btn.addEventListener('click', () => { cal.selectedDate = date; refreshCalendar(); });
        daysEl.appendChild(btn);
      });
    }

    function renderAgendaBody() {
      const countEl = document.getElementById('j-calendar-event-count');
      const bodyEl = document.getElementById('j-agenda-body');
      const dayEvents = getEventsOnDate(cal.selectedDate)
        .slice()
        .sort((a, b) => getCalendarEventTimeValue(a.meta) - getCalendarEventTimeValue(b.meta) || a.title.localeCompare(b.title));

      countEl.textContent = dayEvents.length === 1 ? '1 event scheduled' : `${dayEvents.length} events scheduled`;

      if (dayEvents.length) {
        const recentEvent = dayEvents[dayEvents.length - 1];

        bodyEl.innerHTML = `
          <div class="c-calendar__day-events">
            <article class="c-day-event-card" style="position: relative;">
              <p class="c-day-event-card__eyebrow">${formatMonthDay(cal.selectedDate)} · ${recentEvent.time || 'TBD'}</p>
              <h3 class="c-day-event-card__title">${escapeHtml(recentEvent.title)}</h3>
              <p class="c-day-event-card__details">${escapeHtml(recentEvent.venue || recentEvent.meta || '')}</p>
              <div style="position: absolute; right: 12px; top: 12px; display: flex; gap: 8px; align-items: center;">
                <button type="button" class="j-edit-calendar-event" data-event-id="${escapeHtml(recentEvent.id)}" aria-label="Edit event" style="background: none; border: none; cursor: pointer; color: white; padding: 4px;">
                  <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6.5a1.5 1.5 0 0 0-3-3l-9.9 9.9a2 2 0 0 0-.5.83l-.9 3.02c-.1.34.23.67.57.57l3.02-.9a2 2 0 0 0 .83-.5z"/></svg>
                </button>
                <button type="button" class="j-delete-calendar-event" data-event-id="${escapeHtml(recentEvent.id)}" aria-label="Delete event" style="background: none; border: none; cursor: pointer; color: #ff8888; padding: 4px;">
                  <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </article>
            <button type="button" class="j-open-event-editor-btn" style="width: 100%; border: 1px dashed rgba(255, 255, 255, 0.6); border-radius: 8px; background: rgba(255, 255, 255, 0.1); padding: 1.25rem 1rem; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s; margin-top: 0.25rem;" onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
              <span style="color: #EA8913; font-weight: 600; font-size: 0.875rem;">Add event</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA8913" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>`;

        const editBtn = bodyEl.querySelector('.j-edit-calendar-event');
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            const ev = getCalendarEvents(club).find((e) => String(e.id) === editBtn.dataset.eventId);
            if (ev) openCalendarEventModal(club, ev);
          });
        }

        const deleteBtn = bodyEl.querySelector('.j-delete-calendar-event');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            const ev = getCalendarEvents(club).find((e) => String(e.id) === deleteBtn.dataset.eventId);
            if (ev) {
              showConfirmDeleteModal({
                title: 'Delete event?',
                description: `This will remove the event "${ev.title}" from the schedule.`,
                buttonText: 'Delete event',
                onConfirm: () => {
                  deleteCalendarEvent(club, ev.id);
                  refreshCalendar();
                }
              });
            }
          });
        }

        bodyEl.querySelector('.j-open-event-editor-btn').addEventListener('click', () => {
          openCalendarEventModal(club);
        });
      } else {
        bodyEl.innerHTML = `
          <div class="c-calendar__empty-day">
            <svg class="c-icon c-calendar__empty-day-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
            <p class="c-calendar__empty-day-title">No events scheduled</p>
            <p class="c-calendar__empty-day-text">No events on ${formatMonthDayYear(cal.selectedDate)}.</p>
            <button type="button" class="j-open-event-editor-btn" style="margin-top: 1rem; width: 100%; border: 1px dashed rgba(255, 255, 255, 0.6); border-radius: 8px; background: rgba(255, 255, 255, 0.1); padding: 1rem; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
              <span style="color: #EA8913; font-weight: 600; font-size: 0.875rem;">Add event</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA8913" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>`;

        bodyEl.querySelector('.j-open-event-editor-btn').addEventListener('click', () => {
          openCalendarEventModal(club);
        });
      }
    }

    function renderCalendarHeaderValues() {
      document.querySelector('#j-select-month .j-select-value').textContent = MONTH_NAMES[cal.viewDate.getMonth()];
      document.querySelector('#j-select-year .j-select-value').textContent = String(cal.viewDate.getFullYear());
      document.getElementById('j-calendar-prev').disabled = cal.viewDate.getFullYear() === MIN_CALENDAR_YEAR && cal.viewDate.getMonth() === 0;
      document.getElementById('j-calendar-next').disabled = cal.viewDate.getFullYear() === MAX_CALENDAR_YEAR && cal.viewDate.getMonth() === 11;
    }

    function refreshCalendar() {
      renderCalendarHeaderValues();
      renderCalendarGrid();
      renderAgendaBody();
    }

    function updateCalendarView(nextViewDate) {
      cal.viewDate = startOfMonth(nextViewDate);
      cal.selectedDate = changeCalendarView(cal.selectedDate, nextViewDate);
      refreshCalendar();
    }

    document.getElementById('j-calendar-prev').addEventListener('click', () => {
      updateCalendarView(new Date(cal.viewDate.getFullYear(), cal.viewDate.getMonth() - 1, 1));
    });
    document.getElementById('j-calendar-next').addEventListener('click', () => {
      updateCalendarView(new Date(cal.viewDate.getFullYear(), cal.viewDate.getMonth() + 1, 1));
    });

    buildSelect(document.getElementById('j-select-month'), MONTH_NAMES.map((name, i) => ({ label: name, value: String(i) })),
      () => String(cal.viewDate.getMonth()), (value) => updateCalendarView(new Date(cal.viewDate.getFullYear(), Number(value), 1)));
    buildSelect(document.getElementById('j-select-year'),
      Array.from({ length: MAX_CALENDAR_YEAR - MIN_CALENDAR_YEAR + 1 }, (_, i) => ({ label: String(MIN_CALENDAR_YEAR + i), value: String(MIN_CALENDAR_YEAR + i) })),
      () => String(cal.viewDate.getFullYear()), (value) => updateCalendarView(new Date(Number(value), cal.viewDate.getMonth(), 1)));

    document.getElementById('j-open-day-schedule').addEventListener('click', () => openDayScheduleModal(club));

    refreshCalendar();
  }

  /* ---- Teams / Roster panel ---------------------------------------------- */

  function renderTeamsPanel(club, typeLabels, singularTeamWord) {
    const ageGroups = club.ageGroups || [];
    const selectedAge = club._selectedAgeGroup;

    // Filter teams based on selected age group if age groups exist
    const teams = ageGroups.length && selectedAge ?
      club.teams.filter(t => t.ageGroup === selectedAge) :
      club.teams;

    const unassigned = (club.unassignedStudents || []).filter(s => !selectedAge || s.ageGroup === selectedAge);

    return `
      <section class="c-panel" id="j-teams-panel">
        <div class="c-panel__header-row">
          <div class="c-panel__heading-row">
            <span class="c-panel__heading-icon" style="color: var(--sky-blue);">${icon('users', 20)}</span>
            <h2 class="c-panel__title c-font-display">${typeLabels.teamWord} &amp; Roster</h2>
          </div>
          <button type="button" class="c-btn c-btn--sky c-btn--sm" id="j-open-team-create">${icon('plus', 15)} Add ${singularTeamWord}</button>
        </div>
        
        ${ageGroups.length ? `
        <div class="c-age-group-header">
          <span class="c-age-group-header__title">Age Group</span>
          <div class="c-select c-select--sky j-age-group-custom-select" id="j-age-group-select" style="min-width: 140px;">
            <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false" style="background: transparent !important; border: none !important; padding: 0 !important; box-shadow: none !important; display: inline-flex; align-items: center; gap: 4px;">
              <span class="c-select__value j-select-value" style="color: #207c82 !important; font-weight: 700;"></span>
              <svg class="c-icon c-select__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #207c82 !important; margin: 0;"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="c-select__menu" role="listbox"></div>
          </div>
        </div>` : ''}

        ${(ageGroups.length && unassigned.length) ? `
        <div class="c-unassigned-section">
          <h3 class="c-unassigned-title">Unassigned Students</h3>
          <div class="c-unassigned-list">
            ${unassigned.map(s => `
              <div class="c-unassigned-item">
                <div class="c-unassigned-item__left">
                  <img src="${escapeHtml(s.avatar)}" alt="${escapeHtml(s.name)}" />
                  <div>
                    <p class="c-unassigned-item__name">${escapeHtml(s.name)}</p>
                    <p class="c-unassigned-item__grade">${escapeHtml(s.grade)}</p>
                  </div>
                </div>
                <div class="c-unassigned-item__right">
                  <div class="c-select c-select--sky j-unassigned-team-custom-select" data-student-id="${escapeHtml(s.id)}" style="min-width: unset;">
                    <button type="button" class="c-btn-assign c-select__trigger" aria-haspopup="listbox" aria-expanded="false" style="border:none;">
                      <span style="display:none;" class="j-select-value"></span>
                      <span>Assign</span>
                      <svg class="c-icon c-select__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div class="c-select__menu c-select__menu--right" role="listbox"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        ${teams.length ? `
          <div class="c-team-grid">${teams.map((team, i) => renderTeamCard(team, i, typeLabels)).join('')}</div>` : `
          <div class="c-empty-box c-empty-box--violet">
            <p style="font-size:0.875rem;color:rgba(15,65,74,0.6);">No ${typeLabels.teamWord.toLowerCase()} defined yet.</p>
          </div>`}
      </section>`;
  }

  function renderTeamCard(team, index, typeLabels) {
    return `
      <article class="c-team-card" style="animation-delay:${index * 40}ms">
        <div class="c-team-card__cover">
          ${team.coverImage ? `<img src="${team.coverImage}" alt="" />` : `<div class="c-team-card__cover-empty">${icon('image', 30)}</div>`}
          <div class="c-team-card__cover-tint"></div>
          <div style="position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; z-index: 5;">
            <button type="button" class="c-team-card__edit-btn j-edit-team" data-team-index="${index}" aria-label="Edit ${escapeHtml(team.name)}" style="position: static; margin: 0; width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center;" title="Edit team">${icon('pen', 13)}</button>
          </div>
        </div>
        <div class="c-team-card__body">
          <div class="c-team-card__top">
            <h3 class="c-team-card__name c-font-display">${escapeHtml(team.name)}</h3>
            <span class="c-team-card__count">${team.roster.length} ${typeLabels.memberWord}</span>
          </div>
          ${team.roster.length ? `
            <ul class="c-team-card__roster">
              ${team.roster.map((m) => `
                <li class="c-team-card__member">
                  <div class="c-team-card__member-left">
                    <img src="${m.avatar}" alt="${escapeHtml(m.name)}" />
                    <div style="min-width:0;">
                      <p class="c-team-card__member-name">${escapeHtml(m.name)}</p>
                      <p class="c-team-card__member-grade">${escapeHtml(m.grade)}</p>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.5rem;margin-left:auto;">
                    ${m.position ? `<span class="c-team-card__member-position">${escapeHtml(m.position)}</span>` : ''}
                    <button type="button" class="c-team-card__unassign-btn j-unassign-student" data-team-name="${escapeHtml(team.name)}" data-student-id="${escapeHtml(m.id)}" title="Unassign">${icon('x', 14)}</button>
                  </div>
                </li>`).join('')}
            </ul>` : `<p class="c-team-card__no-roster">No ${typeLabels.memberWord.toLowerCase()} added yet. Use Edit to build this roster.</p>`}
        </div>
      </article>`;
  }

  function mountTeamsPanel(club, typeLabels, singularTeamWord) {
    const refreshPanel = () => {
      const panel = document.getElementById('j-teams-panel');
      if (panel) {
        panel.outerHTML = renderTeamsPanel(club, typeLabels, singularTeamWord);
        mountTeamsPanel(club, typeLabels, singularTeamWord); // rebind elements inside the panel

        // rebind edit buttons that are now detached
        document.getElementById('j-open-team-create').addEventListener('click', () => openTeamModal(club, 'create', null, typeLabels));
        document.querySelectorAll('.j-edit-team').forEach((btn) => {
          btn.addEventListener('click', () => openTeamModal(club, 'edit', Number(btn.dataset.teamIndex), typeLabels));
        });
      }
    };

    const panel = document.getElementById('j-teams-panel');
    if (!panel) return;

    const ageSelectRoot = panel.querySelector('#j-age-group-select');
    if (ageSelectRoot) {
      buildAgeGroupSelect(ageSelectRoot, club, refreshPanel);
    }

    panel.querySelectorAll('.c-unassigned-item__right').forEach((rightEl) => {
      const selectRoot = rightEl.querySelector('.j-unassigned-team-custom-select');
      const studentId = selectRoot ? selectRoot.dataset.studentId : null;
      if (selectRoot && studentId) {
        const limit = club.teamLimit || Infinity;
        const availableTeams = club.teams.filter(t => t.roster.length < limit);
        if (availableTeams.length === 0) {
          const btn = selectRoot.querySelector('.c-btn-assign');
          btn.disabled = true;
          btn.title = 'No teams with available spots';
          return;
        }
        let currentTeam = '';
        const teamOptions = availableTeams.map(t => ({ label: t.name, value: t.name }));
        buildSelect(
          selectRoot,
          teamOptions,
          () => currentTeam,
          (val) => {
            currentTeam = val;
            const teamIndex = club.teams.findIndex(t => t.name === val);
            const team = club.teams[teamIndex];
            if (team) {
              const studentIndex = club.unassignedStudents.findIndex(s => s.id === studentId);
              if (studentIndex > -1) {
                team.roster.push(club.unassignedStudents[studentIndex]);
                club.unassignedStudents.splice(studentIndex, 1);
                refreshPanel();
                openTeamModal(club, 'edit', teamIndex, typeLabels);
              }
            }
          }
        );
      }
    });

    panel.querySelectorAll('.j-unassign-student').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const studentId = btn.dataset.studentId;
        const teamName = btn.dataset.teamName;
        const team = club.teams.find(t => t.name === teamName);
        if (team) {
          const studentIndex = team.roster.findIndex(s => s.id === studentId);
          if (studentIndex > -1) {
            club.unassignedStudents.push(team.roster[studentIndex]);
            team.roster.splice(studentIndex, 1);
            refreshPanel();
          }
        }
      });
    });
  }

  function buildAgeGroupSelect(root, club, refreshPanel) {
    const trigger = root.querySelector('.c-select__trigger');
    const valueLabel = root.querySelector('.j-select-value');
    const menu = root.querySelector('.c-select__menu');

    const ageOptions = club.ageGroups || [];
    const currentValue = club._selectedAgeGroup || ageOptions[0] || '';
    valueLabel.textContent = currentValue || 'Select group';

    function renderMenu() {
      const curVal = club._selectedAgeGroup || ageOptions[0] || '';

      let html = ageOptions.map((opt) => `
        <div class="c-select__option-container" style="display: flex; align-items: center; justify-content: space-between; border-radius: var(--radius-sm);">
          <button type="button" class="c-select__option ${opt === curVal ? 'c-is-selected' : ''}" data-value="${escapeHtml(opt)}" role="option" style="flex: 1; text-align: left; background: none; border: none; display: flex; align-items: center; justify-content: space-between; margin: 0; padding: 6px 12px; font-size: 13px; ${opt === curVal ? 'color: #207c82 !important; font-weight: 700;' : ''}">
            <span>${escapeHtml(opt)}</span>
            ${opt === curVal ? `<span style="color: #207c82 !important;">${icon('check', 15)}</span>` : ''}
          </button>
          <button type="button" class="j-delete-age-group-btn" data-value="${escapeHtml(opt)}" title="Delete this group" style="background: none; border: none; color: #dc3545; cursor: pointer; padding: 6px 12px; display: inline-flex; align-items: center; justify-content: center; opacity: 0.7; transition: opacity 0.2s;">
            ${icon('trash2', 13)}
          </button>
        </div>`).join('');

      html += `
        <div class="c-select__add-row" style="padding: 6px 12px; display: flex; align-items: center; border-top: 1px solid rgba(0,0,0,0.05);">
          <button type="button" class="j-age-group-add-trigger" style="background: none; border: none; padding: 0; display: flex; align-items: center; gap: 8px; color: var(--sky-blue); font-weight: 600; font-size: 13px; cursor: pointer; width: 100%;">
            ${icon('plus', 14)} Add age group
          </button>
          <div class="j-age-group-add-input-wrapper" style="display: none; align-items: center; gap: 6px; width: 100%;">
            <input type="text" class="c-field-input j-age-group-new-input" placeholder="e.g. Under 13" style="font-size: 12px; padding: 4px 8px; height: 26px; flex: 1; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" />
            <button type="button" class="j-age-group-new-save" style="background: none; border: none; cursor: pointer; color: #28a745; padding: 2px;">${icon('check', 15)}</button>
            <button type="button" class="j-age-group-new-cancel" style="background: none; border: none; cursor: pointer; color: #dc3545; padding: 2px;">${icon('x', 15)}</button>
          </div>
        </div>`;

      menu.innerHTML = html;

      // Select option handler
      menu.querySelectorAll('.c-select__option').forEach((optionBtn) => {
        optionBtn.addEventListener('click', () => {
          club._selectedAgeGroup = optionBtn.dataset.value;
          closeMenu();
          refreshPanel();
        });
      });

      // Delete option handler
      menu.querySelectorAll('.j-delete-age-group-btn').forEach((deleteBtn) => {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetGroup = deleteBtn.dataset.value;
          showConfirmDeleteModal({
            title: 'Delete age group?',
            description: `Are you sure you want to delete the age group "${targetGroup}"? Any teams or unassigned students associated with this group will remain, but the filter tag will be removed.`,
            buttonText: 'Delete group',
            onConfirm: () => {
              club.ageGroups = (club.ageGroups || []).filter(g => g !== targetGroup);
              if (club._selectedAgeGroup === targetGroup) {
                club._selectedAgeGroup = club.ageGroups.length ? club.ageGroups[0] : null;
              }
              closeMenu();
              refreshPanel();
            }
          });
        });
      });

      // Add trigger handler
      const addTrigger = menu.querySelector('.j-age-group-add-trigger');
      const addWrapper = menu.querySelector('.j-age-group-add-input-wrapper');
      const newInput = menu.querySelector('.j-age-group-new-input');
      const saveBtn = menu.querySelector('.j-age-group-new-save');
      const cancelBtn = menu.querySelector('.j-age-group-new-cancel');

      if (addTrigger && addWrapper && newInput) {
        addTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          addTrigger.style.display = 'none';
          addWrapper.style.display = 'flex';
          newInput.focus();
        });

        cancelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          newInput.value = '';
          addWrapper.style.display = 'none';
          addTrigger.style.display = 'flex';
        });

        const performSave = () => {
          const val = newInput.value.trim();
          if (!val) return;
          if (!club.ageGroups) club.ageGroups = [];
          if (!club.ageGroups.includes(val)) {
            club.ageGroups.push(val);
          }
          club._selectedAgeGroup = val;
          closeMenu();
          refreshPanel();
        };

        saveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          performSave();
        });

        newInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            performSave();
          } else if (e.key === 'Escape') {
            e.stopPropagation();
            newInput.value = '';
            addWrapper.style.display = 'none';
            addTrigger.style.display = 'flex';
          }
        });

        newInput.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }

      const selectedBtn = menu.querySelector('.c-is-selected');
      if (selectedBtn) selectedBtn.scrollIntoView({ block: 'center' });
    }

    function positionMenu() {
      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 12;
      const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
      const availableAbove = rect.top - viewportPadding;
      const openAbove = availableBelow < 176 && availableAbove > availableBelow;
      const maxHeight = Math.max(96, Math.min(240, (openAbove ? availableAbove : availableBelow) - 6));
      menu.classList.toggle('c-placement-above', openAbove);
      menu.style.maxHeight = `${maxHeight}px`;
      menu.style.width = `220px`;
      menu.style.left = `${Math.max(viewportPadding, Math.min(rect.left + rect.width - 220, window.innerWidth - 220 - viewportPadding))}px`;
      if (openAbove) { menu.style.bottom = `${window.innerHeight - rect.top + 6}px`; menu.style.top = ''; }
      else { menu.style.top = `${rect.bottom + 6}px`; menu.style.bottom = ''; }
    }

    function openMenu() {
      closeAllSelects();
      renderMenu();
      root.classList.add('c-is-open');
      trigger.setAttribute('aria-expanded', 'true');
      positionMenu();
      requestAnimationFrame(() => root.classList.add('c-is-menu-visible'));
      window.addEventListener('resize', positionMenu);
      window.addEventListener('scroll', positionMenu, true);
    }

    function closeMenu() {
      root.classList.remove('c-is-open', 'c-is-menu-visible');
      trigger.setAttribute('aria-expanded', 'false');
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      root.classList.contains('c-is-open') ? closeMenu() : openMenu();
    });

    root.__closeSelect = closeMenu;
    activeSelectRoots.push(root);
    pruneSelectRoots();
    return root;
  }

  function saveTeam(club, mode, teamIndex, nextTeam) {
    if (mode === 'create') {
      club.teams = club.teams.concat([nextTeam]);
    } else {
      club.teams = club.teams.map((t, i) => (i === teamIndex ? nextTeam : t));
    }
    closeModal(document.getElementById('j-modal-layer'));
    renderDetailView(club.id);
  }

  function saveProgram(club, details) {
    club._program = details;
    closeModal(document.getElementById('j-modal-layer'));
    renderDetailView(club.id);
  }

  function saveCalendarEvent(club, editingEvent, draft) {
    const cal = club._calendar;
    if (editingEvent) {
      const updated = Object.assign({}, editingEvent, { date: draft.date, meta: draft.time, result: draft.result, title: draft.title, type: draft.type || editingEvent.type, venue: draft.details });
      if (String(editingEvent.id).indexOf('session-event-') === 0) {
        cal.added = cal.added.map((e) => (e.id === editingEvent.id ? updated : e));
      } else {
        cal.overrides[editingEvent.id] = updated;
      }
      cal.selectedDate = draft.date;
    } else {
      cal.added = cal.added.concat([{ date: draft.date, id: `session-event-${Date.now()}`, meta: draft.time, result: draft.result, title: draft.title, tone: 'c-tone-terracotta', type: draft.type || 'Session event', venue: draft.details }]);
      cal.selectedDate = draft.date;
    }
    closeModal(document.getElementById('j-modal-layer'));
    renderDetailView(club.id);
  }
  function deleteCalendarEvent(club, eventId) {
    const cal = club._calendar;
    if (String(eventId).indexOf('session-event-') === 0) {
      cal.added = cal.added.filter((e) => String(e.id) !== String(eventId));
    } else {
      cal.overrides[eventId] = Object.assign({}, cal.overrides[eventId] || cal.seeded.find(e => String(e.id) === String(eventId)), { deleted: true });
    }
    renderDetailView(club.id);
  }

  /* =======================================================================
     9. ACHIEVEMENT VIEW
     ======================================================================= */

  function renderAchievementView(id, achievementIndexRaw, isEditing = false) {
    const club = getClub(id);
    const achievementIndex = Number.parseInt(achievementIndexRaw, 10);
    const achievement = (club && Number.isInteger(achievementIndex) && achievementIndex >= 0) ? club.awards[achievementIndex] : undefined;

    if (!club || !achievement) {
      viewRootEl.innerHTML = `
        <section class="c-panel" style="display:flex;min-height:60vh;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
          ${icon('trophy', 44)}
          <h1 class="c-page-header__title c-font-display" style="margin-top:1rem;">Achievement not found</h1>
          <p style="margin-top:0.5rem;max-width:28rem;font-size:0.875rem;line-height:1.6;color:rgba(15,65,74,0.6);">Return to the extracurricular page and select an achievement to view its details.</p>
          <button type="button" class="c-btn c-btn--solid c-btn--lg" id="j-back-to-detail" style="margin-top:1.5rem;">${icon('arrow-left', 16)} Back to extracurricular</button>
        </section>`;
      document.getElementById('j-back-to-detail').addEventListener('click', () => navigate(`#/extracurricular/${id}`));
      return;
    }

    const eventName = achievement.title || achievement.tournament;
    const eventDate = achievement.date || achievement.year;
    const participants = achievement.participants || [];
    const gallery = achievement.gallery || (achievement.gallery = []);

    const editOutline = isEditing ? 'border-bottom: 1px dashed var(--sky-blue); outline: none; background: rgba(127,199,204,0.05); padding: 2px 4px; border-radius: 4px;' : '';
    const textOutline = isEditing ? 'border: 1px dashed var(--sky-blue); outline: none; background: rgba(127,199,204,0.05); padding: 6px; border-radius: 4px; display: block; min-height: 1.5rem;' : '';

    viewRootEl.innerHTML = `
      <div class="c-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <button type="button" class="c-back-link-btn" id="j-back-to-detail" style="margin: 0;">${icon('arrow-left', 16)} Back</button>
          
          ${isEditing ? `
            <div style="display: flex; gap: 8px;">
              <button type="button" class="c-btn c-btn--ghost c-btn--sm" id="j-edit-ach-cancel">Cancel</button>
              <button type="button" class="c-btn c-btn--solid c-btn--sm" id="j-edit-ach-save" style="background-color: var(--sky-blue); border-color: var(--sky-blue); color: white;">Save Changes</button>
            </div>
          ` : `
            <button type="button" class="c-btn c-btn--sky c-btn--sm" id="j-open-edit-achievement" style="display:inline-flex;align-items:center;gap:0.35rem;">${icon('pen', 14)} Edit Achievement</button>
          `}
        </div>
        <article class="c-achv-article">
          <header class="c-achv-hero">
            <div class="c-achv-hero__chips">
              <span id="j-ach-edit-place" class="c-chip c-chip--sunshine" contenteditable="${isEditing}" style="${isEditing ? 'border-bottom: 1px dashed white; outline: none; padding: 2px 6px;' : ''}">${escapeHtml(achievement.place || 'Achievement')}</span>
              <span id="j-ach-edit-level" class="c-chip c-chip--sky" contenteditable="${isEditing}" style="${isEditing ? 'border-bottom: 1px dashed white; outline: none; padding: 2px 6px;' : ''}">${escapeHtml(achievement.level)}</span>
              <span id="j-ach-edit-year" class="c-chip c-chip--sand" contenteditable="${isEditing}" style="${isEditing ? 'border-bottom: 1px dashed white; outline: none; padding: 2px 6px;' : ''}">${escapeHtml(achievement.year)}</span>
            </div>
            <h1 id="j-ach-edit-title" class="c-achv-hero__title c-font-display" contenteditable="${isEditing}" style="${editOutline}">${escapeHtml(eventName)}</h1>
            <p class="c-achv-hero__meta">
              ${icon('calendar-days', 16)}<span id="j-ach-edit-header-date" contenteditable="${isEditing}" style="${editOutline}">${escapeHtml(eventDate)}</span>
              ${achievement.venue || isEditing ? `<span aria-hidden="true">·</span>${icon('map-pin', 16)}<span id="j-ach-edit-header-venue" contenteditable="${isEditing}" style="${editOutline}">${escapeHtml(achievement.venue || '')}</span>` : ''}
            </p>
          </header>
          <div class="c-achv-body">
            <section class="c-achv-summary">
              <p id="j-ach-edit-bio" contenteditable="${isEditing}" style="${textOutline}">${escapeHtml(achievement.bio || `${achievement.title} was recognised during the ${achievement.year} season as a ${String(achievement.level).toLowerCase()} ${String(achievement.kind).toLowerCase()} achievement.`)}</p>
              ${achievement.details || isEditing ? `<p id="j-ach-edit-details" contenteditable="${isEditing}" style="${textOutline}">${escapeHtml(achievement.details || '')}</p>` : ''}
            </section>
            <section>
              <div class="c-section-heading">${icon('trophy', 18)}<h2>Event information</h2></div>
              
              <div class="c-fact-grid">
                <ul>
                  ${renderFactItemInline('Tournament / event', achievement.tournament || achievement.title, 'j-fact-tournament', isEditing)}
                  ${renderFactItemInline('Date', eventDate, 'j-fact-date', isEditing)}
                  ${renderFactItemInline('Venue', achievement.venue, 'j-fact-venue', isEditing)}
                  ${renderFactItemInline('Scope / level', achievement.scope || achievement.level, 'j-fact-scope', isEditing)}

                  ${isEditing ? `
                    <!-- Age Group Selection Row (below Scope / level) -->
                    <li class="c-fact-item" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                      <span class="c-fact-item__dot" aria-hidden="true"></span>
                      <div style="width: 100%;">
                        <p class="c-fact-item__label" style="margin-bottom: 0.35rem;">Age Group</p>
                        <div class="c-segmented-tabs" id="j-ach-age-tabs" style="display: inline-flex; gap: 0.35rem; flex-wrap: wrap; background: rgba(127, 199, 204, 0.12); padding: 4px; border-radius: 2rem; border: 1px solid var(--color-border);">
                          ${['Under 13', 'Under 15', 'Under 17', 'Under 19', 'Open'].map(ag => `
                            <button type="button" class="c-segmented-tab j-ach-age-btn ${(achievement.ageGroup || 'Under 19') === ag ? 'is-active' : ''}" data-val="${ag}" style="border-radius: 1.5rem; padding: 4px 14px; font-size: 0.8125rem; font-weight: 600; cursor: pointer;">${ag}</button>
                          `).join('')}
                        </div>
                      </div>
                    </li>

                    <!-- Representing Selection Row (below Age Group) -->
                    <li class="c-fact-item" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                      <span class="c-fact-item__dot" aria-hidden="true"></span>
                      <div style="width: 100%;">
                        <p class="c-fact-item__label" style="margin-bottom: 0.35rem;">Representing (Team / Individual)</p>
                        <div class="c-segmented-tabs" id="j-ach-team-tabs" style="display: inline-flex; gap: 0.35rem; flex-wrap: wrap; background: rgba(127, 199, 204, 0.12); padding: 4px; border-radius: 2rem; border: 1px solid var(--color-border);">
                          ${getClubTeamNames(club).map(tName => `
                            <button type="button" class="c-segmented-tab j-ach-team-btn ${(achievement.teamName || achievement.kind) === tName ? 'is-active' : ''}" data-team="${escapeHtml(tName)}" style="border-radius: 1.5rem; padding: 4px 14px; font-size: 0.8125rem; font-weight: 600; cursor: pointer;">${escapeHtml(tName)}</button>
                          `).join('')}
                          <button type="button" class="c-segmented-tab j-ach-team-btn ${(achievement.kind === 'Individual' || achievement.teamName === 'Individual') ? 'is-active' : ''}" data-team="Individual" style="border-radius: 1.5rem; padding: 4px 14px; font-size: 0.8125rem; font-weight: 600; cursor: pointer;">Individual</button>
                        </div>

                        <div id="j-ach-individual-wrap" style="margin-top: 0.75rem; display: ${(achievement.kind === 'Individual' || achievement.teamName === 'Individual') ? 'block' : 'none'};">
                          <label style="display: block; font-size: 11px; font-weight: 600; color: rgba(15, 65, 74, 0.75); margin-bottom: 0.3rem;">Select Individual Recipient</label>
                          <div class="c-select" id="j-ach-individual-select" style="width: 100%; max-width: 340px;">
                            <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false" style="width: 100%;">
                              <span class="j-select-value">-- Choose Student --</span>
                              ${icon('chevron-down', 16, 'c-select__chevron')}
                            </button>
                            <div class="c-select__menu" role="listbox"></div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ` : `
                    ${renderFactItemInline('Age group', achievement.ageGroup, 'j-fact-ageGroup', false)}
                  `}
                </ul>
                <ul>
                  ${renderFactItemInline('Organised by', achievement.organisedBy, 'j-fact-organisedBy', isEditing)}
                  ${renderFactItemInline('Position / result', achievement.place, 'j-fact-place', isEditing)}
                  ${renderFactItemInline('Award / medal', achievement.colours, 'j-fact-colours', isEditing)}
                  ${!isEditing ? renderFactItemInline('Representing', achievement.teamName || achievement.recipient || club.name, 'j-fact-representing', false) : ''}
                </ul>
              </div>
            </section>
            <section class="c-participants-panel" id="j-ach-participants-section">
              <div class="c-participants-panel__top">
                <h2 class="c-participants-panel__heading">${icon('users', 17)} Participants</h2>
                <span class="c-participants-panel__count" id="j-ach-part-count">${participants.length}</span>
              </div>
              <div id="j-ach-participants-container">
                ${participants.length ? `
                  <ul class="c-participants-grid">${participants.map((p) => `<li class="c-participant"><span class="c-participant__dot"></span>${escapeHtml(p)}</li>`).join('')}</ul>` :
          `<p class="c-participants-empty">Participant details have not been recorded for this achievement.</p>`}
              </div>
            </section>
            <section>
              <div class="c-section-heading">${icon('image-plus', 18)}<h2>Event gallery</h2></div>
              <div class="c-gallery-grid" id="j-achievement-gallery"></div>
              <input class="c-visually-hidden" id="j-gallery-upload" type="file" accept="image/*" multiple />
            </section>

            <section class="c-panel" style="border: 1px solid rgba(127,3,3,0.3); background: rgba(127,3,3,0.02); border-radius: var(--radius-xl); padding: 1.5rem; margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="margin: 0; font-size: 1rem; font-weight: 700; color: #7f0303; display: flex; align-items: center; gap: 6px;">
                  ${icon('trash-2', 18)} Danger Zone
                </h3>
                <p style="margin: 0.25rem 0 0; font-size: 0.8125rem; color: rgba(15, 65, 74, 0.75);">
                  Permanently delete this achievement card from the records of ${escapeHtml(club.name)}.
                </p>
              </div>
              <button type="button" class="c-btn j-delete-achievement-page-btn" style="background: #7f0303; color: #fff; border: none; padding: 0.625rem 1.25rem; font-size: 0.8125rem; font-weight: 600; border-radius: var(--radius-lg); cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                Delete Achievement
              </button>
            </section>
          </div>
        </article>
      </div>`;

    document.getElementById('j-back-to-detail').addEventListener('click', () => navigate(`#/extracurricular/${club.id}`));

    function updateParticipantsGrid(newParts) {
      achievement.participants = newParts.slice();
      const countEl = document.getElementById('j-ach-part-count');
      const containerEl = document.getElementById('j-ach-participants-container');
      if (countEl) countEl.textContent = String(newParts.length);
      if (containerEl) {
        containerEl.innerHTML = newParts.length ? `
          <ul class="c-participants-grid">${newParts.map((p) => `<li class="c-participant"><span class="c-participant__dot"></span>${escapeHtml(p)}</li>`).join('')}</ul>` :
          `<p class="c-participants-empty">Participant details have not been recorded for this achievement.</p>`;
      }
    }

    // Age Group tabs event listener
    document.querySelectorAll('.j-ach-age-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.j-ach-age-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        achievement.ageGroup = btn.dataset.val;
        const factAge = document.getElementById('j-fact-ageGroup');
        if (factAge) factAge.textContent = achievement.ageGroup;
      });
    });

    // Team / Category tabs event listener
    document.querySelectorAll('.j-ach-team-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.j-ach-team-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const selectedTeamName = btn.dataset.team;

        const indWrap = document.getElementById('j-ach-individual-wrap');
        const repFact = document.getElementById('j-fact-representing');

        if (selectedTeamName === 'Individual') {
          achievement.kind = 'Individual';
          achievement.teamName = 'Individual';
          if (indWrap) indWrap.style.display = 'block';
          const indSelect = document.getElementById('j-ach-individual-select');
          const chosenName = indSelect ? indSelect.value : '';
          achievement.recipient = chosenName;
          if (repFact) repFact.textContent = chosenName || 'Individual';
          updateParticipantsGrid(chosenName ? [chosenName] : []);
        } else {
          achievement.kind = 'Team';
          achievement.teamName = selectedTeamName;
          if (indWrap) indWrap.style.display = 'none';
          if (repFact) repFact.textContent = selectedTeamName;
          const roster = getStudentsForTeam(club, selectedTeamName);
          updateParticipantsGrid(roster);
        }
      });
    });

    // Individual Student Dropdown listener (Custom .c-select dropdown)
    const indSelectRoot = document.getElementById('j-ach-individual-select');
    if (indSelectRoot) {
      const studentOptions = [
        { value: '', label: '-- Choose Student --' },
        ...getClubAllStudents(club).map(s => ({ value: s, label: s }))
      ];
      buildSelect(
        indSelectRoot,
        studentOptions,
        () => achievement.recipient || (participants[0] || ''),
        (studentName) => {
          achievement.recipient = studentName;
          const repFact = document.getElementById('j-fact-representing');
          if (repFact && achievement.kind === 'Individual') repFact.textContent = studentName || 'Individual';
          if (achievement.kind === 'Individual') {
            updateParticipantsGrid(studentName ? [studentName] : []);
          }
        }
      );
    }

    if (isEditing) {
      document.getElementById('j-edit-ach-cancel').addEventListener('click', () => {
        renderAchievementView(club.id, achievementIndexRaw, false);
      });

      document.getElementById('j-edit-ach-save').addEventListener('click', () => {
        achievement.title = document.getElementById('j-ach-edit-title').innerText.trim();
        achievement.place = document.getElementById('j-ach-edit-place').innerText.trim();
        achievement.level = document.getElementById('j-ach-edit-level').innerText.trim();
        achievement.year = document.getElementById('j-ach-edit-year').innerText.trim();
        achievement.date = document.getElementById('j-ach-edit-header-date').innerText.trim();

        const venueHeaderEl = document.getElementById('j-ach-edit-header-venue');
        achievement.venue = venueHeaderEl ? venueHeaderEl.innerText.trim() : '';

        achievement.bio = document.getElementById('j-ach-edit-bio').innerText.trim();

        const detailsEl = document.getElementById('j-ach-edit-details');
        achievement.details = detailsEl ? detailsEl.innerText.trim() : '';

        achievement.tournament = document.getElementById('j-fact-tournament').innerText.trim();
        achievement.scope = document.getElementById('j-fact-scope').innerText.trim();
        achievement.ageGroup = document.getElementById('j-fact-ageGroup') ? document.getElementById('j-fact-ageGroup').innerText.trim() : achievement.ageGroup;
        achievement.organisedBy = document.getElementById('j-fact-organisedBy').innerText.trim();
        achievement.colours = document.getElementById('j-fact-colours').innerText.trim();

        const repVal = document.getElementById('j-fact-representing').innerText.trim();
        if (achievement.kind === 'Individual') {
          achievement.recipient = repVal;
        } else {
          achievement.teamName = repVal;
        }

        renderAchievementView(club.id, achievementIndexRaw, false);
      });
    } else {
      const editAchBtn = document.getElementById('j-open-edit-achievement');
      if (editAchBtn) {
        editAchBtn.addEventListener('click', () => {
          renderAchievementView(club.id, achievementIndexRaw, true);
        });
      }
    }

    const deleteAchBtn = viewRootEl.querySelector('.j-delete-achievement-page-btn');
    if (deleteAchBtn) {
      deleteAchBtn.addEventListener('click', () => {
        showConfirmDeleteModal({
          title: 'Delete achievement?',
          description: `This will permanently remove the achievement "${achievement.title}" from the records of ${escapeHtml(club.name)}.`,
          buttonText: 'Delete achievement',
          onConfirm: () => {
            club.awards.splice(achievementIndex, 1);
            navigate(`#/extracurricular/${club.id}`);
          }
        });
      });
    }

    function renderGalleryItems() {
      const galleryGrid = document.getElementById('j-achievement-gallery');
      if (!galleryGrid) return;
      const galleryList = achievement.gallery || [];
      galleryGrid.innerHTML = `
        ${galleryList.map((src, i) => `
          <div class="c-gallery-item" style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--color-border);">
            <img src="${src}" alt="${escapeHtml(achievement.title)} gallery image ${i + 1}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            <button type="button" class="j-remove-gallery-img" data-idx="${i}" style="position: absolute; top: 6px; right: 6px; background: rgba(15,65,74,0.75); color: #fff; border: none; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(127,3,3,0.9)'" onmouseout="this.style.background='rgba(15,65,74,0.75)'" title="Delete photo">
              ${icon('x', 14)}
            </button>
          </div>
        `).join('')}
        <button type="button" class="c-gallery-add-btn" id="j-open-gallery-upload-btn">${icon('plus', 24)}<span>Add photos</span></button>
      `;

      galleryGrid.querySelectorAll('.j-remove-gallery-img').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const idx = Number(btn.dataset.idx);
          if (achievement.gallery) {
            achievement.gallery.splice(idx, 1);
          }
          renderGalleryItems();
        });
      });

      const openUploadBtn = document.getElementById('j-open-gallery-upload-btn');
      const galleryUpload = document.getElementById('j-gallery-upload');
      if (openUploadBtn && galleryUpload) {
        openUploadBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          galleryUpload.click();
        });
      }
    }

    renderGalleryItems();

    const galleryUpload = document.getElementById('j-gallery-upload');
    if (galleryUpload) {
      galleryUpload.addEventListener('change', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const files = event.target.files;
        if (!files || !files.length) return;
        Promise.all(Array.from(files).map(readImageFile)).then((images) => {
          const validImgs = images.filter(Boolean);
          if (validImgs.length) {
            achievement.gallery = (achievement.gallery || []).concat(validImgs);
            renderGalleryItems();
          }
          galleryUpload.value = '';
        }).catch((err) => {
          console.error('Gallery image upload error:', err);
          galleryUpload.value = '';
        });
      });
    }
  }

  function getClubTeamNames(club) {
    if (club && club.teams && club.teams.length) {
      return club.teams.map(t => t.name);
    }
    if (club && (club.type === 'Sports' || club.category === 'Athletics')) {
      return ['1st XI Team', 'Under 19 Team', 'Under 17 Squad'];
    }
    const name = club ? club.name : 'School';
    return [`${name} Senior Team`, `${name} Junior Team`];
  }

  function getClubAllStudents(club) {
    const names = new Set();
    if (club) {
      if (club.teams) {
        club.teams.forEach(t => {
          if (t.roster) {
            t.roster.forEach(r => {
              const n = typeof r === 'string' ? r : r.name;
              if (n) names.add(n);
            });
          }
        });
      }
      if (club.unassignedStudents) {
        club.unassignedStudents.forEach(s => {
          const n = typeof s === 'string' ? s : s.name;
          if (n) names.add(n);
        });
      }
    }
    if (names.size === 0) {
      ['Kavindu Perera', 'Dilshan Senanayake', 'Nuwan Pradeep', 'Ashan Priyanjan', 'Tariq Mansoor', 'Pathum Nissanka', 'Maheesh Theekshana', 'Charith Asalanka'].forEach(n => names.add(n));
    }
    return Array.from(names);
  }

  function getStudentsForTeam(club, teamName) {
    if (club && club.teams) {
      const found = club.teams.find(t => t.name === teamName);
      if (found && found.roster && found.roster.length) {
        return found.roster.map(r => typeof r === 'string' ? r : r.name);
      }
    }
    if (teamName.includes('Under 17') || teamName.includes('Junior')) {
      return ['Janith Liyanage (Captain)', 'Dhananjaya de Silva', 'Wanindu Hasaranga', 'Sahan Arachchige', 'Dunith Wellalage'];
    }
    return [
      'Kavindu Perera (Captain)',
      'Dilshan Senanayake (Vice Captain)',
      'Nuwan Pradeep',
      'Ashan Priyanjan',
      'Tariq Mansoor',
      'Pathum Nissanka',
      'Maheesh Theekshana'
    ];
  }

  function renderAddAchievementView(id) {
    const club = getClub(id);
    if (!club) {
      navigate('#/extracurricular');
      return;
    }

    let coverImage = '';
    let galleryImages = [];

    const teamOptions = getClubTeamNames(club);
    const allStudents = getClubAllStudents(club);
    let selectedAgeGroup = 'Under 19';
    let selectedTeam = teamOptions[0] || '1st XI Team';
    let selectedIndividual = '';

    // Auto-fill initial roster for selected team
    let participantsList = getStudentsForTeam(club, selectedTeam);

    viewRootEl.innerHTML = `
      <div class="c-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <button type="button" class="c-back-link-btn" id="j-back-to-detail" style="margin: 0;">${icon('arrow-left', 16)} Back</button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="c-btn c-btn--ghost c-btn--sm" id="j-add-ach-cancel">Cancel</button>
            <button type="button" class="c-btn c-btn--solid c-btn--sm" id="j-add-ach-save" style="background-color: var(--sky-blue); border-color: var(--sky-blue); color: white;">Save Achievement</button>
          </div>
        </div>

        <article class="c-achv-article">
          <header class="c-achv-hero">
            <div class="c-achv-hero__chips">
              <span id="j-new-ach-place" class="c-chip c-chip--sunshine" contenteditable="true" data-placeholder="e.g. Gold Medal" style="border-bottom: 1px dashed white; outline: none; padding: 2px 6px; min-width: 70px; display: inline-block;"></span>
              <span id="j-new-ach-level" class="c-chip c-chip--sky" contenteditable="true" data-placeholder="e.g. Provincial" style="border-bottom: 1px dashed white; outline: none; padding: 2px 6px; min-width: 70px; display: inline-block;"></span>
              <span id="j-new-ach-year" class="c-chip c-chip--sand" contenteditable="true" data-placeholder="e.g. 2024" style="border-bottom: 1px dashed white; outline: none; padding: 2px 6px; min-width: 45px; display: inline-block;"></span>
            </div>
            <h1 id="j-new-ach-title" class="c-achv-hero__title c-font-display" contenteditable="true" data-placeholder="Enter achievement title or award name..." style="border-bottom: 1px dashed var(--sky-blue); outline: none; background: rgba(127,199,204,0.05); padding: 4px 8px; border-radius: 4px; min-height: 2.2rem; margin-top: 0.5rem;"></h1>
            <p class="c-achv-hero__meta" style="margin-top: 0.5rem;">
              ${icon('calendar-days', 16)}<span id="j-new-ach-header-date" contenteditable="true" data-placeholder="e.g. Nov 18, 2024" style="border-bottom: 1px dashed var(--sky-blue); outline: none; background: rgba(127,199,204,0.05); padding: 2px 6px; border-radius: 4px; min-width: 90px; display: inline-block;"></span>
              <span aria-hidden="true">·</span>${icon('map-pin', 16)}<span id="j-new-ach-header-venue" contenteditable="true" data-placeholder="e.g. SSC Grounds, Colombo" style="border-bottom: 1px dashed var(--sky-blue); outline: none; background: rgba(127,199,204,0.05); padding: 2px 6px; border-radius: 4px; min-width: 120px; display: inline-block;"></span>
            </p>
          </header>

          <div class="c-achv-body">
            <section class="c-achv-summary">
              <p style="margin-bottom:0.25rem; font-size:10px; font-weight:700; text-transform:uppercase; color:rgba(15,65,74,0.5);">Achievement Summary / Bio</p>
              <p id="j-new-ach-bio" contenteditable="true" data-placeholder="Describe achievement highlights, overall performance, and key team accomplishments..." style="border: 1px dashed var(--sky-blue); outline: none; background: rgba(127,199,204,0.05); padding: 8px; border-radius: 4px; display: block; min-height: 2.5rem;"></p>
              
              <p style="margin-top:0.75rem; margin-bottom:0.25rem; font-size:10px; font-weight:700; text-transform:uppercase; color:rgba(15,65,74,0.5);">Additional Details</p>
              <p id="j-new-ach-details" contenteditable="true" data-placeholder="Enter full tournament match scores, specific recognitions, or special notes..." style="border: 1px dashed var(--sky-blue); outline: none; background: rgba(127,199,204,0.05); padding: 8px; border-radius: 4px; display: block; min-height: 2.5rem;"></p>
            </section>

            <!-- Cover Image Upload -->
            <section style="margin-top:1.5rem;">
              <div class="c-section-heading">${icon('image', 18)}<h2>Cover photo</h2></div>
              <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
                <div id="j-new-ach-cover-preview" style="width: 220px; height: 130px; border-radius: var(--radius-lg); overflow: hidden; background: var(--alabaster); display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-border);">
                  <span style="color:rgba(15,65,74,0.4);font-size:0.75rem;">No cover photo selected</span>
                </div>
                <div>
                  <label class="c-btn c-btn--ghost c-btn--sm" for="j-new-ach-cover-input" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                    ${icon('image-plus', 15)} Choose Cover Photo
                  </label>
                  <input class="c-visually-hidden" id="j-new-ach-cover-input" type="file" accept="image/*" />
                  <p style="margin-top:0.35rem;font-size:11px;color:rgba(15,65,74,0.5);">Select an image file to display on the achievement card.</p>
                </div>
              </div>
            </section>

            <section style="margin-top:1.5rem;">
              <div class="c-section-heading">${icon('trophy', 18)}<h2>Event information</h2></div>

              <div class="c-fact-grid">
                <ul>
                  ${renderFactItemInline('Tournament / event', '', 'j-fact-tournament', true, 'e.g. Provincial Div-1 Championship')}
                  ${renderFactItemInline('Date', '', 'j-fact-date', true, 'e.g. Nov 18, 2024')}
                  ${renderFactItemInline('Venue', '', 'j-fact-venue', true, 'e.g. SSC Grounds, Colombo')}
                  ${renderFactItemInline('Scope / level', '', 'j-fact-scope', true, 'e.g. All-Island / Provincial')}

                  <!-- Age Group Selection Row (below Scope / level) -->
                  <li class="c-fact-item" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="c-fact-item__dot" aria-hidden="true"></span>
                    <div style="width: 100%;">
                      <p class="c-fact-item__label" style="margin-bottom: 0.35rem;">Age Group</p>
                      <div class="c-segmented-tabs" id="j-new-ach-age-tabs" style="display: inline-flex; gap: 0.35rem; flex-wrap: wrap; background: rgba(127, 199, 204, 0.12); padding: 4px; border-radius: 2rem; border: 1px solid var(--color-border);">
                        ${['Under 13', 'Under 15', 'Under 17', 'Under 19', 'Open'].map(ag => `
                          <button type="button" class="c-segmented-tab j-new-ach-age-btn ${selectedAgeGroup === ag ? 'is-active' : ''}" data-val="${ag}" style="border-radius: 1.5rem; padding: 4px 14px; font-size: 0.8125rem; font-weight: 600; cursor: pointer;">${ag}</button>
                        `).join('')}
                      </div>
                    </div>
                  </li>

                  <!-- Representing Selection Row (below Age Group) -->
                  <li class="c-fact-item" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="c-fact-item__dot" aria-hidden="true"></span>
                    <div style="width: 100%;">
                      <p class="c-fact-item__label" style="margin-bottom: 0.35rem;">Representing (Team / Individual)</p>
                      <div class="c-segmented-tabs" id="j-new-ach-team-tabs" style="display: inline-flex; gap: 0.35rem; flex-wrap: wrap; background: rgba(127, 199, 204, 0.12); padding: 4px; border-radius: 2rem; border: 1px solid var(--color-border);">
                        ${teamOptions.map(tName => `
                          <button type="button" class="c-segmented-tab j-new-ach-team-btn ${selectedTeam === tName ? 'is-active' : ''}" data-team="${escapeHtml(tName)}" style="border-radius: 1.5rem; padding: 4px 14px; font-size: 0.8125rem; font-weight: 600; cursor: pointer;">${escapeHtml(tName)}</button>
                        `).join('')}
                        <button type="button" class="c-segmented-tab j-new-ach-team-btn ${selectedTeam === 'Individual' ? 'is-active' : ''}" data-team="Individual" style="border-radius: 1.5rem; padding: 4px 14px; font-size: 0.8125rem; font-weight: 600; cursor: pointer;">Individual</button>
                      </div>

                      <div id="j-new-ach-individual-wrap" style="margin-top: 0.75rem; display: ${selectedTeam === 'Individual' ? 'block' : 'none'};">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: rgba(15, 65, 74, 0.75); margin-bottom: 0.3rem;">Select Individual Recipient</label>
                        <div class="c-select" id="j-new-ach-individual-select" style="width: 100%; max-width: 340px;">
                          <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false" style="width: 100%;">
                            <span class="j-select-value">-- Choose Student --</span>
                            ${icon('chevron-down', 16, 'c-select__chevron')}
                          </button>
                          <div class="c-select__menu" role="listbox"></div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                <ul>
                  ${renderFactItemInline('Organised by', '', 'j-fact-organisedBy', true, 'e.g. Schools Sports Association')}
                  ${renderFactItemInline('Position / result', '', 'j-fact-place', true, 'e.g. Champions / Runners Up')}
                  ${renderFactItemInline('Award / medal', '', 'j-fact-colours', true, 'e.g. Gold Medal / Trophy')}
                </ul>
              </div>
            </section>

            <section class="c-participants-panel" style="margin-top:1.5rem;">
              <div class="c-participants-panel__top">
                <h2 class="c-participants-panel__heading">${icon('users', 17)} Participants</h2>
                <span class="c-participants-panel__count" id="j-new-ach-part-count">0</span>
              </div>
              <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
                <input class="c-field-input" id="j-new-ach-part-input" placeholder="Type participant name and press Enter or Add" style="flex:1;" />
                <button type="button" class="c-btn c-btn--sky c-btn--sm" id="j-new-ach-part-add">Add</button>
              </div>
              <ul class="c-participants-grid" id="j-new-ach-part-list"></ul>
            </section>

            <section style="margin-top:1.5rem;">
              <div class="c-section-heading">${icon('image-plus', 18)}<h2>Event gallery</h2></div>
              <div class="c-gallery-grid" id="j-new-ach-gallery-grid">
                <label class="c-gallery-add-btn" for="j-new-ach-gallery-input">${icon('plus', 24)}<span>Add photos</span></label>
              </div>
              <input class="c-visually-hidden" id="j-new-ach-gallery-input" type="file" accept="image/*" multiple />
            </section>
          </div>
        </article>
      </div>
    `;

    document.getElementById('j-back-to-detail').addEventListener('click', () => navigate(`#/extracurricular/${club.id}`));
    document.getElementById('j-add-ach-cancel').addEventListener('click', () => navigate(`#/extracurricular/${club.id}`));

    // Cover photo upload handler
    const newCoverInput = document.getElementById('j-new-ach-cover-input');
    if (newCoverInput) {
      newCoverInput.addEventListener('change', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.target.files[0];
        if (file) {
          readImageFile(file).then((imgData) => {
            if (imgData) {
              coverImage = imgData;
              const previewEl = document.getElementById('j-new-ach-cover-preview');
              if (previewEl) {
                previewEl.innerHTML = `<img src="${imgData}" alt="Cover preview" style="width:100%;height:100%;object-fit:cover;" />`;
              }
            }
            newCoverInput.value = '';
          }).catch((err) => {
            console.error('Cover photo upload error:', err);
            newCoverInput.value = '';
          });
        }
      });
    }

    function renderNewAchievementGalleryItems() {
      const galleryGrid = document.getElementById('j-new-ach-gallery-grid');
      if (!galleryGrid) return;
      galleryGrid.innerHTML = `
        ${galleryImages.map((src, i) => `
          <div class="c-gallery-item" style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--color-border);">
            <img src="${src}" alt="Gallery photo ${i + 1}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            <button type="button" class="j-remove-new-gallery-img" data-idx="${i}" style="position: absolute; top: 6px; right: 6px; background: rgba(15,65,74,0.75); color: #fff; border: none; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(127,3,3,0.9)'" onmouseout="this.style.background='rgba(15,65,74,0.75)'" title="Delete photo">
              ${icon('x', 14)}
            </button>
          </div>
        `).join('')}
        <button type="button" class="c-gallery-add-btn" id="j-open-new-gallery-upload-btn">${icon('plus', 24)}<span>Add photos</span></button>
      `;

      galleryGrid.querySelectorAll('.j-remove-new-gallery-img').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const idx = Number(btn.dataset.idx);
          galleryImages.splice(idx, 1);
          renderNewAchievementGalleryItems();
        });
      });

      const newOpenUploadBtn = document.getElementById('j-open-new-gallery-upload-btn');
      const newGalleryInput = document.getElementById('j-new-ach-gallery-input');
      if (newOpenUploadBtn && newGalleryInput) {
        newOpenUploadBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          newGalleryInput.click();
        });
      }
    }

    renderNewAchievementGalleryItems();

    // Gallery photo upload handler
    const newGalleryInput = document.getElementById('j-new-ach-gallery-input');
    if (newGalleryInput) {
      newGalleryInput.addEventListener('change', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.target.files;
        if (files && files.length) {
          Promise.all(Array.from(files).map(readImageFile)).then((imgs) => {
            const validImgs = imgs.filter(Boolean);
            if (validImgs.length) {
              galleryImages = galleryImages.concat(validImgs);
              renderNewAchievementGalleryItems();
            }
            newGalleryInput.value = '';
          }).catch((err) => {
            console.error('New gallery photo upload error:', err);
            newGalleryInput.value = '';
          });
        }
      });
    }

    // Participants list handlers
    const partInput = document.getElementById('j-new-ach-part-input');
    const addPartBtn = document.getElementById('j-new-ach-part-add');
    const partListEl = document.getElementById('j-new-ach-part-list');
    const partCountEl = document.getElementById('j-new-ach-part-count');

    function renderParticipantItems() {
      if (partCountEl) partCountEl.textContent = String(participantsList.length);
      if (partListEl) {
        partListEl.innerHTML = participantsList.map((p, idx) => `
          <li class="c-participant" style="display:flex;justify-content:space-between;align-items:center;">
            <span><span class="c-participant__dot"></span>${escapeHtml(p)}</span>
            <button type="button" class="j-remove-participant" data-idx="${idx}" style="background:none;border:none;cursor:pointer;color:var(--maroon);padding:2px 4px;" title="Remove">${icon('x', 14)}</button>
          </li>
        `).join('');

        partListEl.querySelectorAll('.j-remove-participant').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            participantsList.splice(idx, 1);
            renderParticipantItems();
          });
        });
      }
    }

    // Render initial participant roster for default selected team!
    renderParticipantItems();

    // Age Group tabs handler
    document.querySelectorAll('.j-new-ach-age-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.j-new-ach-age-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedAgeGroup = btn.dataset.val;
        const factAge = document.getElementById('j-fact-ageGroup');
        if (factAge) factAge.textContent = selectedAgeGroup;
      });
    });

    // Team / Category tabs handler
    document.querySelectorAll('.j-new-ach-team-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.j-new-ach-team-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedTeam = btn.dataset.team;

        const indWrap = document.getElementById('j-new-ach-individual-wrap');
        const repFact = document.getElementById('j-fact-representing');

        if (selectedTeam === 'Individual') {
          if (indWrap) indWrap.style.display = 'block';
          if (repFact) repFact.textContent = selectedIndividual || 'Individual';
          participantsList = selectedIndividual ? [selectedIndividual] : [];
        } else {
          if (indWrap) indWrap.style.display = 'none';
          if (repFact) repFact.textContent = selectedTeam;
          participantsList = getStudentsForTeam(club, selectedTeam);
        }
        renderParticipantItems();
      });
    });

    // Individual student dropdown handler (Custom .c-select dropdown)
    const indSelectRoot = document.getElementById('j-new-ach-individual-select');
    if (indSelectRoot) {
      const studentOptions = [
        { value: '', label: '-- Choose Student --' },
        ...allStudents.map(s => ({ value: s, label: s }))
      ];
      buildSelect(
        indSelectRoot,
        studentOptions,
        () => selectedIndividual,
        (val) => {
          selectedIndividual = val;
          const repFact = document.getElementById('j-fact-representing');
          if (repFact && selectedTeam === 'Individual') repFact.textContent = selectedIndividual || 'Individual';
          if (selectedTeam === 'Individual') {
            participantsList = selectedIndividual ? [selectedIndividual] : [];
            renderParticipantItems();
          }
        }
      );
    }

    const addPart = () => {
      const val = partInput.value.trim();
      if (val) {
        participantsList.push(val);
        partInput.value = '';
        renderParticipantItems();
      }
    };

    if (addPartBtn) addPartBtn.addEventListener('click', addPart);
    if (partInput) partInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addPart(); } });

    document.getElementById('j-add-ach-save').addEventListener('click', () => {
      const getText = (id) => {
        const el = document.getElementById(id);
        return el ? el.textContent.trim() : '';
      };

      const title = getText('j-new-ach-title') || 'New Achievement';
      const place = getText('j-new-ach-place') || getText('j-fact-place') || 'Gold Medal';
      const level = getText('j-new-ach-level') || getText('j-fact-scope') || 'Provincial';
      const year = getText('j-new-ach-year') || '2024';
      const date = getText('j-new-ach-header-date') || getText('j-fact-date') || 'Nov 18, 2024';
      const venue = getText('j-new-ach-header-venue') || getText('j-fact-venue') || 'Colombo';
      const bio = getText('j-new-ach-bio') || '';
      const details = getText('j-new-ach-details') || '';

      const newAward = {
        title: title,
        place: place,
        level: level,
        year: year,
        kind: selectedTeam === 'Individual' ? 'Individual' : 'Team',
        date: date,
        venue: venue,
        bio: bio,
        details: details,
        tournament: getText('j-fact-tournament') || title,
        scope: getText('j-fact-scope') || level,
        ageGroup: selectedAgeGroup || getText('j-fact-ageGroup') || 'Under 19',
        organisedBy: getText('j-fact-organisedBy') || 'Schools Sports Association',
        colours: getText('j-fact-colours') || place,
        teamName: selectedTeam === 'Individual' ? (selectedIndividual || 'Individual') : selectedTeam,
        image: coverImage || 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=400&fit=crop',
        participants: participantsList.slice(),
        gallery: galleryImages.slice()
      };

      if (!club.awards) club.awards = [];
      club.awards.push(newAward);
      navigate(`#/extracurricular/${club.id}`);
    });
  }

  function renderFactItemInline(label, value, idAttr, isEditing, placeholder) {
    const editStyle = isEditing ? 'border-bottom: 1px dashed var(--sky-blue); outline: none; background: rgba(127,199,204,0.05); padding: 2px 4px; border-radius: 4px; display: inline-block; min-width: 100px;' : '';
    const placeholderAttr = isEditing && placeholder ? ` data-placeholder="${escapeHtml(placeholder)}"` : '';
    return `
      <li class="c-fact-item">
        <span class="c-fact-item__dot" aria-hidden="true"></span>
        <div>
          <p class="c-fact-item__label">${escapeHtml(label)}</p>
          <p class="c-fact-item__value" id="${idAttr}" contenteditable="${isEditing}"${placeholderAttr} style="${editStyle}">${escapeHtml(value) || (isEditing ? '' : 'Not recorded')}</p>
        </div>
      </li>`;
  }

  /* =======================================================================
     10. CUSTOM SELECT DROPDOWN
     -------------------------------------------------------------------------
     Same builder pattern as the Dashboard page's buildSelect(), adapted to
     take the root element directly (rather than an id) since this page's
     selects are (re)created fresh every time their containing view
     re-renders, instead of living permanently in the DOM like the
     Dashboard's single month/year picker.
     ======================================================================= */

  const activeSelectRoots = [];

  function buildSelect(root, options, currentValueGetter, onChoose) {
    const trigger = root.querySelector('.c-select__trigger');
    const valueLabel = root.querySelector('.j-select-value');
    const menu = root.querySelector('.c-select__menu');
    valueLabel.textContent = (options.find((o) => o.value === currentValueGetter()) || {}).label || '';

    function renderMenu() {
      const currentValue = currentValueGetter();
      menu.innerHTML = options.map((opt) => `
        <button type="button" class="c-select__option ${opt.value === currentValue ? 'c-is-selected' : ''}" data-value="${escapeHtml(opt.value)}" role="option">
          <span>${escapeHtml(opt.label)}</span>
          ${opt.value === currentValue ? `${icon('check', 15)}` : ''}
        </button>`).join('');
      menu.querySelectorAll('.c-select__option').forEach((optionBtn) => {
        optionBtn.addEventListener('click', () => {
          onChoose(optionBtn.dataset.value);
          closeMenu();
          valueLabel.textContent = (options.find((o) => o.value === currentValueGetter()) || {}).label || '';
        });
      });
      const selectedBtn = menu.querySelector('.c-is-selected');
      if (selectedBtn) selectedBtn.scrollIntoView({ block: 'center' });
    }

    function positionMenu() {
      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 12;
      const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
      const availableAbove = rect.top - viewportPadding;
      const openAbove = availableBelow < 176 && availableAbove > availableBelow;
      const maxHeight = Math.max(96, Math.min(240, (openAbove ? availableAbove : availableBelow) - 6));
      const menuMinWidth = root.classList.contains('c-select--year') ? 7 * 16 : 0;
      const menuWidth = Math.min(Math.max(rect.width, menuMinWidth), window.innerWidth - viewportPadding * 2);
      menu.classList.toggle('c-placement-above', openAbove);
      menu.style.maxHeight = `${maxHeight}px`;
      menu.style.width = `${menuWidth}px`;
      menu.style.left = `${Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - menuWidth - viewportPadding))}px`;
      if (openAbove) { menu.style.bottom = `${window.innerHeight - rect.top + 6}px`; menu.style.top = ''; }
      else { menu.style.top = `${rect.bottom + 6}px`; menu.style.bottom = ''; }
    }

    function openMenu() {
      closeAllSelects();
      renderMenu();
      root.classList.add('c-is-open');
      trigger.setAttribute('aria-expanded', 'true');
      positionMenu();
      requestAnimationFrame(() => root.classList.add('c-is-menu-visible'));
      window.addEventListener('resize', positionMenu);
      window.addEventListener('scroll', positionMenu, true);
    }

    function closeMenu() {
      root.classList.remove('c-is-open', 'c-is-menu-visible');
      trigger.setAttribute('aria-expanded', 'false');
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    }

    trigger.addEventListener('click', () => { root.classList.contains('c-is-open') ? closeMenu() : openMenu(); });

    root.__closeSelect = closeMenu;
    activeSelectRoots.push(root);
    pruneSelectRoots();
    return root;
  }

  function pruneSelectRoots() {
    for (let i = activeSelectRoots.length - 1; i >= 0; i -= 1) {
      if (!activeSelectRoots[i].isConnected) activeSelectRoots.splice(i, 1);
    }
  }

  function closeAllSelects() {
    activeSelectRoots.forEach((root) => root.__closeSelect && root.__closeSelect());
  }

  document.addEventListener('mousedown', (event) => {
    activeSelectRoots.forEach((root) => {
      if (root.isConnected && !root.contains(event.target)) root.__closeSelect();
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllSelects();
  });

  /* =======================================================================
     11. GENERIC MODAL OPEN / CLOSE
     -------------------------------------------------------------------------
     Same openModal(layerEl)/closeModal(layerEl) pair as the Dashboard page.
     This page has one shared c-modal-layer (id="j-modal-layer") whose
     #j-modal content is written just before opening, since the field
     count varies per club/team/event (unlike the Dashboard's three modals,
     which are each permanently-declared markup).
     ======================================================================= */

  function openModal(layerEl, focusEl) {
    layerEl.classList.add('c-is-open');
    if (focusEl) window.setTimeout(() => focusEl.focus(), 50);
  }

  function closeModal(layerEl) {
    layerEl.classList.remove('c-is-open');
  }

  /** Writes `contentHtml` into the shared modal shell and opens it. */
  function openModalWithContent(contentHtml, focusSelector) {
    const layerEl = document.getElementById('j-modal-layer');
    const modalEl = document.getElementById('j-modal');
    layerEl.className = 'c-modal-layer';
    modalEl.className = 'c-modal';
    modalEl.innerHTML = contentHtml;
    openModal(layerEl, focusSelector ? modalEl.querySelector(focusSelector) : null);
  }

  function initModalDismissHandlers() {
    const layerEl = document.getElementById('j-modal-layer');
    layerEl.querySelectorAll('.j-modal-backdrop').forEach((el) => {
      el.addEventListener('click', () => closeModal(layerEl));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (layerEl.classList.contains('c-is-open')) closeModal(layerEl);
    });
    document.addEventListener('click', (event) => {
      if (event.target.closest('.j-modal-close')) closeModal(layerEl);
    });
  }

  function setFieldError(fieldWrapperEl, message) {
    let errorEl = fieldWrapperEl.querySelector('.c-field-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'c-field-error';
      fieldWrapperEl.appendChild(errorEl);
    }
    errorEl.textContent = message || '';
    errorEl.classList.toggle('c-is-visible', Boolean(message));
  }

  /* =======================================================================
     12. MODAL — CREATE EXTRACURRICULAR
     ======================================================================= */

  function openCreateClubModal() {
    let positions = [{ title: '', showOnCard: true }];
    let selectedType = '';

    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('users', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">New programme</p>
            <h2 class="c-modal__title">New Extracurricular</h2>
            <p class="c-modal__description">Set up a programme and define its leadership structure.</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-create-club-form" novalidate>
        <div class="c-event-form__error-banner" id="j-create-club-error"></div>
        <div class="c-form-row c-form-row--two-col">
          <div class="c-field-span-2">
            <label class="c-field-label" for="j-cc-name">Programme name</label>
            <input class="c-field-input" id="j-cc-name" type="text" placeholder="e.g. Chess Club" />
          </div>
        </div>
        <div class="c-form-row c-form-row--two-col">
          <div>
            <label class="c-field-label">Type</label>
            <div class="c-select" id="j-cc-type">
              <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false" style="justify-content:space-between;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:#fff;padding:0.625rem 0.75rem;color:rgba(15,65,74,0.5);"><span class="j-select-value">Select type</span>${icon('chevron-down', 16)}</button>
              <div class="c-select__menu" role="listbox" aria-label="Choose type" style="border:1px solid var(--color-border);background:#fff;"></div>
            </div>
          </div>
          <div>
            <label class="c-field-label" for="j-cc-category">Category</label>
            <input class="c-field-input" id="j-cc-category" type="text" placeholder="e.g. Academic" />
          </div>
        </div>
        <div class="c-form-row c-form-row--two-col">
          <div>
            <label class="c-field-label" for="j-cc-age-limit">Limit of students per age group</label>
            <input class="c-field-input" id="j-cc-age-limit" type="number" placeholder="e.g. 30" />
          </div>
          <div>
            <label class="c-field-label" for="j-cc-team-limit">Students per team (if applicable)</label>
            <input class="c-field-input" id="j-cc-team-limit" type="number" placeholder="e.g. 11" />
          </div>
        </div>
        <div>
          <label class="c-field-label" for="j-cc-description">Description</label>
          <textarea class="c-field-input c-field-input--textarea" id="j-cc-description"></textarea>
        </div>
        <section class="c-form-section">
          <div class="c-form-section__head">
            <div>
              <h3 class="c-form-section__title">Leadership Positions Needed</h3>
              <p class="c-form-section__hint">Define optional roles such as Captain or Secretary.</p>
            </div>
            <button type="button" class="c-form-section__add-btn" id="j-cc-add-position">${icon('plus', 14)} Add Position</button>
          </div>
          <div id="j-cc-positions" style="display:flex;flex-direction:column;gap:0.75rem;"></div>
        </section>
        <footer class="c-event-form__footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">Create Programme</button>
        </footer>
      </form>`;

    openModalWithContent(html, '#j-cc-name');

    buildSelect(document.getElementById('j-cc-type'),
      [{ label: 'Sports', value: 'Sports' }, { label: 'Society', value: 'Society' }, { label: 'Club', value: 'Club' }, { label: 'Arts', value: 'Arts' }],
      () => selectedType, (value) => { selectedType = value; });

    const form = document.getElementById('j-create-club-form');
    const positionsEl = document.getElementById('j-cc-positions');

    function paintPositions() {
      positionsEl.innerHTML = positions.map((p, i) => `
        <div class="c-position-row" data-position-index="${i}">
          <input class="c-field-input" type="text" placeholder="Position title" data-role="title" value="${escapeHtml(p.title)}" />
          <button type="button" class="c-position-row__star-btn${p.showOnCard ? ' c-is-active' : ''}" data-role="star" aria-label="${p.showOnCard ? 'Hide on card' : 'Show on card'}">${icon('star', 18)}</button>
          <button type="button" class="c-position-row__remove-btn" data-role="remove" aria-label="Remove position" ${positions.length === 1 ? 'disabled' : ''}>${icon('trash-2', 16)}</button>
        </div>`).join('');
    }
    paintPositions();

    document.getElementById('j-cc-add-position').addEventListener('click', () => { positions.push({ title: '', showOnCard: false }); paintPositions(); });

    positionsEl.addEventListener('input', (event) => {
      const row = event.target.closest('[data-position-index]');
      if (row && event.target.dataset.role === 'title') positions[Number(row.dataset.positionIndex)].title = event.target.value;
    });
    positionsEl.addEventListener('click', (event) => {
      const row = event.target.closest('[data-position-index]');
      if (!row) return;
      const index = Number(row.dataset.positionIndex);
      if (event.target.closest('[data-role="star"]')) { positions[index].showOnCard = !positions[index].showOnCard; paintPositions(); }
      else if (event.target.closest('[data-role="remove"]') && positions.length > 1) { positions.splice(index, 1); paintPositions(); }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('j-cc-name').value.trim();
      const category = document.getElementById('j-cc-category').value.trim();
      const description = document.getElementById('j-cc-description').value.trim();
      const errorBanner = document.getElementById('j-create-club-error');
      if (!name || !selectedType || !category || !description) {
        errorBanner.textContent = 'Add a programme name, type, category, and description.';
        errorBanner.classList.add('c-is-visible');
        return;
      }
      errorBanner.classList.remove('c-is-visible');
      createClub({ name, type: selectedType, category, description }, positions);
    });
  }

  /* =======================================================================
     13. MODAL — EDIT PROGRAMME
     ======================================================================= */

  function openProgramEditModal(club) {
    const details = Object.assign({}, club._program, { coach: club._program.coach ? Object.assign({}, club._program.coach) : undefined });

    function coachSectionHtml() {
      if (!details.coach) {
        return `<p style="border-radius:var(--radius-xl);border:1px dashed var(--color-border);background:rgba(247,243,236,0.45);padding:1rem;font-size:0.75rem;color:rgba(15,65,74,0.55);">No coach is assigned to this programme.</p>`;
      }
      return `
        <div class="c-form-row c-form-row--two-col" style="border-radius:var(--radius-xl);border:1px solid var(--color-border);background:rgba(247,243,236,0.55);padding:1rem;">
          <div><label class="c-field-label" for="j-pi-coach-name">Name</label><input class="c-field-input" id="j-pi-coach-name" value="${escapeHtml(details.coach.name)}" /></div>
          <div><label class="c-field-label" for="j-pi-coach-specialty">Specialty</label><input class="c-field-input" id="j-pi-coach-specialty" value="${escapeHtml(details.coach.specialty)}" /></div>
          <div><label class="c-field-label" for="j-pi-coach-email">Email</label><input class="c-field-input" id="j-pi-coach-email" type="email" value="${escapeHtml(details.coach.email)}" /></div>
          <div><label class="c-field-label" for="j-pi-coach-phone">Phone</label><input class="c-field-input" id="j-pi-coach-phone" type="tel" value="${escapeHtml(details.coach.phone)}" /></div>
        </div>`;
    }

    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('pen', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">Edit programme</p>
            <h2 class="c-modal__title">${escapeHtml(details.name)}</h2>
            <p class="c-modal__description">Update the programme information, coach details, and cover image shown across this detail page.</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-program-form" novalidate>
        <div class="c-form-row c-form-row--two-col">
          <div class="c-stack" style="display:flex;flex-direction:column;gap:1.25rem;">
            <div id="j-pi-name-field"><label class="c-field-label" for="j-pi-name">Programme name</label><input class="c-field-input" id="j-pi-name" value="${escapeHtml(details.name)}" /></div>
            <div><label class="c-field-label" for="j-pi-category">Category</label><input class="c-field-input" id="j-pi-category" value="${escapeHtml(details.category)}" /></div>
          </div>
          <div>
            <label class="c-field-label">Cover image</label>
            <label class="c-cover-upload c-cover-upload--sky" for="j-pi-image-input" id="j-pi-image-preview">
              ${details.image ? `<img src="${details.image}" alt="Selected programme cover preview" />` : `<span class="c-cover-upload__placeholder">${icon('image-plus', 22)}Upload cover</span>`}
            </label>
            <input class="c-visually-hidden" id="j-pi-image-input" type="file" accept="image/*" />
          </div>
        </div>
        <div>
          <label class="c-field-label" for="j-pi-description">Description</label>
          <textarea class="c-field-input c-field-input--textarea" id="j-pi-description">${escapeHtml(details.description)}</textarea>
        </div>
        <section class="c-form-section">
          <div class="c-form-section__head">
            <div>
              <h3 class="c-form-section__title">Coach / instructor</h3>
              <p class="c-form-section__hint">Maintain the coach information displayed on this programme.</p>
            </div>
            ${!details.coach ? `<button type="button" class="c-btn c-btn--sm" style="border:1px solid rgba(127,199,204,0.5);background:rgba(127,199,204,0.1);color:var(--midnight);" id="j-pi-add-coach">Add coach</button>` : ''}
          </div>
          <div id="j-pi-coach-section">${coachSectionHtml()}</div>
        </section>
        <footer class="c-event-form__footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">Save programme</button>
        </footer>
      </form>`;

    openModalWithContent(html, '#j-pi-name');
    const form = document.getElementById('j-program-form');

    document.getElementById('j-pi-image-input').addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      readImageFile(file).then((dataUrl) => {
        details.image = dataUrl;
        document.getElementById('j-pi-image-preview').innerHTML = `<img src="${dataUrl}" alt="Selected programme cover preview" />`;
      });
    });

    const addCoachBtn = document.getElementById('j-pi-add-coach');
    if (addCoachBtn) {
      addCoachBtn.addEventListener('click', () => {
        details.coach = { avatar: '', email: '', name: '', phone: '', specialty: '' };
        document.getElementById('j-pi-coach-section').innerHTML = coachSectionHtml();
        addCoachBtn.remove();
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('j-pi-name').value.trim();
      const nameField = document.getElementById('j-pi-name-field');
      if (!name) { setFieldError(nameField, 'Enter a program name.'); return; }
      setFieldError(nameField, '');
      const coachSection = document.getElementById('j-pi-coach-section');
      const nextCoach = details.coach ? {
        avatar: details.coach.avatar || '',
        email: (coachSection.querySelector('#j-pi-coach-email') || {}).value || '',
        name: (coachSection.querySelector('#j-pi-coach-name') || {}).value || '',
        phone: (coachSection.querySelector('#j-pi-coach-phone') || {}).value || '',
        specialty: (coachSection.querySelector('#j-pi-coach-specialty') || {}).value || ''
      } : undefined;
      saveProgram(club, { category: document.getElementById('j-pi-category').value.trim(), coach: nextCoach, description: document.getElementById('j-pi-description').value.trim(), image: details.image, name });
    });
  }

  function openDetailsEditModal(club) {
    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('pen', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">Edit details</p>
            <h2 class="c-modal__title">Schedule & Location</h2>
            <p class="c-modal__description">Update the session times and physical venue details for ${escapeHtml(club.name)}.</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-details-form" novalidate>
        <div class="c-form-row">
          <div>
            <label class="c-field-label" for="j-de-schedule">Schedule / Session Times</label>
            <input class="c-field-input" id="j-de-schedule" value="${escapeHtml(club.schedule || 'Tuesdays & Thursdays, 3:30 – 5:30 PM')}" />
          </div>
          <div>
            <label class="c-field-label" for="j-de-location">Location / Venue</label>
            <input class="c-field-input" id="j-de-location" value="${escapeHtml(club.location || 'Main Cricket Ground')}" />
          </div>
        </div>
        <footer class="c-event-form__footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">Save details</button>
        </footer>
      </form>`;

    openModalWithContent(html, '#j-de-schedule');
    const form = document.getElementById('j-details-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      club.schedule = document.getElementById('j-de-schedule').value.trim();
      club.location = document.getElementById('j-de-location').value.trim();
      closeModal(document.getElementById('j-modal-layer'));
      renderDetailView(club.id);
    });
  }

  function openAddAwardModal(club) {
    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('trophy', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">New achievement</p>
            <h2 class="c-modal__title">Add Achievement / Award</h2>
            <p class="c-modal__description">Record a trophy, medal, or recognition for ${escapeHtml(club.name)}.</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-award-form" novalidate>
        <div class="c-form-row c-form-row--two-col">
          <div class="c-field-span-2">
            <label class="c-field-label" for="j-aw-title">Title / Award Name</label>
            <input class="c-field-input" id="j-aw-title" placeholder="e.g. Div-1 League Runners Up" />
          </div>
        </div>
        <div class="c-form-row c-form-row--two-col">
          <div>
            <label class="c-field-label" for="j-aw-year">Year</label>
            <input class="c-field-input" id="j-aw-year" placeholder="e.g. 2024" />
          </div>
          <div>
            <label class="c-field-label" for="j-aw-level">Level</label>
            <input class="c-field-input" id="j-aw-level" placeholder="e.g. Provincial / National" />
          </div>
        </div>
        <div class="c-form-row c-form-row--two-col">
          <div>
            <label class="c-field-label" for="j-aw-kind">Category / Kind</label>
            <input class="c-field-input" id="j-aw-kind" placeholder="e.g. Team / Individual" />
          </div>
          <div>
            <label class="c-field-label" for="j-aw-place">Award Place / Metal</label>
            <input class="c-field-input" id="j-aw-place" placeholder="e.g. Gold Medal / 1st Place" />
          </div>
        </div>
        <div>
          <label class="c-field-label" for="j-aw-details">Details / Description</label>
          <textarea class="c-field-input c-field-input--textarea" id="j-aw-details" placeholder="Brief summary of the achievement..."></textarea>
        </div>
        <div style="margin-top:0.75rem;">
          <label class="c-field-label">Cover Photo (Optional)</label>
          <div style="display:flex; gap:1rem; align-items:center;">
            <div id="j-aw-image-preview" style="width:120px; height:75px; border-radius:0.5rem; overflow:hidden; background:var(--alabaster); display:flex; align-items:center; justify-content:center; border:1px solid var(--color-border);">
              <span style="font-size:10px; color:rgba(15,65,74,0.4);">No image</span>
            </div>
            <label class="c-btn c-btn--ghost c-btn--sm" for="j-aw-image-input" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
              ${icon('image-plus', 14)} Choose Photo
            </label>
            <input class="c-visually-hidden" id="j-aw-image-input" type="file" accept="image/*" />
          </div>
        </div>
        <footer class="c-event-form__footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">Save achievement</button>
        </footer>
      </form>`;

    openModalWithContent(html, '#j-aw-title');

    let awardImage = 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=400&fit=crop';
    const imgInput = document.getElementById('j-aw-image-input');
    if (imgInput) {
      imgInput.addEventListener('change', (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (file) {
          readImageFile(file).then((dataUrl) => {
            if (dataUrl) {
              awardImage = dataUrl;
              const preview = document.getElementById('j-aw-image-preview');
              if (preview) preview.innerHTML = `<img src="${dataUrl}" alt="Preview" style="width:100%;height:100%;object-fit:cover;" />`;
            }
          });
        }
      });
    }

    const form = document.getElementById('j-award-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('j-aw-title').value.trim();
      if (!title) return;
      const newAward = {
        title: title,
        year: document.getElementById('j-aw-year').value.trim() || '2024',
        level: document.getElementById('j-aw-level').value.trim() || 'Provincial',
        kind: document.getElementById('j-aw-kind').value.trim() || 'Team',
        place: document.getElementById('j-aw-place').value.trim() || 'Award Winner',
        details: document.getElementById('j-aw-details').value.trim() || '',
        image: awardImage
      };
      if (!club.awards) club.awards = [];
      club.awards.push(newAward);
      closeModal(document.getElementById('j-modal-layer'));
      renderDetailView(club.id);
    });
  }

  function openEditCoachModal(club) {
    const program = club._program;
    const coach = program.coach || {};
    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('user', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">Coach Information</p>
            <h2 class="c-modal__title">Edit Coach / Instructor</h2>
            <p class="c-modal__description">Update the details of the coach for ${escapeHtml(club.name)}.</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-coach-form" novalidate>
        <div>
          <label class="c-field-label" for="j-coach-name">Full Name</label>
          <input class="c-field-input" id="j-coach-name" value="${escapeHtml(coach.name || '')}" placeholder="e.g. Coach Jackson" />
        </div>
        <div>
          <label class="c-field-label" for="j-coach-specialty">Description / Specialty</label>
          <input class="c-field-input" id="j-coach-specialty" value="${escapeHtml(coach.specialty || '')}" placeholder="e.g. Head Football Coach" />
        </div>
        <div>
          <label class="c-field-label" for="j-coach-email">Email Address</label>
          <input class="c-field-input" id="j-coach-email" type="email" value="${escapeHtml(coach.email || '')}" placeholder="e.g. coach@lecole.edu" />
        </div>
        <div>
          <label class="c-field-label" for="j-coach-phone">Contact Number</label>
          <input class="c-field-input" id="j-coach-phone" type="tel" value="${escapeHtml(coach.phone || '')}" placeholder="e.g. +94 77 123 4567" />
        </div>
        <footer class="c-event-form__footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">Save changes</button>
        </footer>
      </form>`;

    openModalWithContent(html, '#j-coach-name');
    const form = document.getElementById('j-coach-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      program.coach = {
        name: document.getElementById('j-coach-name').value.trim() || 'Coach details pending',
        specialty: document.getElementById('j-coach-specialty').value.trim() || 'Not recorded',
        email: document.getElementById('j-coach-email').value.trim() || '',
        phone: document.getElementById('j-coach-phone').value.trim() || '',
        avatar: coach.avatar || unsplash('1500648767791-00dcc994a43e')
      };
      closeModal(document.getElementById('j-modal-layer'));
      renderDetailView(club.id);
    });
  }

  function openEditAchievementModal(club, achievementIndex) {
    const achievement = club.awards[achievementIndex];
    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('trophy', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">Edit achievement</p>
            <h2 class="c-modal__title">Edit Achievement Details</h2>
            <p class="c-modal__description">Update the trophy, medal, or recognition info for ${escapeHtml(club.name)}.</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-edit-achievement-form" novalidate>
        <div class="c-form-row c-form-row--two-col">
          <div class="c-field-span-2">
            <label class="c-field-label" for="j-edit-aw-title">Title / Award Name</label>
            <input class="c-field-input" id="j-edit-aw-title" value="${escapeHtml(achievement.title || '')}" placeholder="e.g. Div-1 League Runners Up" />
          </div>
        </div>
        <div class="c-form-row c-form-row--two-col">
          <div>
            <label class="c-field-label" for="j-edit-aw-year">Year</label>
            <input class="c-field-input" id="j-edit-aw-year" value="${escapeHtml(achievement.year || '')}" placeholder="e.g. 2024" />
          </div>
          <div>
            <label class="c-field-label" for="j-edit-aw-level">Level</label>
            <input class="c-field-input" id="j-edit-aw-level" value="${escapeHtml(achievement.level || '')}" placeholder="e.g. Provincial / National" />
          </div>
        </div>
        <div class="c-form-row c-form-row--two-col">
          <div>
            <label class="c-field-label" for="j-edit-aw-kind">Category / Kind</label>
            <input class="c-field-input" id="j-edit-aw-kind" value="${escapeHtml(achievement.kind || '')}" placeholder="e.g. Team / Individual" />
          </div>
          <div>
            <label class="c-field-label" for="j-edit-aw-place">Award Place / Metal</label>
            <input class="c-field-input" id="j-edit-aw-place" value="${escapeHtml(achievement.place || '')}" placeholder="e.g. Gold Medal / 1st Place" />
          </div>
        </div>
        <div>
          <label class="c-field-label" for="j-edit-aw-details">Details / Description</label>
          <textarea class="c-field-input c-field-input--textarea" id="j-edit-aw-details" placeholder="Brief summary of the achievement...">${escapeHtml(achievement.details || '')}</textarea>
        </div>
        <footer class="c-event-form__footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">Save changes</button>
        </footer>
      </form>`;

    openModalWithContent(html, '#j-edit-aw-title');
    const form = document.getElementById('j-edit-achievement-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      achievement.title = document.getElementById('j-edit-aw-title').value.trim() || achievement.title;
      achievement.year = document.getElementById('j-edit-aw-year').value.trim() || achievement.year;
      achievement.level = document.getElementById('j-edit-aw-level').value.trim() || achievement.level;
      achievement.kind = document.getElementById('j-edit-aw-kind').value.trim() || achievement.kind;
      achievement.place = document.getElementById('j-edit-aw-place').value.trim() || achievement.place;
      achievement.details = document.getElementById('j-edit-aw-details').value.trim() || '';

      closeModal(document.getElementById('j-modal-layer'));
      renderAchievementView(club.id, achievementIndex);
    });
  }

  /* =======================================================================
     14. MODAL — ADD / EDIT TEAM
     ======================================================================= */

  function openTeamModal(club, mode, teamIndex, typeLabels) {
    const team = mode === 'edit' ? club.teams[teamIndex] : undefined;
    const singularTeamWord = singularize(typeLabels.teamWord);
    const singularMemberWord = singularize(typeLabels.memberWord);
    let coverImage = team ? (team.coverImage || '') : '';
    let roster = team ? team.roster.map((m) => Object.assign({}, m)) : [];

    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('users', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">${mode === 'create' ? `Add ${singularTeamWord}` : `Edit ${singularTeamWord}`}</p>
            <h2 class="c-modal__title">${mode === 'create' ? `Add ${singularTeamWord}` : escapeHtml(team.name)}</h2>
            <p class="c-modal__description">${mode === 'create' ? `Create a self-contained ${singularTeamWord.toLowerCase()} panel.` : `Update this ${singularTeamWord.toLowerCase()}, its roster, and cover image.`}</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-team-form" novalidate>
        <div class="c-form-row c-form-row--two-col">
          <div id="j-team-name-field"><label class="c-field-label" for="j-team-name">${singularTeamWord} name</label><input class="c-field-input" id="j-team-name" placeholder="e.g. ${singularTeamWord} C" value="${escapeHtml(team ? team.name : '')}" /></div>
          <div>
            <label class="c-field-label">Panel cover</label>
            <label class="c-cover-upload" for="j-team-image-input" id="j-team-image-preview">
              ${coverImage ? `<img src="${coverImage}" alt="Selected team cover preview" />` : `<span class="c-cover-upload__placeholder">${icon('image-plus', 20)}Upload cover</span>`}
            </label>
            <input class="c-visually-hidden" id="j-team-image-input" type="file" accept="image/*" />
          </div>
        </div>
        <section class="c-form-section">
          <div class="c-form-section__head">
            <div>
              <h3 class="c-form-section__title">Roster</h3>
              <p class="c-form-section__hint">Add, update, or remove ${typeLabels.memberWord.toLowerCase()}.</p>
            </div>
            <button type="button" class="c-btn c-btn--sky c-btn--sm" id="j-team-add-member">${icon('plus', 15)} Add ${singularMemberWord}</button>
          </div>
          <p class="c-field-error" id="j-team-roster-error"></p>
          <div id="j-team-roster" style="display:flex;flex-direction:column;gap:0.75rem;"></div>
        </section>
        <footer class="c-event-form__footer" style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top: 1.5rem;">
          ${mode === 'edit' ? `
            <button type="button" class="c-btn c-btn--maroon c-btn--sm" id="j-team-delete-btn" style="background-color:#7f0303; color:white; border:none; display:inline-flex; align-items:center; gap:6px; padding: 0.5rem 1rem;">
              ${icon('trash2', 14)} Delete ${singularTeamWord}
            </button>
          ` : '<div></div>'}
          <div style="display:flex; gap:8px;">
            <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
            <button type="submit" class="c-btn c-btn--solid">${mode === 'create' ? 'Create panel' : 'Save changes'}</button>
          </div>
        </footer>
      </form>`;

    openModalWithContent(html, '#j-team-name');
    const form = document.getElementById('j-team-form');
    const rosterEl = document.getElementById('j-team-roster');

    function paintRoster() {
      if (!roster.length) {
        rosterEl.innerHTML = `<div class="c-empty-box" style="padding:1.5rem 1rem;">No ${typeLabels.memberWord.toLowerCase()} yet. This ${singularTeamWord.toLowerCase()} can be saved empty.</div>`;
        return;
      }
      rosterEl.innerHTML = roster.map((m, i) => `
        <div class="c-roster-row" data-member-index="${i}">
          <input class="c-field-input" data-role="name" aria-label="${singularMemberWord} ${i + 1} name" placeholder="Student name" value="${escapeHtml(m.name)}" />
          <input class="c-field-input" data-role="grade" aria-label="${singularMemberWord} ${i + 1} grade" placeholder="Grade" value="${escapeHtml(m.grade)}" />
          <input class="c-field-input" data-role="position" aria-label="${singularMemberWord} ${i + 1} role" placeholder="Team role / position (optional)" value="${escapeHtml(m.position || '')}" />
          <button type="button" class="c-roster-row__remove-btn" data-role="remove" aria-label="Remove ${escapeHtml(m.name || `${singularMemberWord} ${i + 1}`)}">${icon('trash-2', 16)}</button>
        </div>`).join('');
    }
    paintRoster();

    document.getElementById('j-team-image-input').addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      readImageFile(file).then((dataUrl) => {
        coverImage = dataUrl;
        document.getElementById('j-team-image-preview').innerHTML = `<img src="${dataUrl}" alt="Selected team cover preview" />`;
      });
    });

    document.getElementById('j-team-add-member').addEventListener('click', () => { roster.push({ name: '', grade: '', position: '', avatar: '' }); paintRoster(); });

    rosterEl.addEventListener('input', (event) => {
      const row = event.target.closest('[data-member-index]');
      if (!row) return;
      const index = Number(row.dataset.memberIndex);
      const role = event.target.dataset.role;
      if (role === 'name') { roster[index].name = event.target.value; if (!roster[index].avatar) roster[index].avatar = avatarFor(event.target.value); }
      else if (role === 'grade') roster[index].grade = event.target.value;
      else if (role === 'position') roster[index].position = event.target.value;
    });
    rosterEl.addEventListener('click', (event) => {
      const removeBtn = event.target.closest('[data-role="remove"]');
      if (!removeBtn) return;
      roster.splice(Number(removeBtn.closest('[data-member-index]').dataset.memberIndex), 1);
      paintRoster();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const nameField = document.getElementById('j-team-name-field');
      const rosterError = document.getElementById('j-team-roster-error');
      const cleanedName = document.getElementById('j-team-name').value.trim();
      let hasError = false;
      if (!cleanedName) { setFieldError(nameField, `Enter a ${singularTeamWord.toLowerCase()} name.`); hasError = true; } else { setFieldError(nameField, ''); }
      if (roster.some((m) => !m.name.trim() || !m.grade.trim())) { rosterError.textContent = `Complete or remove each ${singularMemberWord.toLowerCase()} entry.`; rosterError.classList.add('c-is-visible'); hasError = true; } else { rosterError.classList.remove('c-is-visible'); }
      if (hasError) return;
      saveTeam(club, mode, teamIndex, {
        name: cleanedName, coverImage: coverImage || undefined,
        roster: roster.map((m) => ({ name: m.name.trim(), grade: m.grade.trim(), position: (m.position || '').trim() || undefined, avatar: m.avatar || avatarFor(m.name) }))
      });
    });

    if (mode === 'edit') {
      const deleteBtn = document.getElementById('j-team-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          showConfirmDeleteModal({
            title: `Delete ${singularTeamWord}?`,
            description: `Are you sure you want to delete the ${singularTeamWord.toLowerCase()} "${team.name}"? All members in this roster will be sent back to the unassigned section.`,
            buttonText: `Delete ${singularTeamWord}`,
            onConfirm: () => {
              if (!club.unassignedStudents) club.unassignedStudents = [];
              team.roster.forEach(m => {
                if (!club.unassignedStudents.some(s => s.id === m.id)) {
                  club.unassignedStudents.push(m);
                }
              });
              club.teams.splice(teamIndex, 1);
              closeModal(document.getElementById('j-modal-layer'));
              renderDetailView(club.id);
            }
          });
        });
      }
    }
  }

  /* =======================================================================
     15. MODAL — ADD / EDIT CALENDAR EVENT
     ======================================================================= */

  let selectedClubAudiences = [];

  function renderClubAudienceChips() {
    const trigger = document.getElementById('j-club-audience-trigger');
    const menu = document.getElementById('j-club-audience-menu');
    if (!trigger || !menu) return;
    trigger.innerHTML = '';
    if (selectedClubAudiences.length === 0) {
      trigger.innerHTML = '<span style="color: var(--midnight); opacity: 0.5; font-size: 0.875rem; padding: 4px;" id="j-club-audience-placeholder">Select audiences...</span>';
    } else {
      selectedClubAudiences.forEach(aud => {
        const chip = document.createElement('span');
        chip.style.cssText = 'background: rgba(127, 199, 204, 0.2); color: var(--midnight); font-size: 0.75rem; font-weight: 500; padding: 2px 8px; border-radius: var(--radius-full); display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--sky-blue);';
        chip.innerHTML = `${aud} <span class="j-club-remove-audience" data-val="${aud}" style="cursor: pointer; opacity: 0.6;">&times;</span>`;
        trigger.appendChild(chip);
      });
    }

    const options = document.querySelectorAll('.j-club-audience-option');
    options.forEach(opt => {
      const val = opt.dataset.val;
      const check = opt.querySelector('.j-club-audience-check');
      if (selectedClubAudiences.includes(val)) {
        opt.style.background = 'var(--cream)';
        check.style.display = 'block';
      } else {
        opt.style.background = 'transparent';
        check.style.display = 'none';
      }
    });
  }

  function openCalendarEventModal(club, editingEvent) {
    const cal = club._calendar;
    const viewDate = cal.viewDate;
    const monthLabel = formatMonthYear(viewDate);
    const dayCount = daysInMonth(viewDate);
    const initialDate = editingEvent ? editingEvent.date : cal.selectedDate;
    const safeDay = Math.min(initialDate.getDate(), dayCount);
    const isEditing = Boolean(editingEvent);

    selectedClubAudiences = editingEvent ? (editingEvent.audiences || ['Students', 'Teachers', 'Parents', 'Management']) : ['Students', 'Teachers', 'Parents', 'Management'];

    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">${icon('calendar-plus', 19)}</div>
          <div>
            <p class="c-modal__eyebrow">${monthLabel} calendar</p>
            <h2 class="c-modal__title" id="j-club-editor-title">${isEditing ? 'Edit event' : 'Add an event'}</h2>
            <p class="c-modal__description" id="j-club-editor-description">${isEditing ? `Update this ${escapeHtml(club._program.name)} schedule event for this session.` : `This event is saved to the ${escapeHtml(club._program.name)} schedule for this session.`}</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close event editor">${icon('x', 20)}</button>
      </header>
      <form class="c-event-form" id="j-event-form" novalidate>
        <div class="c-event-form__error-banner" id="j-event-form-error-banner">Complete the highlighted event details before saving.</div>
        
        <div>
          <label class="c-field-label" for="j-field-category">Event category</label>
          <select class="c-field-input" id="j-field-category">
            <option value="Other">General / Other</option>
            <option value="Academic">Academic</option>
            <option value="Extracurricular" selected>Extracurricular</option>
          </select>
        </div>

        <div id="j-field-extracurricular-wrap" style="margin-top: 1rem;">
          <label class="c-field-label" for="j-field-extracurricular-target">Sport / Club / Society</label>
          <select class="c-field-input" id="j-field-extracurricular-target">
            <option value="${escapeHtml(club._program.name)}" selected>${escapeHtml(club._program.name)}</option>
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
          <div class="c-multi-select" id="j-club-audience-select" style="position: relative; margin-top: 0.25rem;">
            <div class="c-field-input" id="j-club-audience-trigger" style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 38px; align-items: center; cursor: pointer; padding: 4px 8px;">
              <span style="color: var(--midnight); opacity: 0.5; font-size: 0.875rem; padding: 4px;" id="j-club-audience-placeholder">Select audiences...</span>
            </div>
            <div id="j-club-audience-menu" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--color-border); border-radius: 6px; margin-top: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; max-height: 200px; overflow-y: auto;">
              <div class="j-club-audience-option" data-val="Students" style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">Students<span class="j-club-audience-check" style="display:none; color: var(--color-sunshine);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></div>
              <div class="j-club-audience-option" data-val="Teachers" style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">Teachers<span class="j-club-audience-check" style="display:none; color: var(--color-sunshine);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></div>
              <div class="j-club-audience-option" data-val="Parents" style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">Parents<span class="j-club-audience-check" style="display:none; color: var(--color-sunshine);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></div>
              <div class="j-club-audience-option" data-val="Management" style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">Management<span class="j-club-audience-check" style="display:none; color: var(--color-sunshine);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></div>
            </div>
          </div>
        </div>

        <div id="j-field-time-wrap" style="margin-top: 1rem;">
          <label class="c-field-label" for="j-field-time">Time</label>
          <input class="c-field-input" id="j-field-time" placeholder="e.g. 14:00–15:30" type="text" value="${escapeHtml(editingEvent ? editingEvent.meta || '' : '')}" />
          <p class="c-field-error" id="j-field-time-error">Enter the event time.</p>
        </div>

        <div id="j-field-title-wrap" style="margin-top: 1rem;">
          <label class="c-field-label" for="j-field-title">Event title</label>
          <input class="c-field-input" id="j-field-title" placeholder="e.g. Parent information evening" type="text" value="${escapeHtml(editingEvent ? editingEvent.title : '')}" />
          <p class="c-field-error" id="j-field-title-error">Enter an event title.</p>
        </div>

        <div id="j-field-details-wrap" style="margin-top: 1rem;">
          <label class="c-field-label" for="j-field-details">Details or location</label>
          <textarea class="c-field-input c-field-input--textarea" id="j-field-details" placeholder="e.g. Auditorium · Families of Grades 9–11">${escapeHtml(editingEvent ? editingEvent.venue : '')}</textarea>
          <p class="c-field-error" id="j-field-details-error">Add details or a location.</p>
        </div>

        <footer class="c-event-form__footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">${icon('calendar-plus', 15)}<span id="j-club-submit-label">${isEditing ? 'Save changes' : 'Save event'}</span></button>
        </footer>
      </form>`;

    openModalWithContent(html, '#j-field-title');
    renderClubAudienceChips();

    const form = document.getElementById('j-event-form');
    const errorBanner = document.getElementById('j-event-form-error-banner');
    const categoryField = document.getElementById('j-field-category');
    const extracurricularWrap = document.getElementById('j-field-extracurricular-wrap');
    const extracurricularTarget = document.getElementById('j-field-extracurricular-target');
    const audienceSelectTrigger = document.getElementById('j-club-audience-trigger');
    const audienceSelectMenu = document.getElementById('j-club-audience-menu');
    const audienceOptions = document.querySelectorAll('.j-club-audience-option');
    const timeField = document.getElementById('j-field-time');
    const titleField = document.getElementById('j-field-title');
    const detailsField = document.getElementById('j-field-details');

    function clearErrors() {
      errorBanner.classList.remove('c-is-visible');
      ['j-field-time-wrap', 'j-field-title-wrap', 'j-field-details-wrap'].forEach((id) => setFieldError(document.getElementById(id), ''));
    }

    [timeField, titleField, detailsField].forEach((field) => field.addEventListener('input', clearErrors));

    categoryField.addEventListener('change', (e) => {
      if (e.target.value === 'Extracurricular') {
        extracurricularWrap.style.display = 'block';
      } else {
        extracurricularWrap.style.display = 'none';
        extracurricularTarget.value = '';
      }
    });

    audienceSelectTrigger.addEventListener('click', (e) => {
      if (e.target.closest('.j-club-remove-audience')) {
        e.stopPropagation();
        const val = e.target.closest('.j-club-remove-audience').dataset.val;
        selectedClubAudiences = selectedClubAudiences.filter(a => a !== val);
        renderClubAudienceChips();
        return;
      }
      const isVisible = audienceSelectMenu.style.display === 'block';
      audienceSelectMenu.style.display = isVisible ? 'none' : 'block';
    });

    audienceOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.dataset.val;
        if (selectedClubAudiences.includes(val)) {
          selectedClubAudiences = selectedClubAudiences.filter(a => a !== val);
        } else {
          selectedClubAudiences.push(val);
        }
        renderClubAudienceChips();
      });
    });

    const docClick = (e) => {
      if (!audienceSelectMenu.contains(e.target) && !audienceSelectTrigger.contains(e.target)) {
        audienceSelectMenu.style.display = 'none';
      }
    };
    document.addEventListener('mousedown', docClick);

    // Clean up event listener when modal closes
    const closeBtn = document.querySelectorAll('.j-modal-close');
    closeBtn.forEach(btn => btn.addEventListener('click', () => {
      document.removeEventListener('mousedown', docClick);
    }));

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const day = cal.selectedDate.getDate();
      const title = titleField.value.trim();
      const time = timeField.value.trim();
      const details = detailsField.value.trim();
      const category = categoryField.value;
      const extracurricularTargetVal = extracurricularTarget.value;

      let hasError = false;
      clearErrors();
      if (!title) { setFieldError(document.getElementById('j-field-title-wrap'), 'Enter an event title.'); hasError = true; }
      if (!time) { setFieldError(document.getElementById('j-field-time-wrap'), 'Enter the event time.'); hasError = true; }
      if (!details) { setFieldError(document.getElementById('j-field-details-wrap'), 'Add details or a location.'); hasError = true; }
      if (hasError) { errorBanner.classList.add('c-is-visible'); return; }

      document.removeEventListener('mousedown', docClick);

      saveCalendarEvent(club, editingEvent, {
        date: new Date(viewDate.getFullYear(), viewDate.getMonth(), day),
        details,
        time,
        title,
        category,
        extracurricularTarget: extracurricularTargetVal,
        audiences: selectedClubAudiences,
        type: category === 'Extracurricular' ? (extracurricularTargetVal || 'Session event') : category,
        result: editingEvent ? editingEvent.result : undefined
      });
    });
  }

  /* =======================================================================
     16. MODAL — DAY SCHEDULE ("View all")
     ======================================================================= */

  function openDayScheduleModal(club) {
    const cal = club._calendar;
    const dayEvents = getCalendarEvents(club).filter((e) => sameCalendarDay(e.date, cal.selectedDate));

    const bodyHtml = dayEvents.length
      ? `<ol class="c-day-schedule__list">${dayEvents.map((e, index) => `
          <li class="c-day-schedule__item" style="animation-delay:${index * 35}ms">
            <div class="c-day-schedule__item-top">
              <div>
                <p class="c-day-schedule__time">${icon('clock', 13)}${escapeHtml(e.meta || 'Time to be confirmed')}</p>
                <h3 class="c-day-schedule__title">${escapeHtml(e.title)}</h3>
              </div>
              <span class="c-day-schedule__type">${escapeHtml(e.type)}</span>
            </div>
            <p class="c-day-schedule__details">${icon('map-pin', 13, 'c-day-schedule__details-icon')}<span>${escapeHtml(e.venue)}</span></p>
          </li>`).join('')}</ol>`
      : `<div class="c-day-schedule__empty">
          <span class="c-day-schedule__empty-icon" aria-hidden="true">${icon('calendar-off', 27)}</span>
          <h3 class="c-day-schedule__empty-title">No events scheduled</h3>
          <p class="c-day-schedule__empty-text">${formatMonthDayYear(cal.selectedDate)} is clear. Add an event from this calendar when plans are confirmed.</p>
        </div>`;

    const html = `
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <span class="c-modal__icon-badge c-modal__icon-badge--sky-solid" aria-hidden="true">${icon('calendar-days', 19)}</span>
          <div>
            <p class="c-modal__eyebrow">Day schedule</p>
            <h2 class="c-modal__title">${formatMonthDayYear(cal.selectedDate)}</h2>
            <p class="c-modal__description">${dayEvents.length === 1 ? '1 event is scheduled for this day.' : `${dayEvents.length} events are scheduled for this day.`}</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close day schedule">${icon('x', 20)}</button>
      </header>
      <div class="c-day-schedule__body">${bodyHtml}</div>`;

    openModalWithContent(html);
    document.getElementById('j-modal').classList.add('c-modal--day-schedule');
    document.getElementById('j-modal-layer').classList.add('c-modal-layer--day-schedule');
  }

  function showConfirmDeleteModal({ title, description, buttonText, onConfirm }) {
    const overlay = document.createElement('div');
    overlay.className = 'c-modal-layer c-is-open';
    overlay.style.cssText = 'position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem;';

    const scrim = document.createElement('div');
    scrim.style.cssText = 'position:fixed; inset:0; background:rgba(15,65,74,0.55); backdrop-filter:blur(4px);';
    overlay.appendChild(scrim);

    const card = document.createElement('div');
    card.className = 'c-modal';
    card.style.cssText = 'position:relative; z-index:10; background:#fff; border-radius:1.5rem; padding:2rem; width:100%; max-width:28rem; text-align:center; box-shadow:var(--shadow-xl); border-top: 1px solid rgba(127,3,3,0.1); border-bottom: 1px solid rgba(127,3,3,0.1); backdrop-filter: blur(8px);';

    card.innerHTML = `
      <div style="margin:0 auto 1rem; display:flex; align-items:center; justify-content:center; height:4rem; width:4rem; border-radius:50%; background:rgba(127,3,3,0.1); color:#7f0303;">
        <svg class="c-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </div>
      <h2 style="margin:0; font-size:1.25rem; font-weight:700; color:var(--midnight);">${escapeHtml(title)}</h2>
      <p style="margin:0.5rem 0 0; font-size:0.875rem; line-height:1.6; color:rgba(15,65,74,0.7);">${escapeHtml(description)}</p>
      <div style="display:flex; justify-content:center; gap:0.75rem; margin-top:1.75rem;">
        <button type="button" class="j-confirm-cancel-btn" style="padding:0.625rem 1.25rem; font-size:0.875rem; font-weight:600; border-radius:0.5rem; border:1px solid var(--color-border); background:#fff; color:var(--midnight); cursor:pointer; min-width:6.5rem;">Cancel</button>
        <button type="button" class="j-confirm-delete-btn" style="padding:0.625rem 1.25rem; font-size:0.875rem; font-weight:600; border-radius:0.5rem; border:none; background:#7f0303; color:#fff; cursor:pointer; min-width:6.5rem;">${escapeHtml(buttonText)}</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const close = () => { overlay.remove(); };
    scrim.addEventListener('click', close);
    card.querySelector('.j-confirm-cancel-btn').addEventListener('click', close);
    card.querySelector('.j-confirm-delete-btn').addEventListener('click', () => {
      onConfirm();
      close();
    });
  }

  function deleteClubCard(clubId) {
    state.clubs = state.clubs.filter(c => c.id !== clubId);
    navigate('#/extracurricular');
  }

  /* =======================================================================
     17. APP BOOTSTRAP
     ======================================================================= */

  function init() {
    initModalDismissHandlers();

    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/extracurricular'; // triggers hashchange -> route()
    } else {
      route();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
