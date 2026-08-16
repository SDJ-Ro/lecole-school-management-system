/* =========================================================================
   L'ÉCOLE ADMIN DASHBOARD — APPLICATION SCRIPT
   -------------------------------------------------------------------------
   DESIGN PRINCIPLE: this file only contains things that genuinely need to
   run in the browser — user interaction, state that changes after load,
   and small pieces of maths that depend on that state (e.g. percentages
   in a detail modal). The bar chart bars, the donut chart slices, their
   legends, and the upcoming-events list are all static visuals that never
   change at runtime, so they are hand-authored directly in index.html
   (see the "static, computed once" comments there) and this file merely
   ATTACHES behaviour to them by reading their data-* attributes. That is
   why this script is far smaller than a version that builds those charts
   with JS: the charts are content (HTML's job), not behaviour (JS's job).

   Sections in this file:
     1. Shared data the JS-driven features actually need (exam calendar
        entries + the calendar's mutable state — nothing chart-related)
     2. Date helpers
     3. Sidebar behaviour (collapse + nav selection)
     4. Bar chart interactivity — wires hover/click on the static SVG
     5. Donut chart interactivity — wires hover/click on the static SVG
     6. Dark month calendar (render, navigation, month/year custom selects)
     7. Modal: Add / Edit calendar event
     8. Modal: Chart / metric detail
     9. Modal: Full day schedule ("View all")
    10. Shared chart tooltip helper
    11. App bootstrap
   Naming reminder: elements the script queries are marked with the j-*
   class or id prefix (see styles.css header comment for the full rule).
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. SHARED DATA
     -------------------------------------------------------------------------
     Note: enrollment/sports/clubs figures used to live here as JS objects
     purely so a render function could turn them into SVG. They now live
     as data-* attributes directly on the static bars/slices in index.html
     (single source of truth, no HTML/JS duplication) — see sections 4 & 5.
     ======================================================================= */

  // Seeded examination calendar entries for June 2026 (day-of-month -> details)
  const mockData = window.DASHBOARD_MOCK_DATA || {};
  const examinationCalendarDetails = mockData.examinationCalendarDetails || {};

  /** Mutable application state (in-memory only — resets on page reload). */
  const state = {
    viewDate: new Date(2026, 5, 1),
    selectedDate: new Date(2026, 5, 17),
    calendarEvents: [],
    sidebarCollapsed: false,
    selectedNav: 'Dashboard'
  };

  // seed calendar events from the examination details map
  Object.entries(examinationCalendarDetails).forEach(([day, event]) => {
    state.calendarEvents.push({
      id: `exam-${day}`,
      date: new Date(2026, 5, Number(day)),
      time: event.time,
      title: event.title,
      details: event.details,
      source: 'examination',
      category: 'Academic'
    });
  });

  // Load shared events from localStorage
  function loadSharedEvents() {
    try {
      const stored = localStorage.getItem('lecole_shared_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.forEach(e => e.date = new Date(e.date));
        return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveSharedEvent(ev) {
    const events = loadSharedEvents();
    const idx = events.findIndex(e => e.id === ev.id);
    if (idx >= 0) events[idx] = ev;
    else events.push(ev);
    localStorage.setItem('lecole_shared_events', JSON.stringify(events));
  }

  // merge localStorage events into the dashboard calendar
  loadSharedEvents().forEach(ev => state.calendarEvents.push(ev));

  // Read from the DOM once at bootstrap (section 4) by summing the static
  // bars' data-value — see readSchoolStudentTotal() / init().
  let schoolStudentTotal = 0;

  /* =======================================================================
     2. DATE HELPERS
     ======================================================================= */

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const MIN_CALENDAR_YEAR = 1980;
  const MAX_CALENDAR_YEAR = 2080;

  function sameCalendarDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function formatMonthYear(date) {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  }

  function formatLongDate(date) {
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${weekdayNames[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  function formatMonthDayYear(date) {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  function escapeHtml(value) {
    if (!value) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMonthDay(date) {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
  }

  /** Moves the selected day to a new month while clamping to the last valid day. */
  function changeCalendarView(currentSelectedDate, nextViewDate) {
    const normalized = startOfMonth(nextViewDate);
    const lastDay = daysInMonth(normalized);
    return new Date(normalized.getFullYear(), normalized.getMonth(), Math.min(currentSelectedDate.getDate(), lastDay));
  }

  function numberWithCommas(value) {
    return Number(value).toLocaleString();
  }

  /* =======================================================================
     3. SIDEBAR BEHAVIOUR
     ======================================================================= */

  function initSidebar() {}

  /* =======================================================================
     10. SHARED CHART TOOLTIP HELPER
     ======================================================================= */

  const tooltipEl = document.getElementById('j-chart-tooltip');

  function showTooltip(clientX, clientY, html) {
    tooltipEl.innerHTML = html;
    tooltipEl.classList.add('c-is-visible');
    positionTooltip(clientX, clientY);
  }

  function positionTooltip(clientX, clientY) {
    const padding = 14;
    const rect = tooltipEl.getBoundingClientRect();
    let left = clientX + padding;
    let top = clientY + padding;
    if (left + rect.width > window.innerWidth - 8) left = clientX - rect.width - padding;
    if (top + rect.height > window.innerHeight - 8) top = clientY - rect.height - padding;
    tooltipEl.style.left = `${Math.max(8, left)}px`;
    tooltipEl.style.top = `${Math.max(8, top)}px`;
  }

  function hideTooltip() {
    tooltipEl.classList.remove('c-is-visible');
  }

  /* =======================================================================
     4. BAR CHART — Total vs Sports enrollment
     -------------------------------------------------------------------------
     The bars, gridlines and axis labels are static SVG already in
     index.html (search it for "j-bar-group"). This section only reads
     that markup and wires up the two behaviours it needs: a tooltip on
     hover, and the detail modal on click.
     ======================================================================= */

  /** Sums the "Total" bars' data-value to get the whole-school figure used
   *  by both the metric card and the chart detail modal calculations. */
  function readSchoolStudentTotal() {
    let sum = 0;
    document.querySelectorAll('.j-bar[data-metric="Total"]').forEach((bar) => {
      sum += Number(bar.dataset.value);
    });
    return sum;
  }

  function wireBarChart() {
    document.querySelectorAll('.j-bar').forEach((bar) => {
      bar.addEventListener('mousemove', (event) => {
        const group = bar.closest('.j-bar-group');
        const { grade, total, sports } = group.dataset;
        const html = `
          <p class="c-chart-tooltip__label">${grade}</p>
          <p class="c-chart-tooltip__row c-chart-tooltip__row--total">Total : ${numberWithCommas(total)}</p>
          <p class="c-chart-tooltip__row c-chart-tooltip__row--sports">Sports : ${numberWithCommas(sports)}</p>`;
        showTooltip(event.clientX, event.clientY, html);
      });
      bar.addEventListener('mouseleave', () => {
        hideTooltip();
      });
    });
  }

  function openGradeDetail(gradeName, total, sports) {
    const sportRate = total ? (sports / total) * 100 : 0;
    openChartDetailModal({
      title: `${gradeName} participation`,
      category: `Students in ${gradeName}`,
      value: total,
      color: '#7FC7CC',
      description: `${sports} of ${total} students in ${gradeName} participate in at least one school sport.`,
      details: [
        { label: 'Total students', value: numberWithCommas(schoolStudentTotal) },
        { label: 'Sport participants', value: numberWithCommas(sports) },
        { label: 'Not in sports', value: numberWithCommas(total - sports) },
        { label: 'Grade participation', value: `${sportRate.toFixed(1)}%` }
      ]
    });
  }

  /* =======================================================================
     5. DONUT CHARTS — Sports Participation / Clubs & Societies
     -------------------------------------------------------------------------
     The slices and legend buttons are static SVG/HTML already in
     index.html (search it for "j-donut-slice" / "j-donut-legend-item").
     This section only reads that markup and wires up hover tooltips and
     click-through to the detail modal, computing each slice's share of
     its chart and of the whole school on demand.
     ======================================================================= */

  function wireDonutChart(containerId, totalLabel) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let total = 0;
    container.querySelectorAll('.j-donut-slice').forEach((slice) => {
      total += Number(slice.dataset.value || 0);
    });

    container.querySelectorAll('.j-donut-slice').forEach((slice) => {
      const { name, value } = slice.dataset;
      slice.addEventListener('mousemove', (event) => {
        const html = `
          <p class="c-chart-tooltip__eyebrow">${name}</p>
          <p class="c-chart-tooltip__value">${numberWithCommas(value)} students</p>`;
        showTooltip(event.clientX, event.clientY, html);
      });
      slice.addEventListener('mouseleave', hideTooltip);
    });

    container.querySelectorAll('.j-donut-legend-item').forEach((legendBtn) => {
      const { name, value } = legendBtn.dataset;
      legendBtn.addEventListener('click', () => openParticipationDetail(name, Number(value), total, totalLabel));
    });
  }

  function openParticipationDetail(name, value, groupTotal, collectiveLabel) {
    const isMembership = collectiveLabel.toLowerCase().includes('club');
    const title = isMembership ? 'membership' : 'participation';
    const groupShare = groupTotal ? (value / groupTotal) * 100 : 0;
    const schoolShare = schoolStudentTotal ? (value / schoolStudentTotal) * 100 : 0;
    openChartDetailModal({
      title: `${name} ${title}`,
      category: `Students in ${name}`,
      value,
      color: document.querySelector(`.j-donut-slice[data-name="${name}"]`)?.dataset.color || '#7FC7CC',
      description: `${numberWithCommas(value)} students are recorded in ${name}, representing ${groupShare.toFixed(1)}% of all ${collectiveLabel.toLowerCase()}.`,
      details: [
        { label: 'Total students', value: numberWithCommas(schoolStudentTotal) },
        { label: collectiveLabel, value: numberWithCommas(groupTotal) },
        { label: `Share of ${collectiveLabel.toLowerCase()}`, value: `${groupShare.toFixed(1)}%` },
        { label: 'Share of school', value: `${schoolShare.toFixed(1)}%` }
      ]
    });
  }

  /* =======================================================================
     6. DARK MONTH CALENDAR
     ======================================================================= */

  function renderCalendarWeekdayHeader() {
    const el = document.getElementById('j-calendar-weekdays');
    el.innerHTML = WEEKDAY_LABELS.map((day) => `<span class="c-calendar__weekday">${day}</span>`).join('');
  }

  function getEventsOnDate(date) {
    return state.calendarEvents.filter((event) => sameCalendarDay(event.date, date));
  }

  function renderCalendarGrid() {
    const daysEl = document.getElementById('j-calendar-days');
    const monthStart = startOfMonth(state.viewDate);
    const weekStartsOn = 1; // Monday
    const leadingBlanks = (monthStart.getDay() - weekStartsOn + 7) % 7;
    const totalDays = daysInMonth(state.viewDate);
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
      const isSelected = sameCalendarDay(state.selectedDate, date);
      const dateLabel = formatMonthDayYear(date);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'c-calendar__day';
      if (hasEvents) btn.classList.add('c-has-events');
      if (isSelected) btn.classList.add('c-is-selected');
      btn.setAttribute('aria-pressed', String(isSelected));
      btn.setAttribute('aria-label', hasEvents
        ? `View ${eventCount} ${eventCount === 1 ? 'event' : 'events'} for ${dateLabel}`
        : `View ${dateLabel}, no events scheduled`);
      btn.innerHTML = `<span style="line-height:1">${date.getDate()}</span>`;
      if (hasEvents && !isSelected) {
        btn.innerHTML += '<span class="c-calendar__day-dot" aria-hidden="true"></span>';
      }
      btn.addEventListener('click', () => {
        state.selectedDate = date;
        renderCalendarGrid();
        renderCalendarDayDetail();
      });
      daysEl.appendChild(btn);
    });
  }

  function renderCalendarDayDetail() {
    const countEl = document.getElementById('j-calendar-event-count');
    const detailEl = document.getElementById('j-calendar-day-detail');
    const dayEvents = getEventsOnDate(state.selectedDate);

    countEl.textContent = dayEvents.length === 1 ? '1 event scheduled' : `${dayEvents.length} events scheduled`;

    if (dayEvents.length) {
      const recentEvent = dayEvents[dayEvents.length - 1];

      detailEl.innerHTML = `
        <div class="c-calendar__day-events">
          <article class="c-day-event-card" style="position: relative;">
            <p class="c-day-event-card__eyebrow">${formatMonthDay(state.selectedDate)} · ${recentEvent.time}</p>
            <h3 class="c-day-event-card__title">${recentEvent.title}</h3>
            <p class="c-day-event-card__details">${recentEvent.details}</p>
            <div style="position: absolute; right: 12px; top: 12px; display: flex; gap: 8px; align-items: center;">
              <button type="button" class="j-edit-event-btn" data-event-id="${recentEvent.id}" aria-label="Edit event" style="background: none; border: none; cursor: pointer; color: white; padding: 4px;">
                <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6.5a1.5 1.5 0 0 0-3-3l-9.9 9.9a2 2 0 0 0-.5.83l-.9 3.02c-.1.34.23.67.57.57l3.02-.9a2 2 0 0 0 .83-.5z"/></svg>
              </button>
              <button type="button" class="j-delete-event-btn" data-event-id="${recentEvent.id}" aria-label="Delete event" style="background: none; border: none; cursor: pointer; color: #ff8888; padding: 4px;">
                <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </article>
          <button type="button" class="j-open-event-editor-btn" style="width: 100%; border: 1px dashed rgba(255, 255, 255, 0.6); border-radius: 8px; background: rgba(255, 255, 255, 0.1); padding: 1.25rem 1rem; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s; margin-top: 0.25rem;" onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
            <span style="color: #EA8913; font-weight: 600; font-size: 0.875rem;">Add event</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA8913" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>`;

      const editBtn = detailEl.querySelector('.j-edit-event-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          const ev = state.calendarEvents.find(e => e.id === editBtn.dataset.eventId);
          if (ev) openEventEditorModal(ev);
        });
      }

      const deleteBtn = detailEl.querySelector('.j-delete-event-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          const ev = state.calendarEvents.find(e => e.id === deleteBtn.dataset.eventId);
          if (ev) {
            showConfirmDeleteModal({
              title: 'Delete event?',
              description: `This will remove the event "${ev.title}" from the calendar.`,
              buttonText: 'Delete event',
              onConfirm: () => {
                state.calendarEvents = state.calendarEvents.filter(e => e.id !== ev.id);
                try {
                  localStorage.setItem('lecole_shared_events', JSON.stringify(state.calendarEvents.filter(e => e.source !== 'examination')));
                } catch (err) {}
                refreshCalendar();
              }
            });
          }
        });
      }

      detailEl.querySelector('.j-open-event-editor-btn').addEventListener('click', () => {
        openEventEditorModal();
      });
    } else {
      detailEl.innerHTML = `
        <div class="c-calendar__empty-day">
          <button type="button" class="j-open-event-editor-btn" style="width: 100%; border: 1px dashed rgba(255, 255, 255, 0.6); border-radius: 8px; background: rgba(255, 255, 255, 0.1); padding: 1.25rem 1rem; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
            <span style="color: #EA8913; font-weight: 600; font-size: 0.875rem;">Add event</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA8913" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>`;
      detailEl.querySelector('.j-open-event-editor-btn').addEventListener('click', () => {
        openEventEditorModal();
      });
    }
  }

  function renderCalendarHeaderValues() {
    document.querySelector('#j-select-month .j-select-value').textContent = MONTH_NAMES[state.viewDate.getMonth()];
    document.querySelector('#j-select-year .j-select-value').textContent = String(state.viewDate.getFullYear());
    document.getElementById('j-calendar-prev').disabled = state.viewDate.getFullYear() === MIN_CALENDAR_YEAR && state.viewDate.getMonth() === 0;
    document.getElementById('j-calendar-next').disabled = state.viewDate.getFullYear() === MAX_CALENDAR_YEAR && state.viewDate.getMonth() === 11;
  }

  function refreshCalendar() {
    renderCalendarHeaderValues();
    renderCalendarGrid();
    renderCalendarDayDetail();
  }

  function updateCalendarView(nextViewDate) {
    state.viewDate = startOfMonth(nextViewDate);
    state.selectedDate = changeCalendarView(state.selectedDate, nextViewDate);
    refreshCalendar();
  }

  function initCalendarNav() {
    document.getElementById('j-calendar-prev').addEventListener('click', () => {
      updateCalendarView(new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1, 1));
    });
    document.getElementById('j-calendar-next').addEventListener('click', () => {
      updateCalendarView(new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 1));
    });
  }

  /* ---- custom select dropdowns (month / year) ---------------------- */

  function buildSelect(rootId, options, currentValueGetter, onChoose) {
    const root = document.getElementById(rootId);
    const trigger = root.querySelector('.c-select__trigger');
    const valueLabel = root.querySelector('.j-select-value');
    const menu = root.querySelector('.c-select__menu');

    function renderMenu() {
      const currentValue = currentValueGetter();
      menu.innerHTML = options.map((opt) => `
        <button type="button" class="c-select__option ${opt.value === currentValue ? 'c-is-selected' : ''}" data-value="${opt.value}" role="option">
          <span>${opt.label}</span>
          ${opt.value === currentValue ? '<svg class="c-icon c-select__option-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
        </button>`).join('');
      menu.querySelectorAll('.c-select__option').forEach((optionBtn) => {
        optionBtn.addEventListener('click', () => {
          onChoose(optionBtn.dataset.value);
          closeMenu();
        });
      });
      // scroll the currently selected option into view
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
      const menuMinWidth = 0;
      const menuWidth = Math.min(Math.max(rect.width, menuMinWidth), window.innerWidth - viewportPadding * 2);
      menu.classList.toggle('c-placement-above', openAbove);
      menu.style.maxHeight = `${maxHeight}px`;
      menu.style.width = `${menuWidth}px`;
      menu.style.left = `${Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - menuWidth - viewportPadding))}px`;
      if (openAbove) {
        menu.style.bottom = `${window.innerHeight - rect.top + 6}px`;
        menu.style.top = '';
      } else {
        menu.style.top = `${rect.bottom + 6}px`;
        menu.style.bottom = '';
      }
    }

    function openMenu() {
      closeAllSelects();
      renderMenu();
      root.classList.add('c-is-open');
      trigger.setAttribute('aria-expanded', 'true');
      positionMenu();
      // allow the menu to mount before triggering the entrance transition
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

    trigger.addEventListener('click', () => {
      root.classList.contains('c-is-open') ? closeMenu() : openMenu();
    });

    root.__closeSelect = closeMenu;
    root.__refreshLabel = () => { valueLabel.textContent = options.find((o) => o.value === currentValueGetter())?.label ?? ''; };
    return root;
  }

  const activeSelectRoots = [];

  function closeAllSelects() {
    activeSelectRoots.forEach((root) => root.__closeSelect && root.__closeSelect());
  }

  function initCalendarSelects() {
    const monthOptions = MONTH_NAMES.map((name, index) => ({ label: name, value: String(index) }));
    const yearOptions = Array.from({ length: MAX_CALENDAR_YEAR - MIN_CALENDAR_YEAR + 1 }, (_, i) => {
      const year = MIN_CALENDAR_YEAR + i;
      return { label: String(year), value: String(year) };
    });

    const monthSelect = buildSelect(
      'j-select-month',
      monthOptions,
      () => String(state.viewDate.getMonth()),
      (value) => updateCalendarView(new Date(state.viewDate.getFullYear(), Number(value), 1))
    );
    const yearSelect = buildSelect(
      'j-select-year',
      yearOptions,
      () => String(state.viewDate.getFullYear()),
      (value) => updateCalendarView(new Date(Number(value), state.viewDate.getMonth(), 1))
    );
    activeSelectRoots.push(monthSelect, yearSelect);

    document.addEventListener('mousedown', (event) => {
      activeSelectRoots.forEach((root) => {
        if (!root.contains(event.target)) root.__closeSelect();
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAllSelects();
    });
  }

  /* =======================================================================
     7. MODAL — ADD / EDIT CALENDAR EVENT
     ======================================================================= */

  const eventEditorEls = {
    layer: document.getElementById('j-modal-event-editor'),
    monthLabel: document.getElementById('j-event-editor-month'),
    title: document.getElementById('j-event-editor-title'),
    description: document.getElementById('j-event-editor-description'),
    form: document.getElementById('j-event-form'),
    errorBanner: document.getElementById('j-event-form-error-banner'),
    timeField: document.getElementById('j-field-time'),
    timeError: document.getElementById('j-field-time-error'),
    titleField: document.getElementById('j-field-title'),
    titleError: document.getElementById('j-field-title-error'),
    detailsField: document.getElementById('j-field-details'),
    detailsError: document.getElementById('j-field-details-error'),
    categoryField: document.getElementById('j-field-category'),
    extracurricularWrap: document.getElementById('j-field-extracurricular-wrap'),
    extracurricularTarget: document.getElementById('j-field-extracurricular-target'),
    audienceSelectTrigger: document.getElementById('j-audience-trigger'),
    audienceSelectMenu: document.getElementById('j-audience-menu'),
    audienceOptions: document.querySelectorAll('.j-audience-option'),
    submitLabel: document.getElementById('j-event-form-submit-label')
  };

  let selectedAudiences = [];

  function renderAudienceChips() {
    eventEditorEls.audienceSelectTrigger.innerHTML = '';
    if (selectedAudiences.length === 0) {
      eventEditorEls.audienceSelectTrigger.innerHTML = '<span style="color: var(--midnight); opacity: 0.5; font-size: 0.875rem; padding: 4px;" id="j-audience-placeholder">Select audiences...</span>';
    } else {
      selectedAudiences.forEach(aud => {
        const chip = document.createElement('span');
        chip.style.cssText = 'background: rgba(127, 199, 204, 0.2); color: var(--midnight); font-size: 0.75rem; font-weight: 500; padding: 2px 8px; border-radius: var(--radius-full); display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--sky-blue);';
        chip.innerHTML = `${aud} <span class="j-remove-audience" data-val="${aud}" style="cursor: pointer; opacity: 0.6;">&times;</span>`;
        eventEditorEls.audienceSelectTrigger.appendChild(chip);
      });
    }

    eventEditorEls.audienceOptions.forEach(opt => {
      const val = opt.dataset.val;
      const check = opt.querySelector('.j-audience-check');
      if (selectedAudiences.includes(val)) {
        opt.style.background = 'var(--cream)';
        check.style.display = 'block';
      } else {
        opt.style.background = 'transparent';
        check.style.display = 'none';
      }
    });
  }

  function openEventEditorModal(eventToEdit) {
    const monthLabel = formatMonthYear(state.viewDate);

    eventEditorEls.monthLabel.textContent = `${monthLabel} calendar`;
    
    if (eventToEdit && eventToEdit.id) {
      eventEditorEls.title.textContent = 'Edit event';
      eventEditorEls.submitLabel.textContent = 'Save changes';
      eventEditorEls.form.dataset.eventId = eventToEdit.id;
      eventEditorEls.timeField.value = eventToEdit.time || '';
      eventEditorEls.titleField.value = eventToEdit.title || '';
      eventEditorEls.detailsField.value = eventToEdit.details || '';
      eventEditorEls.categoryField.value = eventToEdit.category || 'Other';
      if (eventEditorEls.categoryField.value === 'Extracurricular') {
        eventEditorEls.extracurricularWrap.style.display = 'block';
        eventEditorEls.extracurricularTarget.value = eventToEdit.extracurricularTarget || '';
      } else {
        eventEditorEls.extracurricularWrap.style.display = 'none';
        eventEditorEls.extracurricularTarget.value = '';
      }
      selectedAudiences = eventToEdit.audiences || ['Students', 'Teachers', 'Parents', 'Management'];
      renderAudienceChips();
    } else {
      eventEditorEls.title.textContent = 'Add an event';
      eventEditorEls.submitLabel.textContent = 'Save event';
      delete eventEditorEls.form.dataset.eventId;
      eventEditorEls.timeField.value = '';
      eventEditorEls.titleField.value = '';
      eventEditorEls.detailsField.value = '';
      eventEditorEls.categoryField.value = 'Other';
      eventEditorEls.extracurricularWrap.style.display = 'none';
      eventEditorEls.extracurricularTarget.value = '';
      selectedAudiences = ['Students', 'Teachers', 'Parents', 'Management'];
      renderAudienceChips();
    }

    eventEditorEls.description.textContent = `This event is saved to the dashboard calendar for ${formatMonthDayYear(state.selectedDate)}.`;
    clearEventFormErrors();

    openModal(eventEditorEls.layer);
    window.setTimeout(() => eventEditorEls.titleField.focus(), 50);
  }

  function clearEventFormErrors() {
    eventEditorEls.errorBanner.classList.remove('c-is-visible');
    [eventEditorEls.timeError, eventEditorEls.titleError, eventEditorEls.detailsError]
      .forEach((el) => el.classList.remove('c-is-visible'));
    [eventEditorEls.timeField, eventEditorEls.titleField, eventEditorEls.detailsField]
      .forEach((el) => el.removeAttribute('aria-invalid'));
  }

  function initEventEditor() {
    [eventEditorEls.timeField, eventEditorEls.titleField, eventEditorEls.detailsField].forEach((field) => {
      field.addEventListener('input', clearEventFormErrors);
    });

    eventEditorEls.categoryField.addEventListener('change', (e) => {
      if (e.target.value === 'Extracurricular') {
        eventEditorEls.extracurricularWrap.style.display = 'block';
      } else {
        eventEditorEls.extracurricularWrap.style.display = 'none';
        eventEditorEls.extracurricularTarget.value = '';
      }
    });

    eventEditorEls.audienceSelectTrigger.addEventListener('click', (e) => {
      if (e.target.closest('.j-remove-audience')) {
        e.stopPropagation();
        const val = e.target.closest('.j-remove-audience').dataset.val;
        selectedAudiences = selectedAudiences.filter(a => a !== val);
        renderAudienceChips();
        return;
      }
      const isVisible = eventEditorEls.audienceSelectMenu.style.display === 'block';
      eventEditorEls.audienceSelectMenu.style.display = isVisible ? 'none' : 'block';
    });

    eventEditorEls.audienceOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.dataset.val;
        if (selectedAudiences.includes(val)) {
          selectedAudiences = selectedAudiences.filter(a => a !== val);
        } else {
          selectedAudiences.push(val);
        }
        renderAudienceChips();
      });
    });

    document.addEventListener('mousedown', (e) => {
      if (!eventEditorEls.audienceSelectMenu.contains(e.target) && !eventEditorEls.audienceSelectTrigger.contains(e.target)) {
        eventEditorEls.audienceSelectMenu.style.display = 'none';
      }
    });

    eventEditorEls.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const selectedDay = state.selectedDate.getDate();
      const time = eventEditorEls.timeField.value.trim();
      const title = eventEditorEls.titleField.value.trim();
      const details = eventEditorEls.detailsField.value.trim();

      let hasError = false;
      clearEventFormErrors();
      if (!title) {
        eventEditorEls.titleError.classList.add('c-is-visible');
        eventEditorEls.titleField.setAttribute('aria-invalid', 'true');
        hasError = true;
      }
      if (!time) {
        eventEditorEls.timeError.classList.add('c-is-visible');
        eventEditorEls.timeField.setAttribute('aria-invalid', 'true');
        hasError = true;
      }
      if (!details) {
        eventEditorEls.detailsError.classList.add('c-is-visible');
        eventEditorEls.detailsField.setAttribute('aria-invalid', 'true');
        hasError = true;
      }
      if (hasError) {
        eventEditorEls.errorBanner.classList.add('c-is-visible');
        return;
      }

      const newDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth(), selectedDay);
      const category = eventEditorEls.categoryField.value;
      const extracurricularTarget = eventEditorEls.extracurricularTarget.value;
      const audiences = [...selectedAudiences];

      const existingId = eventEditorEls.form.dataset.eventId;
      let evToSave;
      if (existingId) {
        evToSave = state.calendarEvents.find(e => e.id === existingId);
        if (evToSave) {
          evToSave.time = time;
          evToSave.title = title;
          evToSave.details = details;
          evToSave.category = category;
          evToSave.extracurricularTarget = extracurricularTarget;
          evToSave.audiences = audiences;
        }
      } else {
        evToSave = {
          id: `event-${Date.now()}`,
          date: newDate,
          time,
          title,
          details,
          source: 'event',
          category,
          extracurricularTarget,
          audiences
        };
        state.calendarEvents.push(evToSave);
      }
      
      saveSharedEvent(evToSave);
      
      state.selectedDate = newDate;
      refreshCalendar();
      closeModal(eventEditorEls.layer);
    });
  }

  /* =======================================================================
     8. MODAL — CHART / METRIC DETAIL
     ======================================================================= */

  const chartDetailEls = {
    layer: document.getElementById('j-modal-chart-detail'),
    icon: document.getElementById('j-chart-detail-icon'),
    icon2: document.getElementById('j-chart-detail-icon-2'),
    title: document.getElementById('j-chart-detail-title'),
    category: document.getElementById('j-chart-detail-category'),
    value: document.getElementById('j-chart-detail-value'),
    description: document.getElementById('j-chart-detail-description'),
    stats: document.getElementById('j-chart-detail-stats')
  };

  function openChartDetailModal(detail) {
    chartDetailEls.icon.style.backgroundColor = detail.color;
    chartDetailEls.icon2.style.backgroundColor = detail.color;
    chartDetailEls.title.textContent = detail.title;
    chartDetailEls.category.textContent = detail.category;
    chartDetailEls.value.textContent = numberWithCommas(detail.value);
    chartDetailEls.description.textContent = detail.description;
    chartDetailEls.stats.innerHTML = detail.details.map((item) => `
      <div class="c-chart-detail__stat">
        <dt class="c-chart-detail__stat-label">${item.label}</dt>
        <dd class="c-chart-detail__stat-value">${item.value}</dd>
      </div>`).join('');
    openModal(chartDetailEls.layer, chartDetailEls.layer.querySelector('.j-modal-close'));
  }

  /* =======================================================================
     9. MODAL — FULL DAY SCHEDULE ("View all")
     ======================================================================= */

  const dayScheduleEls = {
    layer: document.getElementById('j-modal-day-schedule'),
    title: document.getElementById('j-day-schedule-title'),
    description: document.getElementById('j-day-schedule-description'),
    body: document.getElementById('j-day-schedule-body')
  };

  function openDayScheduleModal() {
    const dayEvents = getEventsOnDate(state.selectedDate);
    dayScheduleEls.title.textContent = formatLongDate(state.selectedDate);
    dayScheduleEls.description.textContent = dayEvents.length === 1
      ? '1 event is scheduled for this day.'
      : `${dayEvents.length} events are scheduled for this day.`;

    if (dayEvents.length) {
      dayScheduleEls.body.innerHTML = `<ol class="c-day-schedule__list">${dayEvents.map((event, index) => `
        <li class="c-day-schedule__item" style="animation-delay:${index * 35}ms">
          <div class="c-day-schedule__item-top">
            <div>
              <p class="c-day-schedule__time">
                <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${event.time}
              </p>
              <h3 class="c-day-schedule__title">${event.title}</h3>
            </div>
            ${event.type ? `<span class="c-day-schedule__type">${event.type}</span>` : ''}
          </div>
          <p class="c-day-schedule__details">
            <svg class="c-icon c-day-schedule__details-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${event.details}</span>
          </p>
        </li>`).join('')}</ol>`;
    } else {
      dayScheduleEls.body.innerHTML = `
        <div class="c-day-schedule__empty">
          <span class="c-day-schedule__empty-icon" aria-hidden="true">
            <svg class="c-icon" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          </span>
          <h3 class="c-day-schedule__empty-title">No events scheduled</h3>
          <p class="c-day-schedule__empty-text">${formatLongDate(state.selectedDate)} is clear. Add an event from this calendar when plans are confirmed.</p>
        </div>`;
    }

    openModal(dayScheduleEls.layer, dayScheduleEls.layer.querySelector('.c-modal'));
  }
  function initDaySchedule() {
    document.getElementById('j-open-day-schedule').addEventListener('click', openDayScheduleModal);
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

  /* =======================================================================
     GENERIC MODAL OPEN / CLOSE (shared by all three modals)
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
     11. APP BOOTSTRAP
     ======================================================================= */

  function init() {
    // the "Total Students" metric card and the chart-detail maths both need
    // the whole-school figure; read it once from the static bar markup
    // rather than hardcoding it a second time.
    schoolStudentTotal = readSchoolStudentTotal();
    document.getElementById('j-metric-students').textContent = numberWithCommas(schoolStudentTotal);

    wireBarChart();
    wireDonutChart('j-donut-sports', 'Students in all sports');
    wireDonutChart('j-donut-clubs', 'Club and society members');

    renderCalendarWeekdayHeader();
    initCalendarNav();
    initCalendarSelects();
    refreshCalendar();

    initEventEditor();
    initDaySchedule();
    initModalDismissHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
