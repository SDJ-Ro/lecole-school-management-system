/* =========================================================================
   L'ÉCOLE ADMIN DASHBOARD — APPLICATION SCRIPT
   ========================================================================= */

(function () {
  'use strict';

  const mockData = window.DASHBOARD_MOCK_DATA || {};
  const examinationCalendarDetails = mockData.examinationCalendarDetails || {};

  const state = {
    viewDate: new Date(2026, 5, 1),
    selectedDate: new Date(2026, 5, 17),
    calendarEvents: []
  };

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
    if (idx >= 0) events[idx] = ev; else events.push(ev);
    localStorage.setItem('lecole_shared_events', JSON.stringify(events));
  }

  loadSharedEvents().forEach(ev => state.calendarEvents.push(ev));

  let schoolStudentTotal = 0;

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const MIN_CALENDAR_YEAR = 1980;
  const MAX_CALENDAR_YEAR = 2080;

  function sameCalendarDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function daysInMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); }
  function formatLongDate(date) { const w = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; return `${w[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`; }
  function formatMonthDayYear(date) { return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`; }
  function formatMonthDay(date) { return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`; }
  function changeCalendarView(cur, next) { const norm = startOfMonth(next); return new Date(norm.getFullYear(), norm.getMonth(), Math.min(cur.getDate(), daysInMonth(norm))); }
  function numberWithCommas(val) { return Number(val).toLocaleString(); }

  // Tooltip Helper
  const tooltipEl = document.getElementById('j-chart-tooltip');

  function showTooltip(clientX, clientY, html) {
    if (!tooltipEl) return;
    tooltipEl.innerHTML = html;
    tooltipEl.classList.add('c-is-visible');
    const p = 14, rect = tooltipEl.getBoundingClientRect();
    let l = clientX + p, t = clientY + p;
    if (l + rect.width > window.innerWidth - 8) l = clientX - rect.width - p;
    if (t + rect.height > window.innerHeight - 8) t = clientY - rect.height - p;
    tooltipEl.style.left = `${Math.max(8, l)}px`;
    tooltipEl.style.top = `${Math.max(8, t)}px`;
  }

  function hideTooltip() { if (tooltipEl) tooltipEl.classList.remove('c-is-visible'); }

  // Bar & Donut Charts
  function wireBarChart() {
    document.querySelectorAll('.j-bar').forEach((bar) => {
      bar.addEventListener('mousemove', (e) => {
        const { grade, total, sports } = bar.closest('.j-bar-group').dataset;
        showTooltip(e.clientX, e.clientY, `<p class="c-chart-tooltip__label">${grade}</p><p class="c-chart-tooltip__row c-chart-tooltip__row--total">Total : ${numberWithCommas(total)}</p><p class="c-chart-tooltip__row c-chart-tooltip__row--sports">Sports : ${numberWithCommas(sports)}</p>`);
      });
      bar.addEventListener('mouseleave', hideTooltip);
    });
  }

  function wireDonutChart(containerId, totalLabel) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let total = 0;
    container.querySelectorAll('.j-donut-slice').forEach((slice) => { total += Number(slice.dataset.value || 0); });

    container.querySelectorAll('.j-donut-slice').forEach((slice) => {
      const { name, value } = slice.dataset;
      slice.addEventListener('mousemove', (e) => showTooltip(e.clientX, e.clientY, `<p class="c-chart-tooltip__eyebrow">${name}</p><p class="c-chart-tooltip__value">${numberWithCommas(value)} students</p>`));
      slice.addEventListener('mouseleave', hideTooltip);
    });

    container.querySelectorAll('.j-donut-legend-item').forEach((btn) => {
      const { name, value } = btn.dataset;
      btn.addEventListener('click', () => {
        const val = Number(value);
        openChartDetailModal({
          title: `${name} participation`,
          category: `Students in ${name}`,
          value: val,
          color: container.querySelector(`.j-donut-slice[data-name="${name}"]`)?.dataset.color || '#7FC7CC',
          description: `${numberWithCommas(val)} students are recorded in ${name}.`,
          details: [
            { label: 'Total students', value: numberWithCommas(schoolStudentTotal) },
            { label: totalLabel, value: numberWithCommas(total) }
          ]
        });
      });
    });
  }

  // Dark Month Calendar
  function renderCalendarGrid() {
    const daysEl = document.getElementById('j-calendar-days');
    if (!daysEl) return;
    const monthStart = startOfMonth(state.viewDate);
    const leadingBlanks = (monthStart.getDay() - 1 + 7) % 7;
    const totalDays = daysInMonth(state.viewDate);
    const dateCells = Array.from({ length: totalDays }, (_, i) => new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1));
    const cellCount = Math.max(35, leadingBlanks + dateCells.length + ((7 - ((leadingBlanks + dateCells.length) % 7)) % 7));
    const finalTrailing = cellCount - leadingBlanks - dateCells.length;

    const cells = [...Array(leadingBlanks).fill(null), ...dateCells, ...Array(finalTrailing).fill(null)];

    daysEl.innerHTML = '';
    cells.forEach((date) => {
      if (!date) {
        const blank = document.createElement('span');
        blank.className = 'c-calendar__day-blank';
        daysEl.appendChild(blank);
        return;
      }
      const dayEvents = state.calendarEvents.filter((ev) => sameCalendarDay(ev.date, date));
      const hasEvents = dayEvents.length > 0;
      const isSelected = sameCalendarDay(state.selectedDate, date);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `c-calendar__day ${hasEvents ? 'c-has-events' : ''} ${isSelected ? 'c-is-selected' : ''}`;
      btn.innerHTML = `<span style="line-height:1">${date.getDate()}</span>${hasEvents && !isSelected ? '<span class="c-calendar__day-dot" aria-hidden="true"></span>' : ''}`;
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
    if (!countEl || !detailEl) return;
    const dayEvents = state.calendarEvents.filter((ev) => sameCalendarDay(ev.date, state.selectedDate));

    countEl.textContent = `${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'} scheduled`;

    if (dayEvents.length) {
      const recentEvent = dayEvents[dayEvents.length - 1];
      detailEl.innerHTML = `
        <div class="c-calendar__day-events">
          <article class="c-day-event-card" style="position: relative;">
            <p class="c-day-event-card__eyebrow">${formatMonthDay(state.selectedDate)} · ${recentEvent.time}</p>
            <h3 class="c-day-event-card__title">${recentEvent.title}</h3>
            <p class="c-day-event-card__details">${recentEvent.details}</p>
            <div style="position: absolute; right: 12px; top: 12px; display: flex; gap: 8px;">
              <button type="button" class="j-edit-event-btn" data-event-id="${recentEvent.id}" style="background:none;border:none;cursor:pointer;color:white;"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 6.5a1.5 1.5 0 0 0-3-3l-9.9 9.9a2 2 0 0 0-.5.83l-.9 3.02c-.1.34.23.67.57.57l3.02-.9a2 2 0 0 0 .83-.5z"/></svg></button>
              <button type="button" class="j-delete-event-btn" data-event-id="${recentEvent.id}" style="background:none;border:none;cursor:pointer;color:#ff8888;"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
            </div>
          </article>
          <button type="button" class="j-open-event-editor-btn" style="width: 100%; min-height: 85px; border: 1px dashed rgba(255, 255, 255, 0.6); border-radius: 12px; background: rgba(255, 255, 255, 0.1); padding: 1.75rem 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s; margin-top: 0.75rem;" onmouseover="this.style.background='rgba(255, 255, 255, 0.18)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
            <span style="color: #EA8913; font-weight: 700; font-size: 1rem;">Add event</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EA8913" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>`;

      detailEl.querySelector('.j-edit-event-btn')?.addEventListener('click', () => openEventEditorModal(recentEvent));
      detailEl.querySelector('.j-delete-event-btn')?.addEventListener('click', () => {
        state.calendarEvents = state.calendarEvents.filter((ev) => ev.id !== recentEvent.id);
        renderCalendarGrid();
        renderCalendarDayDetail();
      });
      detailEl.querySelector('.j-open-event-editor-btn')?.addEventListener('click', () => openEventEditorModal(null));
    } else {
      detailEl.innerHTML = `<div class="c-calendar__day-empty"><p style="color:rgba(255,255,255,0.7);font-size:0.875rem;">No events scheduled for ${formatMonthDay(state.selectedDate)}.</p><button type="button" class="j-open-event-editor-btn" style="border: 1px dashed rgba(255,255,255,0.6); border-radius: 8px; background: rgba(255,255,255,0.1); padding: 0.75rem 1.5rem; cursor: pointer; color:#EA8913; font-weight:600;">Add event</button></div>`;
      detailEl.querySelector('.j-open-event-editor-btn')?.addEventListener('click', () => openEventEditorModal(null));
    }
  }

  function renderMonthSelect() {
    const root = document.getElementById('j-calendar-month-select');
    if (!root) return;
    const valueEl = root.querySelector('.j-select-value');
    const menuEl = root.querySelector('.c-select__menu');
    const curMonth = state.viewDate.getMonth();

    valueEl.textContent = MONTH_NAMES[curMonth];
    menuEl.innerHTML = MONTH_NAMES.map((name, idx) => `<button type="button" class="c-select__option ${idx === curMonth ? 'c-is-selected' : ''}" data-value="${idx}" role="option"><span>${name}</span></button>`).join('');

    menuEl.querySelectorAll('.c-select__option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const nextView = new Date(state.viewDate.getFullYear(), Number(opt.dataset.value), 1);
        state.selectedDate = changeCalendarView(state.selectedDate, nextView);
        state.viewDate = nextView;
        renderCalendarGrid();
        renderCalendarDayDetail();
        renderMonthSelect();
        root.classList.remove('c-is-open');
      });
    });
  }

  function renderYearSelect() {
    const root = document.getElementById('j-calendar-year-select');
    if (!root) return;
    const valueEl = root.querySelector('.j-select-value');
    const menuEl = root.querySelector('.c-select__menu');
    const curYear = state.viewDate.getFullYear();

    valueEl.textContent = String(curYear);
    const years = Array.from({ length: MAX_CALENDAR_YEAR - MIN_CALENDAR_YEAR + 1 }, (_, i) => MIN_CALENDAR_YEAR + i);
    menuEl.innerHTML = years.map((yr) => `<button type="button" class="c-select__option ${yr === curYear ? 'c-is-selected' : ''}" data-value="${yr}" role="option"><span>${yr}</span></button>`).join('');

    menuEl.querySelectorAll('.c-select__option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const nextView = new Date(Number(opt.dataset.value), state.viewDate.getMonth(), 1);
        state.selectedDate = changeCalendarView(state.selectedDate, nextView);
        state.viewDate = nextView;
        renderCalendarGrid();
        renderCalendarDayDetail();
        renderYearSelect();
        root.classList.remove('c-is-open');
      });
    });
  }

  let currentEditingEvent = null;
  function openEventEditorModal(eventToEdit) {
    currentEditingEvent = eventToEdit;
    const modalEl = document.getElementById('j-modal-event-editor');
    if (!modalEl) return;
    document.getElementById('j-event-input-title').value = eventToEdit ? eventToEdit.title : '';
    document.getElementById('j-event-input-time').value = eventToEdit ? eventToEdit.time : '09:00 AM';
    document.getElementById('j-event-input-details').value = eventToEdit ? eventToEdit.details : '';
    modalEl.classList.add('c-is-open');
  }

  function openChartDetailModal({ title, category, value, color, description, details }) {
    const layer = document.getElementById('j-modal-chart-detail');
    if (!layer) return;
    layer.querySelector('.j-detail-title').textContent = title;
    layer.querySelector('.j-detail-category').textContent = category;
    layer.querySelector('.j-detail-value').textContent = numberWithCommas(value);
    layer.querySelector('.j-detail-description').textContent = description;
    layer.querySelector('.j-detail-list').innerHTML = details.map((d) => `<div class="c-detail-metric"><p class="c-detail-metric__label">${d.label}</p><p class="c-detail-metric__value">${d.value}</p></div>`).join('');
    layer.classList.add('c-is-open');
  }

  document.addEventListener('DOMContentLoaded', function () {
    let sum = 0;
    document.querySelectorAll('.j-bar[data-metric="Total"]').forEach((bar) => { sum += Number(bar.dataset.value); });
    schoolStudentTotal = sum;

    wireBarChart();
    wireDonutChart('j-donut-sports', 'Sport participants');
    wireDonutChart('j-donut-clubs', 'Club members');

    const mSelect = document.getElementById('j-calendar-month-select');
    const ySelect = document.getElementById('j-calendar-year-select');

    if (mSelect) mSelect.querySelector('.c-select__trigger').addEventListener('click', () => mSelect.classList.toggle('c-is-open'));
    if (ySelect) ySelect.querySelector('.c-select__trigger').addEventListener('click', () => ySelect.classList.toggle('c-is-open'));

    document.getElementById('j-calendar-prev-month')?.addEventListener('click', () => {
      const nextView = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1, 1);
      state.selectedDate = changeCalendarView(state.selectedDate, nextView);
      state.viewDate = nextView;
      renderCalendarGrid(); renderCalendarDayDetail(); renderMonthSelect(); renderYearSelect();
    });

    document.getElementById('j-calendar-next-month')?.addEventListener('click', () => {
      const nextView = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 1);
      state.selectedDate = changeCalendarView(state.selectedDate, nextView);
      state.viewDate = nextView;
      renderCalendarGrid(); renderCalendarDayDetail(); renderMonthSelect(); renderYearSelect();
    });

    const weekdaysEl = document.getElementById('j-calendar-weekdays');
    if (weekdaysEl) weekdaysEl.innerHTML = WEEKDAY_LABELS.map((day) => `<span class="c-calendar__weekday">${day}</span>`).join('');

    renderMonthSelect();
    renderYearSelect();
    renderCalendarGrid();
    renderCalendarDayDetail();

    const editorModal = document.getElementById('j-modal-event-editor');
    if (editorModal) {
      editorModal.querySelectorAll('.j-modal-close, .j-modal-backdrop').forEach((el) => el.addEventListener('click', () => editorModal.classList.remove('c-is-open')));
      document.getElementById('j-event-editor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('j-event-input-title').value.trim();
        if (!title) return;
        if (currentEditingEvent) {
          currentEditingEvent.title = title;
        } else {
          const newEvent = { id: `user-event-${Date.now()}`, date: new Date(state.selectedDate), time: '09:00 AM', title, details: '', category: 'Academic', source: 'user' };
          state.calendarEvents.push(newEvent);
          saveSharedEvent(newEvent);
        }
        renderCalendarGrid(); renderCalendarDayDetail(); editorModal.classList.remove('c-is-open');
      });
    }

    document.querySelectorAll('.c-modal-layer').forEach((layer) => {
      layer.querySelectorAll('.j-modal-backdrop, .j-modal-close').forEach((el) => el.addEventListener('click', () => layer.classList.remove('c-is-open')));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') document.querySelectorAll('.c-modal-layer.c-is-open').forEach((layer) => layer.classList.remove('c-is-open'));
    });

    // ── DAY SCHEDULE MODAL ("View all") ──────────────────────────────────
    const dayScheduleLayer = document.getElementById('j-modal-day-schedule');
    const dayScheduleTitle = document.getElementById('j-day-schedule-title');
    const dayScheduleDesc  = document.getElementById('j-day-schedule-description');
    const dayScheduleBody  = document.getElementById('j-day-schedule-body');

    function openDayScheduleModal() {
      if (!dayScheduleLayer) return;
      const dayEvents = state.calendarEvents.filter((ev) => sameCalendarDay(ev.date, state.selectedDate));
      const longDate = formatLongDate(state.selectedDate);

      if (dayScheduleTitle) dayScheduleTitle.textContent = longDate;
      if (dayScheduleDesc) dayScheduleDesc.textContent = dayEvents.length === 1
        ? '1 event is scheduled for this day.'
        : `${dayEvents.length} events are scheduled for this day.`;

      if (dayScheduleBody) {
        if (dayEvents.length) {
          dayScheduleBody.innerHTML = `<ol class="c-day-schedule__list">${dayEvents.map((event, index) => `
            <li class="c-day-schedule__item" style="animation-delay:${index * 35}ms">
              <div class="c-day-schedule__item-top">
                <div>
                  <p class="c-day-schedule__time">
                    <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ${event.time}
                  </p>
                  <h3 class="c-day-schedule__title">${event.title}</h3>
                </div>
                ${event.type || event.category ? `<span class="c-day-schedule__type">${event.type || event.category}</span>` : ''}
              </div>
              ${event.details ? `<p class="c-day-schedule__details">
                <svg class="c-icon c-day-schedule__details-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${event.details}</span>
              </p>` : ''}
            </li>`).join('')}</ol>`;
        } else {
          dayScheduleBody.innerHTML = `
            <div class="c-day-schedule__empty">
              <span class="c-day-schedule__empty-icon" aria-hidden="true">
                <svg class="c-icon" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
              </span>
              <h3 class="c-day-schedule__empty-title">No events scheduled</h3>
              <p class="c-day-schedule__empty-text">${longDate} is clear.</p>
            </div>`;
        }
      }

      dayScheduleLayer.classList.add('c-is-open');
      const focusEl = dayScheduleLayer.querySelector('.c-modal');
      if (focusEl) window.setTimeout(() => focusEl.focus(), 50);
    }

    const viewAllBtn = document.getElementById('j-open-day-schedule');
    if (viewAllBtn) viewAllBtn.addEventListener('click', openDayScheduleModal);
  });
})();
