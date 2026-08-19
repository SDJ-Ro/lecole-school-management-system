/* =========================================================================
   L'ÉCOLE ADMIN — ACADEMIC OVERVIEW — APPLICATION SCRIPT
   -------------------------------------------------------------------------
   DESIGN PRINCIPLE: this file only contains things that genuinely need to
   run in the browser. The grade/class structure, the curriculum subjects,
   and the exam calendar are all mutable application state (people add
   grades, add classes, assign teachers, edit curriculum) so — unlike a
   fully static page — they really are rendered by JS from data. The
   section-performance chart is likewise rebuilt on every filter change
   because its two series genuinely depend on the live selection.

   Sections in this file:
     1. Shared seed data (grades, curriculum, staff, enrollment, exams)
     2. Date helpers
     3. Sidebar behaviour (collapse + nav selection)
     4. Generic custom-select widget (reused for every dropdown on page)
     5. Class-section performance bar chart (JS-plotted, filter driven)
     6. Term 2 exam calendar (render, navigation, sessions list)
     7. Modal: Add / edit exam calendar event
     8. Modal: Full day schedule ("View all")
     9. Grade & class structure (grade cards, class rows, inline editor)
    10. Teacher assignment field (dropdown + hover workload preview)
    11. Curriculum subjects (cards + inline editor)
    12. Modal: Add a grade
    13. Generic modal open/close (shared by all modals)
    14. Shared chart tooltip helper
    15. App bootstrap
   Naming reminder: elements this script queries are marked with the j-*
   class or id prefix (see styles.css header comment for the full rule).
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. SHARED SEED DATA
     ======================================================================= */

  const mockData = window.ACADEMIC_MOCK_DATA || {};
  const initialSubjects = mockData.initialSubjects || [];
  const initialCurriculumGroups = mockData.initialCurriculumGroups || [];
  const initialGrades = mockData.initialGrades || [];
  const initialClassTeachers = mockData.initialClassTeachers || {};
  const staffAssignments = mockData.staffAssignments || [];
  const initialClassEnrollments = mockData.initialClassEnrollments || {};
  const initialEnrollmentGrades = mockData.initialEnrollmentGrades || [];
  const examSessions = mockData.examSessions || [];

  /** Mutable application state (in-memory only — resets on page reload). */
  const state = {
    sidebarCollapsed: false,

    classEnrollments: Object.assign({}, initialClassEnrollments),
    enrollmentGrades: initialEnrollmentGrades.map((g) => ({ id: g.id, name: g.name, classNames: g.classNames.slice() })),

    grades: initialGrades.map((g) => ({ id: g.id, name: g.name, classes: g.classes.slice(), subjectScores: cloneScores(g.subjectScores) })),
    curriculumGroups: initialCurriculumGroups.map((g) => ({ range: g.range, description: g.description, subjects: g.subjects.slice() })),
    classTeachers: Object.assign({}, initialClassTeachers),
    subjectAssignments: buildInitialSubjectAssignments(),

    selectedGradeId: 'g6',
    selectedSubject: 'Mathematics',
    selectedTerm: 'Term 1',

    examViewDate: new Date(2026, 5, 1),
    selectedExamDate: new Date(2026, 5, 17),
    examEvents: examSessions.map((session) => ({
      id: `exam-${session.day}`,
      date: new Date(2026, 5, session.day),
      time: session.time,
      title: session.title,
      details: `${session.grades} · ${session.room}`,
      source: 'seeded'
    })),

    addingClassGradeId: null,
    editingClassKey: null,
    classDrafts: {},

    editingCurriculumRange: null,
    curriculumDraft: null
  };

  function loadSharedAcademicEvents() {
    try {
      const stored = localStorage.getItem('lecole_shared_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.filter(e => e.category === 'Academic').map(e => ({
          ...e,
          date: new Date(e.date)
        }));
      }
    } catch (e) { }
    return [];
  }
  loadSharedAcademicEvents().forEach(ev => state.examEvents.push(ev));

  function cloneScores(scores) {
    const clone = {};
    Object.keys(scores).forEach((subject) => { clone[subject] = scores[subject].slice(); });
    return clone;
  }

  function buildInitialSubjectAssignments() {
    const assignments = {};
    // assignments maps className -> subject -> teacherName
    staffAssignments.forEach(teacher => {
      if (teacher.subject && teacher.subject !== 'Subject allocation pending') {
        teacher.subjectClasses.forEach(className => {
          if (!assignments[className]) assignments[className] = {};
          assignments[className][teacher.subject] = teacher.name;
        });
      }
    });
    return assignments;
  }

  /* =======================================================================
     2. DATE HELPERS
     ======================================================================= */

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const MIN_CALENDAR_YEAR = 1980;
  const MAX_CALENDAR_YEAR = 2080;

  function sameCalendarDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function daysInMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); }
  function formatMonthYear(date) { return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`; }
  function formatLongDate(date) {
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${weekdayNames[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  function formatMonthDayYear(date) { return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`; }
  function formatMonthDay(date) { return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`; }

  /** Moves the selected day to a new month while clamping to the last valid day. */
  function changeCalendarView(currentSelectedDate, nextViewDate) {
    const normalized = startOfMonth(nextViewDate);
    const lastDay = daysInMonth(normalized);
    return new Date(normalized.getFullYear(), normalized.getMonth(), Math.min(currentSelectedDate.getDate(), lastDay));
  }

  function numberWithCommas(value) { return Number(value).toLocaleString(); }
  function isNonNegativeWholeNumber(value) { return /^\d+$/.test(value); }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }



  /* =======================================================================
     4. GENERIC CUSTOM-SELECT WIDGET
     -------------------------------------------------------------------------
     Reused for the grade/subject performance filters (light "sky" tone) and
     the exam calendar's month/year pickers (dark tone). One implementation,
     driven entirely by the options/getValue/onChoose it's given.
     ======================================================================= */

  const activeSelectRoots = [];

  function buildSelect(rootId, options, currentValueGetter, onChoose) {
    const root = document.getElementById(rootId);
    const trigger = root.querySelector('.c-select__trigger');
    const valueLabel = root.querySelector('.j-select-value');
    const menu = root.querySelector('.c-select__menu');

    function renderMenu() {
      const currentValue = currentValueGetter();
      menu.innerHTML = options.map((opt) => `
        <button type="button" class="c-select__option ${opt.value === currentValue ? 'c-is-selected' : ''}" data-value="${escapeHtml(opt.value)}" role="option">
          <span>${escapeHtml(opt.label)}</span>
          ${opt.value === currentValue ? '<svg class="c-icon c-select__option-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
        </button>`).join('');
      menu.querySelectorAll('.c-select__option').forEach((optionBtn) => {
        optionBtn.addEventListener('click', () => {
          onChoose(optionBtn.dataset.value);
          closeMenu();
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
      const menuWidth = Math.min(Math.max(rect.width, 0), window.innerWidth - viewportPadding * 2);
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
    root.__refreshLabel = () => { valueLabel.textContent = (options.find((o) => o.value === currentValueGetter()) || {}).label || ''; };
    activeSelectRoots.push(root);
    return root;
  }

  function closeAllSelects() {
    activeSelectRoots.forEach((root) => root.__closeSelect && root.__closeSelect());
  }

  document.addEventListener('mousedown', (event) => {
    activeSelectRoots.forEach((root) => { if (!root.contains(event.target)) root.__closeSelect(); });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllSelects();
  });

  /* =======================================================================
     5. CLASS-SECTION PERFORMANCE BAR CHART
     -------------------------------------------------------------------------
     Rebuilt whenever the grade or subject filter changes — the chart's two
     series (class average / highest average) are genuinely computed from
     the selection, so this is one of the few places static markup can't
     do the job.
     ======================================================================= */

  function getSelectedGrade() {
    return state.grades.find((g) => g.id === state.selectedGradeId) || state.grades[0];
  }

  function getPerformanceSubjects() {
    const set = new Set(initialSubjects);
    state.grades.forEach((grade) => Object.keys(grade.subjectScores).forEach((s) => set.add(s)));
    return Array.from(set);
  }

  function getClassPerformance() {
    const grade = getSelectedGrade();
    const scores = grade.subjectScores[state.selectedSubject] || [];
    const termOffset = state.selectedTerm === 'Term 2' ? 3 : (state.selectedTerm === 'Term 3' ? 6 : 0);
    const classAverage = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
    return grade.classes.map((section, index) => {
      let average = scores[index] != null ? scores[index] : classAverage;
      average = Math.min(100, average + termOffset);
      return { section, average, highest: Math.min(100, average + 13) };
    });
  }

  function renderPerfChart() {
    const svg = document.getElementById('j-perf-chart-svg');
    const width = 600, height = 340;
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    const data = getClassPerformance();
    const plotLeft = 40, plotRight = width - 20, plotTop = 20, plotBottom = 300;
    const plotHeight = plotBottom - plotTop;
    const niceMax = 100;
    const gridSteps = [0, 20, 40, 60, 80, 100];

    let svgMarkup = '';
    // Axis lines and titles
    svgMarkup += `<line x1="40" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" stroke="rgba(140, 125, 115, 0.6)" stroke-width="2"/>`;
    svgMarkup += `<line x1="40" y1="${plotTop}" x2="40" y2="${plotBottom}" stroke="rgba(140, 125, 115, 0.6)" stroke-width="2"/>`;
    svgMarkup += `<text class="c-perf-chart__axis-name" x="${width / 2}" y="${plotBottom + 35}" font-size="12" font-weight="600" letter-spacing="0.05em" fill="var(--moss, #4B5B34)" text-anchor="middle">CLASS SECTION</text>`;

    gridSteps.forEach((step) => {
      const y = plotBottom - (step / niceMax) * plotHeight;
      svgMarkup += `<text class="c-perf-chart__axis-label" x="${plotLeft - 8}" y="${y + 4}" font-size="12" font-weight="500" fill="#8C7D73" text-anchor="end">${step}</text>`;
    });

    const groupCount = Math.max(data.length, 1);
    const groupWidth = (plotRight - plotLeft) / groupCount;
    const barWidth = 20; // Increased spacing/height of columns

    data.forEach((row, index) => {
      const groupX = plotLeft + index * groupWidth;
      const averageX = groupX + groupWidth / 2 - barWidth - 4;
      const highestX = groupX + groupWidth / 2 + 4;
      const averageY = plotBottom - (row.average / niceMax) * plotHeight;
      const highestY = plotBottom - (row.highest / niceMax) * plotHeight;
      const averageHeight = plotBottom - averageY;
      const highestHeight = plotBottom - highestY;
      const delay = index * 45;

      svgMarkup += `<g class="j-perf-bar-group" data-section="${escapeHtml(row.section)}" data-average="${row.average}" data-highest="${row.highest}">`;
      svgMarkup += `<rect class="c-perf-chart__bar c-perf-chart__bar--average j-perf-bar" x="${averageX.toFixed(1)}" y="${averageY.toFixed(1)}" width="${barWidth}" height="${averageHeight.toFixed(1)}" rx="3" style="animation-delay:${delay}ms"/>`;
      svgMarkup += `<rect class="c-perf-chart__bar c-perf-chart__bar--highest j-perf-bar" x="${highestX.toFixed(1)}" y="${highestY.toFixed(1)}" width="${barWidth}" height="${highestHeight.toFixed(1)}" rx="3" style="animation-delay:${delay}ms"/>`;
      svgMarkup += `<text class="c-perf-chart__axis-label" x="${(groupX + groupWidth / 2).toFixed(1)}" y="${plotBottom + 16}" font-size="11" fill="#8C7D73" text-anchor="middle">${escapeHtml(row.section)}</text>`;
      svgMarkup += `</g>`;
    });

    svg.innerHTML = svgMarkup;

    svg.querySelectorAll('.j-perf-bar').forEach((bar) => {
      bar.addEventListener('mousemove', (event) => {
        const group = bar.closest('.j-perf-bar-group');
        const { section, average, highest } = group.dataset;
        const html = `
          <p class="c-chart-tooltip__label">${escapeHtml(section)}</p>
          <p class="c-chart-tooltip__row c-chart-tooltip__row--average">Class average : ${average}%</p>
          <p class="c-chart-tooltip__row c-chart-tooltip__row--highest">Highest average : ${highest}%</p>`;
        showTooltip(event.clientX, event.clientY, html);
      });
      bar.addEventListener('mouseleave', () => {
        hideTooltip();
      });
    });
  }

  function initPerformanceFilters() {
    buildSelect(
      'j-select-perf-grade',
      state.grades.map((g) => ({ label: g.name, value: g.id })),
      () => state.selectedGradeId,
      (value) => {
        state.selectedGradeId = value;
        document.querySelector('#j-select-perf-grade .j-select-value').textContent = state.grades.find((g) => g.id === value).name;
        renderPerfChart();
      }
    );
    buildSelect(
      'j-select-perf-subject',
      getPerformanceSubjects().map((s) => ({ label: s, value: s })),
      () => state.selectedSubject,
      (value) => {
        state.selectedSubject = value;
        document.querySelector('#j-select-perf-subject .j-select-value').textContent = value;
        renderPerfChart();
      }
    );
    buildSelect(
      'j-select-perf-term',
      ['Term 1', 'Term 2', 'Term 3'].map((t) => ({ label: t, value: t })),
      () => state.selectedTerm,
      (value) => {
        state.selectedTerm = value;
        document.querySelector('#j-select-perf-term .j-select-value').textContent = value;
        renderPerfChart();
      }
    );
  }

  function refreshPerformanceFilters() {
    // grade select options can grow when a new grade is created
    const gradeRoot = document.getElementById('j-select-perf-grade');
    gradeRoot.__closeSelect();
    const subjectRoot = document.getElementById('j-select-perf-subject');
    subjectRoot.__closeSelect();
    const termRoot = document.getElementById('j-select-perf-term');
    termRoot.__closeSelect();
    const gradeIndex = activeSelectRoots.indexOf(gradeRoot);
    if (gradeIndex !== -1) activeSelectRoots.splice(gradeIndex, 1);
    const subjectIndex = activeSelectRoots.indexOf(subjectRoot);
    if (subjectIndex !== -1) activeSelectRoots.splice(subjectIndex, 1);
    const termIndex = activeSelectRoots.indexOf(termRoot);
    if (termIndex !== -1) activeSelectRoots.splice(termIndex, 1);
    initPerformanceFilters();
  }

  /* =======================================================================
     6. TERM 2 EXAM CALENDAR
     ======================================================================= */

  function getExamEventsOnDate(date) {
    return state.examEvents.filter((event) => sameCalendarDay(event.date, date));
  }

  function renderExamWeekdays() {
    document.getElementById('j-exam-calendar-weekdays').innerHTML =
      WEEKDAY_LABELS.map((day) => `<span class="c-calendar__weekday">${day}</span>`).join('');
  }

  function renderExamCalendarGrid() {
    const daysEl = document.getElementById('j-exam-calendar-days');
    const monthStart = startOfMonth(state.examViewDate);
    const weekStartsOn = 1;
    const leadingBlanks = (monthStart.getDay() - weekStartsOn + 7) % 7;
    const totalDays = daysInMonth(state.examViewDate);
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
      const eventCount = getExamEventsOnDate(date).length;
      const hasEvents = eventCount > 0;
      const isSelected = sameCalendarDay(state.selectedExamDate, date);
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
      if (hasEvents && !isSelected) btn.innerHTML += '<span class="c-calendar__day-dot" aria-hidden="true"></span>';
      btn.addEventListener('click', () => {
        state.selectedExamDate = date;
        renderExamCalendarGrid();
        renderExamSessionsList();
      });
      daysEl.appendChild(btn);
    });
  }

  function renderExamSessionsList() {
    const countEl = document.getElementById('j-exam-calendar-event-count');
    const sessionsEl = document.getElementById('j-exam-calendar-sessions');
    const dayEvents = getExamEventsOnDate(state.selectedExamDate);

    countEl.textContent = dayEvents.length === 1 ? '1 event scheduled' : `${dayEvents.length} events scheduled`;

    if (dayEvents.length) {
      const recentEvent = dayEvents[dayEvents.length - 1];

      sessionsEl.innerHTML = `
        <div class="c-calendar__day-events">
          <article class="c-day-event-card" style="position: relative;">
            <p class="c-day-event-card__eyebrow">${formatMonthDay(state.selectedExamDate)} · ${escapeHtml(recentEvent.time)}</p>
            <h3 class="c-day-event-card__title">${escapeHtml(recentEvent.title)}</h3>
            <p class="c-day-event-card__details">${escapeHtml(recentEvent.details)}</p>
            <div style="position: absolute; right: 12px; top: 12px; display: flex; gap: 8px; align-items: center;">
              <button type="button" class="j-edit-event-btn" data-event-id="${recentEvent.id}" aria-label="Edit event" style="background: none; border: none; cursor: pointer; color: white; padding: 4px;">
                <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6.5a1.5 1.5 0 0 0-3-3l-9.9 9.9a2 2 0 0 0-.5.83l-.9 3.02c-.1.34.23.67.57.57l3.02-.9a2 2 0 0 0 .83-.5z"/></svg>
              </button>
              <button type="button" class="j-delete-event-btn" data-event-id="${recentEvent.id}" aria-label="Delete event" style="background: none; border: none; cursor: pointer; color: #ff8888; padding: 4px;">
                <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </article>
          <button type="button" class="j-open-event-editor-btn" style="width: 100%; border: 1px dashed rgba(255, 255, 255, 0.6); border-radius: 8px; background: rgba(255, 255, 255, 0.1); padding: 0.875rem 1rem; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem;" onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
            <span style="color: #EA8913; font-weight: 600; font-size: 0.875rem;">Add event</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA8913" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>`;

      const editBtn = sessionsEl.querySelector('.j-edit-event-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          const ev = state.examEvents.find(e => e.id === editBtn.dataset.eventId);
          if (ev) openExamEditorModal(ev);
        });
      }

      const deleteBtn = sessionsEl.querySelector('.j-delete-event-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          const ev = state.examEvents.find(e => e.id === deleteBtn.dataset.eventId);
          if (ev) {
            showConfirmDeleteModal({
              title: 'Delete event?',
              description: `This will remove the exam event "${ev.title}" from the schedule.`,
              buttonText: 'Delete event',
              onConfirm: () => {
                state.examEvents = state.examEvents.filter(e => e.id !== ev.id);
                try {
                  localStorage.setItem('lecole_shared_events', JSON.stringify(state.examEvents.filter(e => e.source !== 'examination')));
                } catch (err) {}
                refreshExamCalendar();
              }
            });
          }
        });
      }

      sessionsEl.querySelector('.j-open-event-editor-btn')?.addEventListener('click', () => {
        openExamEditorModal(null);
      });
    } else {
      sessionsEl.innerHTML = `
        <div class="c-calendar__empty-day">
          <button type="button" class="j-open-event-editor-btn" style="width: 100%; border: 1px dashed rgba(255, 255, 255, 0.6); border-radius: 8px; background: rgba(255, 255, 255, 0.1); padding: 0.875rem 1rem; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
            <span style="color: #EA8913; font-weight: 600; font-size: 0.875rem;">Add event</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA8913" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>`;
      sessionsEl.querySelector('.j-open-event-editor-btn')?.addEventListener('click', () => {
        openExamEditorModal(null);
      });
    }
  }

  function renderExamCalendarHeader() {
    document.querySelector('#j-select-exam-month .j-select-value').textContent = MONTH_NAMES[state.examViewDate.getMonth()];
    document.querySelector('#j-select-exam-year .j-select-value').textContent = String(state.examViewDate.getFullYear());
    document.getElementById('j-exam-calendar-prev').disabled = state.examViewDate.getFullYear() === MIN_CALENDAR_YEAR && state.examViewDate.getMonth() === 0;
    document.getElementById('j-exam-calendar-next').disabled = state.examViewDate.getFullYear() === MAX_CALENDAR_YEAR && state.examViewDate.getMonth() === 11;
  }

  function refreshExamCalendar() {
    renderExamCalendarHeader();
    renderExamCalendarGrid();
    renderExamSessionsList();
  }

  function updateExamCalendarView(nextViewDate) {
    state.examViewDate = startOfMonth(nextViewDate);
    state.selectedExamDate = changeCalendarView(state.selectedExamDate, nextViewDate);
    refreshExamCalendar();
  }

  function initExamCalendarNav() {
    document.getElementById('j-exam-calendar-prev').addEventListener('click', () => {
      updateExamCalendarView(new Date(state.examViewDate.getFullYear(), state.examViewDate.getMonth() - 1, 1));
    });
    document.getElementById('j-exam-calendar-next').addEventListener('click', () => {
      updateExamCalendarView(new Date(state.examViewDate.getFullYear(), state.examViewDate.getMonth() + 1, 1));
    });

    buildSelect(
      'j-select-exam-month',
      MONTH_NAMES.map((name, index) => ({ label: name, value: String(index) })),
      () => String(state.examViewDate.getMonth()),
      (value) => updateExamCalendarView(new Date(state.examViewDate.getFullYear(), Number(value), 1))
    );
    buildSelect(
      'j-select-exam-year',
      Array.from({ length: MAX_CALENDAR_YEAR - MIN_CALENDAR_YEAR + 1 }, (_, i) => ({ label: String(MIN_CALENDAR_YEAR + i), value: String(MIN_CALENDAR_YEAR + i) })),
      () => String(state.examViewDate.getFullYear()),
      (value) => updateExamCalendarView(new Date(Number(value), state.examViewDate.getMonth(), 1))
    );
  }

  /* =======================================================================
     7. MODAL — ADD / EDIT EXAM CALENDAR EVENT
     ======================================================================= */

  const examEditorEls = {
    layer: document.getElementById('j-modal-exam-editor'),
    monthLabel: document.getElementById('j-exam-editor-month'),
    title: document.getElementById('j-exam-editor-title'),
    form: document.getElementById('j-exam-event-form'),
    errorBanner: document.getElementById('j-exam-event-error-banner'),
    categoryField: document.getElementById('j-exam-field-category'),
    extracurricularWrap: document.getElementById('j-exam-field-extracurricular-wrap'),
    extracurricularTarget: document.getElementById('j-exam-field-extracurricular-target'),
    audienceSelectTrigger: document.getElementById('j-exam-audience-trigger'),
    audienceSelectMenu: document.getElementById('j-exam-audience-menu'),
    audienceOptions: document.querySelectorAll('.j-exam-audience-option'),
    audiencePlaceholder: document.getElementById('j-exam-audience-placeholder'),
    timeField: document.getElementById('j-exam-field-time'),
    timeError: document.getElementById('j-exam-field-time-error'),
    titleField: document.getElementById('j-exam-field-title'),
    titleError: document.getElementById('j-exam-field-title-error'),
    detailsField: document.getElementById('j-exam-field-details'),
    detailsError: document.getElementById('j-exam-field-details-error'),
    submitLabel: document.getElementById('j-exam-submit-label')
  };

  let selectedExamAudiences = [];

  function renderExamAudienceChips() {
    examEditorEls.audienceSelectTrigger.innerHTML = '';
    if (selectedExamAudiences.length === 0) {
      examEditorEls.audienceSelectTrigger.innerHTML = '<span style="color: var(--midnight); opacity: 0.5; font-size: 0.875rem; padding: 4px;" id="j-exam-audience-placeholder">Select audiences...</span>';
    } else {
      selectedExamAudiences.forEach(aud => {
        const chip = document.createElement('span');
        chip.style.cssText = 'background: rgba(127, 199, 204, 0.2); color: var(--midnight); font-size: 0.75rem; font-weight: 500; padding: 2px 8px; border-radius: var(--radius-full); display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--sky-blue);';
        chip.innerHTML = `${aud} <span class="j-exam-remove-audience" data-val="${aud}" style="cursor: pointer; opacity: 0.6;">&times;</span>`;
        examEditorEls.audienceSelectTrigger.appendChild(chip);
      });
    }

    examEditorEls.audienceOptions.forEach(opt => {
      const val = opt.dataset.val;
      const check = opt.querySelector('.j-exam-audience-check');
      if (selectedExamAudiences.includes(val)) {
        opt.style.background = 'var(--cream)';
        check.style.display = 'block';
      } else {
        opt.style.background = 'transparent';
        check.style.display = 'none';
      }
    });
  }

  function openExamEditorModal(eventToEdit) {
    examEditorEls.monthLabel.textContent = `${formatMonthYear(state.examViewDate)} exam calendar`;

    if (eventToEdit && eventToEdit.id) {
      examEditorEls.form.dataset.eventId = eventToEdit.id;
      examEditorEls.timeField.value = eventToEdit.time || '';
      examEditorEls.titleField.value = eventToEdit.title || '';
      examEditorEls.detailsField.value = eventToEdit.details || '';
      examEditorEls.categoryField.value = eventToEdit.category || 'Academic';
      if (examEditorEls.categoryField.value === 'Extracurricular') {
        examEditorEls.extracurricularWrap.style.display = 'block';
        examEditorEls.extracurricularTarget.value = eventToEdit.extracurricularTarget || '';
      } else {
        examEditorEls.extracurricularWrap.style.display = 'none';
        examEditorEls.extracurricularTarget.value = '';
      }
      selectedExamAudiences = eventToEdit.audiences || ['Students', 'Teachers', 'Parents', 'Management'];
      renderExamAudienceChips();
      examEditorEls.title.textContent = 'Edit event';
      examEditorEls.submitLabel.textContent = 'Save changes';
    } else {
      delete examEditorEls.form.dataset.eventId;
      examEditorEls.timeField.value = '';
      examEditorEls.titleField.value = '';
      examEditorEls.detailsField.value = '';
      examEditorEls.categoryField.value = 'Academic';
      examEditorEls.extracurricularWrap.style.display = 'none';
      examEditorEls.extracurricularTarget.value = '';
      selectedExamAudiences = ['Students', 'Teachers', 'Parents', 'Management'];
      renderExamAudienceChips();
      examEditorEls.title.textContent = 'Add an event';
      examEditorEls.submitLabel.textContent = 'Save event';
    }

    clearExamEventFormErrors();

    openModal(examEditorEls.layer);
    window.setTimeout(() => examEditorEls.titleField.focus(), 50);
  }

  function clearExamEventFormErrors() {
    examEditorEls.errorBanner.classList.remove('c-is-visible');
    [examEditorEls.timeError, examEditorEls.titleError, examEditorEls.detailsError].forEach((el) => el.classList.remove('c-is-visible'));
    [examEditorEls.timeField, examEditorEls.titleField, examEditorEls.detailsField].forEach((el) => el.removeAttribute('aria-invalid'));
  }

  function initExamEventEditor() {
    const openBtn = document.getElementById('j-open-exam-editor');
    if (openBtn) openBtn.addEventListener('click', () => openExamEditorModal());

    [examEditorEls.timeField, examEditorEls.titleField, examEditorEls.detailsField].forEach((field) => {
      field.addEventListener('input', clearExamEventFormErrors);
    });

    examEditorEls.categoryField.addEventListener('change', (e) => {
      if (e.target.value === 'Extracurricular') {
        examEditorEls.extracurricularWrap.style.display = 'block';
      } else {
        examEditorEls.extracurricularWrap.style.display = 'none';
        examEditorEls.extracurricularTarget.value = '';
      }
    });

    examEditorEls.audienceSelectTrigger.addEventListener('click', (e) => {
      if (e.target.closest('.j-exam-remove-audience')) {
        e.stopPropagation();
        const val = e.target.closest('.j-exam-remove-audience').dataset.val;
        selectedExamAudiences = selectedExamAudiences.filter(a => a !== val);
        renderExamAudienceChips();
        return;
      }
      const isVisible = examEditorEls.audienceSelectMenu.style.display === 'block';
      examEditorEls.audienceSelectMenu.style.display = isVisible ? 'none' : 'block';
    });

    examEditorEls.audienceOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.dataset.val;
        if (selectedExamAudiences.includes(val)) {
          selectedExamAudiences = selectedExamAudiences.filter(a => a !== val);
        } else {
          selectedExamAudiences.push(val);
        }
        renderExamAudienceChips();
      });
    });

    document.addEventListener('mousedown', (e) => {
      if (!examEditorEls.audienceSelectMenu.contains(e.target) && !examEditorEls.audienceSelectTrigger.contains(e.target)) {
        examEditorEls.audienceSelectMenu.style.display = 'none';
      }
    });

    examEditorEls.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const selectedDay = state.selectedExamDate.getDate();
      const time = examEditorEls.timeField.value.trim();
      const title = examEditorEls.titleField.value.trim();
      const details = examEditorEls.detailsField.value.trim();
      const category = examEditorEls.categoryField.value;
      const extracurricularTarget = examEditorEls.extracurricularTarget.value;

      let hasError = false;
      clearExamEventFormErrors();
      if (!title) { examEditorEls.titleError.classList.add('c-is-visible'); examEditorEls.titleField.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (!time) { examEditorEls.timeError.classList.add('c-is-visible'); examEditorEls.timeField.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (!details) { examEditorEls.detailsError.classList.add('c-is-visible'); examEditorEls.detailsField.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (hasError) { examEditorEls.errorBanner.classList.add('c-is-visible'); return; }

      const newDate = new Date(state.examViewDate.getFullYear(), state.examViewDate.getMonth(), selectedDay);

      const existingId = examEditorEls.form.dataset.eventId;
      if (existingId) {
        const ev = state.examEvents.find(e => e.id === existingId);
        if (ev) {
          ev.time = time;
          ev.title = title;
          ev.details = details;
          ev.category = category;
          ev.extracurricularTarget = extracurricularTarget;
          ev.audiences = selectedExamAudiences;
        }
      } else {
        state.examEvents.push({
          id: `academic-event-${Date.now()}`,
          date: newDate,
          time,
          title,
          details,
          category,
          extracurricularTarget,
          audiences: selectedExamAudiences,
          source: 'session'
        });
      }

      state.selectedExamDate = newDate;
      refreshExamCalendar();
      closeModal(examEditorEls.layer);
    });
  }

  /* =======================================================================
     8. MODAL — FULL DAY SCHEDULE ("View all")
     ======================================================================= */

  const dayScheduleEls = {
    layer: document.getElementById('j-modal-exam-day-schedule'),
    title: document.getElementById('j-exam-day-schedule-title'),
    description: document.getElementById('j-exam-day-schedule-description'),
    body: document.getElementById('j-exam-day-schedule-body')
  };

  function openExamDayScheduleModal() {
    const dayEvents = getExamEventsOnDate(state.selectedExamDate);
    dayScheduleEls.title.textContent = formatLongDate(state.selectedExamDate);
    dayScheduleEls.description.textContent = dayEvents.length === 1 ? '1 event is scheduled for this day.' : `${dayEvents.length} events are scheduled for this day.`;

    if (dayEvents.length) {
      dayScheduleEls.body.innerHTML = `<ol class="c-day-schedule__list">${dayEvents.map((event, index) => `
        <li class="c-day-schedule__item" style="animation-delay:${index * 35}ms">
          <div class="c-day-schedule__item-top">
            <div>
              <p class="c-day-schedule__time">
                <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${escapeHtml(event.time)}
              </p>
              <h3 class="c-day-schedule__title">${escapeHtml(event.title)}</h3>
            </div>
          </div>
          <p class="c-day-schedule__details">
            <svg class="c-icon c-day-schedule__details-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(event.details)}</span>
          </p>
        </li>`).join('')}</ol>`;
    } else {
      dayScheduleEls.body.innerHTML = `
        <div class="c-day-schedule__empty">
          <span class="c-day-schedule__empty-icon" aria-hidden="true">
            <svg class="c-icon" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          </span>
          <h3 class="c-day-schedule__empty-title">No events scheduled</h3>
          <p class="c-day-schedule__empty-text">${formatLongDate(state.selectedExamDate)} is clear. Add an event from this calendar when plans are confirmed.</p>
        </div>`;
    }

    openModal(dayScheduleEls.layer, dayScheduleEls.layer.querySelector('.c-modal'));
  }

  function initExamDaySchedule() {
    document.getElementById('j-open-exam-day-schedule').addEventListener('click', openExamDayScheduleModal);
  }

  /* =======================================================================
     9. GRADE & CLASS STRUCTURE
     ======================================================================= */

  function getClassBadgeTone(className) {
    const suffix = (className.split('-').pop() || '').toUpperCase();
    const tones = { A: 'c-tone-a', B: 'c-tone-b', C: 'c-tone-c', D: 'c-tone-d', E: 'c-tone-e', ART: 'c-tone-e', SCI: 'c-tone-a', COM: 'c-tone-b' };
    return tones[suffix] || 'c-tone-default';
  }

  function getSubjectBadgeTone(subject) {
    let total = 0;
    for (let i = 0; i < subject.length; i += 1) total += subject.charCodeAt(i);
    return `c-subject-tone-${total % 5}`;
  }

  function getClassDraftKey(gradeId, className) { return `${gradeId}:${className}`; }

  function getClassEnrollment(className) { return state.classEnrollments[className] || 0; }
  function getGradeEnrollment(classNames) { return classNames.reduce((total, c) => total + getClassEnrollment(c), 0); }
  function getSuggestedClassEnrollment(classNames) {
    const total = getGradeEnrollment(classNames);
    return classNames.length ? Math.round(total / classNames.length) : 30;
  }
  function saveClassEnrollmentRecord(gradeId, previousClassName, className, studentCount) {
    if (!Number.isInteger(studentCount) || studentCount < 0) return;
    if (previousClassName && previousClassName !== className) delete state.classEnrollments[previousClassName];
    state.classEnrollments[className] = studentCount;
    const grade = state.enrollmentGrades.find((g) => g.id === gradeId);
    if (grade) {
      if (previousClassName) {
        grade.classNames = grade.classNames.map((c) => (c === previousClassName ? className : c));
      } else if (!grade.classNames.includes(className)) {
        grade.classNames.push(className);
      }
    }
  }
  function addEnrollmentGradeRecord(grade) {
    state.enrollmentGrades.push({ id: grade.id, name: grade.name, classNames: grade.classNames.slice() });
  }

  function renderGradeGrid() {
    const container = document.getElementById('j-grade-grid');
    container.innerHTML = state.grades.map((grade, index) => renderGradeCard(grade, index)).join('');
    wireGradeGrid();
  }

  function renderGradeCard(grade, index) {
    const previewPlacement = index % 2 === 1 ? 'left' : 'right';
    const newDraftKey = getClassDraftKey(grade.id, 'new');
    const newDraft = state.classDrafts[newDraftKey];

    const gradeNum = parseInt(grade.name.replace(/\D/g, ''), 10);
    let subjects = [];
    if (gradeNum >= 6 && gradeNum <= 9) {
      subjects = state.curriculumGroups.find(g => g.range === 'Years 6–9')?.subjects || [];
    } else if (gradeNum >= 10 && gradeNum <= 11) {
      subjects = state.curriculumGroups.find(g => g.range === 'Years 10–11')?.subjects || [];
    }

    const rows = grade.classes.map((className) => {
      const draftKey = getClassDraftKey(grade.id, className);
      const draft = state.classDrafts[draftKey];
      const isEditing = state.editingClassKey === draftKey && draft;
      if (isEditing) {
        return renderInlineClassEditor({ mode: 'edit', gradeId: grade.id, className, draft, draftKey, previewPlacement });
      }

      return `
        <details class="c-class-details">
          <summary class="c-class-row" data-class-name="${escapeHtml(className)}">
            <span class="c-class-row__badge ${getClassBadgeTone(className)}">${escapeHtml(className)}</span>
            <div style="display:flex; align-items:center; gap:0.5rem; min-width:0;">
              <div>
                <p class="c-class-row__teacher-label">Class teacher</p>
                <p class="c-class-row__teacher-name">${escapeHtml(state.classTeachers[className] || 'Assignment pending')}</p>
              </div>
              <button type="button" class="c-class-row__edit-btn j-edit-class-btn" data-grade-id="${grade.id}" data-class-name="${escapeHtml(className)}" aria-label="Edit ${escapeHtml(className)}" style="margin-left:0.25rem;">
                <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6.5a1.5 1.5 0 0 0-3-3l-9.9 9.9a2 2 0 0 0-.5.83l-.9 3.02c-.1.34.23.67.57.57l3.02-.9a2 2 0 0 0 .83-.5z"/></svg>
              </button>
            </div>
            <div style="margin-left:auto; display:flex; align-items:center; gap:0.375rem; color: rgba(15, 65, 74, 0.7); font-size: 0.8125rem; font-weight: 600;">
              <span>Subject teachers</span>
              <div class="c-class-row__expand-icon" style="display:flex; align-items:center;">
                <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </summary>
          <div class="c-class-subjects">
            <h4 class="c-class-subjects__title">Subject Assignments</h4>
            <div class="c-class-subjects__list">
              ${subjects.map(subject => {
        const assignedTeacher = (state.subjectAssignments[className] || {})[subject] || '';
        return `
                  <div class="c-subject-assignment-row">
                    <div class="c-subject-assignment-row__name">${escapeHtml(subject)}</div>
                    <div class="c-teacher-field j-subject-teacher-field" data-preview-placement="${previewPlacement}" data-class-name="${escapeHtml(className)}" data-subject="${escapeHtml(subject)}">
                      <div style="position:relative">
                        <button type="button" class="c-teacher-field__trigger j-subject-teacher-trigger" aria-haspopup="listbox" aria-expanded="false">
                          <span class="c-teacher-field__trigger-value j-subject-teacher-trigger-value ${assignedTeacher ? '' : 'c-is-placeholder'}">${escapeHtml(assignedTeacher || 'Assignment pending')}</span>
                          <svg class="c-icon c-teacher-field__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div class="c-teacher-field__popover j-subject-teacher-popover"></div>
                      </div>
                    </div>
                  </div>
                `;
      }).join('')}
            </div>
          </div>
        </details>`;
    }).join('') + (state.addingClassGradeId === grade.id && newDraft
      ? renderInlineClassEditor({ mode: 'add', gradeId: grade.id, className: `${grade.id}-new`, draft: newDraft, draftKey: newDraftKey, previewPlacement })
      : '');

    return `
      <article class="c-grade-card" data-grade-id="${grade.id}">
        <div class="c-grade-card__head">
          <div>
            <h3 class="c-grade-card__name">${escapeHtml(grade.name)}</h3>
            <p class="c-grade-card__meta">
              <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>
              ${numberWithCommas(getGradeEnrollment(grade.classes))} students · ${grade.classes.length} classes
            </p>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <button type="button" class="c-btn-add c-btn-add--small j-add-class-btn" data-grade-id="${grade.id}">
              <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add class
            </button>
            <button type="button" class="j-delete-grade-btn" data-grade-id="${grade.id}" aria-label="Delete grade" style="background:rgba(127,3,3,0.1); border:1px solid rgba(127,3,3,0.3); border-radius:var(--radius-lg); color:var(--maroon); padding:0.375rem 0.5rem; display:flex; align-items:center; gap:4px; font-size:0.75rem; font-weight:600; cursor:pointer;">
              <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              Delete
            </button>
          </div>
        </div>
        <div class="c-class-list">${rows}</div>
      </article>`;
  }

  function renderInlineClassEditor(opts) {
    const { mode, gradeId, className, draft, draftKey, previewPlacement } = opts;
    const hasValidStudentCount = isNonNegativeWholeNumber(draft.studentCount);
    const fieldPrefix = `j-class-editor-${draftKey.replace(/[^a-zA-Z0-9]/g, '-')}`;
    return `
      <form class="c-inline-editor j-inline-class-form" data-grade-id="${gradeId}" data-draft-key="${escapeHtml(draftKey)}" data-mode="${mode}">
        <div class="c-inline-editor__grid">
          <div>
            <label class="c-field-label-sm" for="${fieldPrefix}-section">Section name</label>
            <input class="c-input-sm j-class-name-input" id="${fieldPrefix}-section" placeholder="e.g. 6-E" value="${escapeHtml(draft.sectionName)}" />
          </div>
          <div>
            <label class="c-field-label-sm" for="${fieldPrefix}-students">Students</label>
            <input class="c-input-sm j-class-students-input ${hasValidStudentCount ? '' : 'c-is-invalid'}" id="${fieldPrefix}-students" inputmode="numeric" pattern="[0-9]*" value="${escapeHtml(draft.studentCount)}" />
            <p class="c-field-error-sm ${hasValidStudentCount ? '' : 'c-is-visible'}">Enter a non-negative whole number.</p>
          </div>
          <div class="c-teacher-field j-teacher-field" data-preview-placement="${previewPlacement}">
            <div class="c-teacher-field__head">
              <label class="c-field-label-sm" style="margin-bottom:0">Class teacher</label>
              <span class="c-teacher-field__hint">Hover a teacher to preview workload</span>
            </div>
            <div style="position:relative">
              <button type="button" class="c-teacher-field__trigger j-teacher-trigger" aria-haspopup="listbox" aria-expanded="false">
                <span class="c-teacher-field__trigger-value j-teacher-trigger-value ${draft.teacherName ? '' : 'c-is-placeholder'}">${escapeHtml(draft.teacherName || 'Assignment pending')}</span>
                <svg class="c-icon c-teacher-field__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div class="c-teacher-field__popover j-teacher-popover"></div>
            </div>
            <div class="j-teacher-summary"></div>
          </div>
          <div class="c-inline-editor__actions">
            <button type="submit" class="c-btn-save" ${(!draft.sectionName.trim() || !hasValidStudentCount) ? 'disabled' : ''}>
              <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Save
            </button>
            <button type="button" class="c-btn-cancel j-cancel-class-btn">
              <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              Cancel
            </button>
          </div>
        </div>
      </form>`;
  }

  function wireGradeGrid() {
    document.querySelectorAll('.j-add-class-btn').forEach((btn) => {
      btn.addEventListener('click', () => startAddingClass(btn.dataset.gradeId));
    });
    document.querySelectorAll('.j-delete-grade-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gradeId = btn.dataset.gradeId;
        const grade = state.grades.find(g => g.id === gradeId);
        if (grade) {
          openDeleteStructureModal(grade);
        }
      });
    });
    document.querySelectorAll('.j-edit-class-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startEditingClass(btn.dataset.gradeId, btn.dataset.className);
      });
    });
    document.querySelectorAll('.j-inline-class-form').forEach((form) => {
      const draftKey = form.dataset.draftKey;
      const gradeId = form.dataset.gradeId;
      const mode = form.dataset.mode;

      form.querySelector('.j-class-name-input').addEventListener('input', (e) => {
        setClassDraftField(draftKey, 'sectionName', e.target.value);
        refreshSaveButtonState(form, draftKey);
      });
      form.querySelector('.j-class-students-input').addEventListener('input', (e) => {
        setClassDraftField(draftKey, 'studentCount', e.target.value);
        const valid = isNonNegativeWholeNumber(e.target.value);
        e.target.classList.toggle('c-is-invalid', !valid);
        form.querySelector('.c-field-error-sm').classList.toggle('c-is-visible', !valid);
        refreshSaveButtonState(form, draftKey);
      });
      form.querySelector('.j-cancel-class-btn').addEventListener('click', () => cancelClassEdit(draftKey));
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const draft = state.classDrafts[draftKey];
        if (!draft || !draft.sectionName.trim() || !isNonNegativeWholeNumber(draft.studentCount)) return;
        if (mode === 'add') saveNewClass(gradeId); else saveEditedClass(gradeId, draftKey.split(':').slice(1).join(':'));
      });

      wireTeacherField(form.querySelector('.j-teacher-field'), draftKey);
    });

    document.querySelectorAll('.j-subject-teacher-field').forEach((field) => {
      wireSubjectTeacherField(field);
    });
  }

  function refreshSaveButtonState(form, draftKey) {
    const draft = state.classDrafts[draftKey];
    const valid = draft && draft.sectionName.trim() && isNonNegativeWholeNumber(draft.studentCount);
    form.querySelector('.c-btn-save').disabled = !valid;
  }

  function setClassDraftField(draftKey, field, value) {
    state.classDrafts[draftKey] = Object.assign({}, state.classDrafts[draftKey], { [field]: value });
  }

  function startAddingClass(gradeId) {
    const grade = state.grades.find((g) => g.id === gradeId);
    const draftKey = getClassDraftKey(gradeId, 'new');
    const gradeNumber = (grade.name.match(/\d+/) || [''])[0];
    state.addingClassGradeId = gradeId;
    state.editingClassKey = null;
    state.classDrafts[draftKey] = {
      sectionName: `${gradeNumber}-`,
      studentCount: String(getSuggestedClassEnrollment(grade.classes)),
      teacherName: ''
    };
    renderGradeGrid();
  }

  function startEditingClass(gradeId, className) {
    const draftKey = getClassDraftKey(gradeId, className);
    state.editingClassKey = draftKey;
    state.addingClassGradeId = null;
    state.classDrafts[draftKey] = {
      sectionName: className,
      studentCount: String(getClassEnrollment(className)),
      teacherName: state.classTeachers[className] || ''
    };
    renderGradeGrid();
  }

  function cancelClassEdit(draftKey) {
    delete state.classDrafts[draftKey];
    state.editingClassKey = null;
    state.addingClassGradeId = null;
    renderGradeGrid();
  }

  function saveNewClass(gradeId) {
    const draftKey = getClassDraftKey(gradeId, 'new');
    const draft = state.classDrafts[draftKey];
    const sectionName = draft.sectionName.trim();
    const grade = state.grades.find((g) => g.id === gradeId);
    if (!draft || !sectionName || !grade || grade.classes.includes(sectionName) || !isNonNegativeWholeNumber(draft.studentCount)) return;
    const studentCount = Number(draft.studentCount);

    grade.classes.push(sectionName);
    Object.keys(grade.subjectScores).forEach((subject) => {
      const scores = grade.subjectScores[subject];
      const classAverage = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 75;
      scores.push(classAverage);
    });
    if (draft.teacherName) state.classTeachers[sectionName] = draft.teacherName;

    saveClassEnrollmentRecord(gradeId, null, sectionName, studentCount);
    state.selectedGradeId = gradeId;
    cancelClassEdit(draftKey);
    refreshPerformanceFilters();
    renderPerfChart();
  }

  function saveEditedClass(gradeId, originalClassName) {
    const draftKey = getClassDraftKey(gradeId, originalClassName);
    const draft = state.classDrafts[draftKey];
    const sectionName = draft.sectionName.trim();
    if (!draft || !sectionName || !isNonNegativeWholeNumber(draft.studentCount)) return;
    const studentCount = Number(draft.studentCount);
    const grade = state.grades.find((g) => g.id === gradeId);
    if (!grade || (sectionName !== originalClassName && grade.classes.includes(sectionName))) return;

    grade.classes = grade.classes.map((c) => (c === originalClassName ? sectionName : c));
    delete state.classTeachers[originalClassName];
    if (draft.teacherName) state.classTeachers[sectionName] = draft.teacherName;

    saveClassEnrollmentRecord(gradeId, originalClassName, sectionName, studentCount);
    cancelClassEdit(draftKey);
    renderPerfChart();
  }

  /* =======================================================================
     10. TEACHER ASSIGNMENT FIELD
     -------------------------------------------------------------------------
     A dropdown of staff, ordered by availability, that shows a hover/focus
     workload preview panel and writes back into the owning class-editor
     draft. One field is wired per inline class editor instance.
     ======================================================================= */

  function getTeacherWorkload(teacher) {
    return {
      subject: teacher.subject || 'Subject pending',
      subjectClasses: teacher.subjectClasses,
      classTeacherClasses: Object.keys(state.classTeachers).filter((c) => state.classTeachers[c] === teacher.name),
      extracurriculars: teacher.extracurriculars
    };
  }

  function getAvailabilityRank(teacher) {
    const w = getTeacherWorkload(teacher);
    const hasSubj = w.subjectClasses.length > 0;
    const hasExtra = w.extracurriculars.length > 0;
    const hasClass = w.classTeacherClasses.length > 0;

    if (!hasSubj && !hasExtra && !hasClass) return 0; // Available
    if (hasSubj && !hasExtra && !hasClass) return 1; // Subject teaching only
    if (!hasSubj && hasExtra && !hasClass) return 2; // Activity commitment only
    if (hasSubj && hasExtra && hasClass) return 4; // Full
    return 3; // Assigned workload
  }

  function getAvailabilityLabel(teacher) {
    return ['Available', 'Subject teaching only', 'Activity commitment only', 'Assigned workload', 'Full'][getAvailabilityRank(teacher)];
  }

  function teacherInitials(name) {
    return name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  }

  function workloadTagsHtml(items, emptyText) {
    if (!items.length) return `<span class="c-workload-tag--empty">${emptyText || 'None'}</span>`;
    return items.map((item) => `<span class="c-workload-tag">${escapeHtml(item)}</span>`).join('');
  }

  function wireTeacherField(rootEl, draftKey) {
    const trigger = rootEl.querySelector('.j-teacher-trigger');
    const triggerValue = rootEl.querySelector('.j-teacher-trigger-value');
    const popover = rootEl.querySelector('.j-teacher-popover');
    const summaryEl = rootEl.querySelector('.j-teacher-summary');
    const placement = rootEl.dataset.previewPlacement;

    function currentValue() { return (state.classDrafts[draftKey] || {}).teacherName || ''; }

    function renderSummary() {
      const value = currentValue();
      const teacher = staffAssignments.find((t) => t.name === value);
      if (teacher) {
        const w = getTeacherWorkload(teacher);
        summaryEl.innerHTML = `
          <div class="c-teacher-summary">
            <div class="c-teacher-summary__head">
              <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sky-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              ${escapeHtml(teacher.name)} selected
            </div>
            <div class="c-teacher-summary__tags">
              <span class="c-teacher-summary-tag">Subject: ${escapeHtml(w.subject)}</span>
              <span class="c-teacher-summary-tag">Classes: ${escapeHtml(w.subjectClasses.join(', ') || 'None')}</span>
            </div>
          </div>`;
      } else {
        summaryEl.innerHTML = `<p class="c-teacher-field__empty-note">No teacher selected — the assignment can remain pending.</p>`;
      }
    }

    function renderPreview(teacher) {
      if (!teacher) { popover.querySelector('.j-workload-preview')?.classList.remove('c-is-visible'); return; }
      const w = getTeacherWorkload(teacher);
      let preview = popover.querySelector('.j-workload-preview');
      if (!preview) return;
      preview.innerHTML = `
        <div class="c-workload-preview__head">
          <span class="c-teacher-menu__initials c-teacher-menu__initials--lg">${escapeHtml(teacherInitials(teacher.name))}</span>
          <div style="min-width:0">
            <p class="c-workload-preview__name">${escapeHtml(teacher.name)}</p>
            <p class="c-workload-preview__sub">Workload preview</p>
          </div>
        </div>
        <div class="c-workload-preview__body">
          <section>
            <p class="c-workload-group__label"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>Subject taught</p>
            <div class="c-workload-group__tags">${workloadTagsHtml([w.subject])}</div>
          </section>
          <section>
            <p class="c-workload-group__label"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>Subject classes</p>
            <div class="c-workload-group__tags">${workloadTagsHtml(w.subjectClasses)}</div>
          </section>
          <section>
            <p class="c-workload-group__label"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>Class teacher</p>
            <div class="c-workload-group__tags">${workloadTagsHtml(w.classTeacherClasses)}</div>
          </section>
          <section>
            <p class="c-workload-group__label"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>Extracurriculars</p>
            <div class="c-workload-group__tags">${workloadTagsHtml(w.extracurriculars)}</div>
          </section>
        </div>`;
      preview.classList.add('c-is-visible');
      const rect = preview.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      if (rect.left < 260) {
        preview.classList.remove('c-workload-preview--left');
        preview.classList.add('c-workload-preview--right');
      } else if (rect.right > window.innerWidth - 20) {
        preview.classList.remove('c-workload-preview--right');
        preview.classList.add('c-workload-preview--left');
      }
    }

    function renderMenu() {
      const value = currentValue();
      const orderedStaff = staffAssignments
        .filter(t => t.name === value || getTeacherWorkload(t).classTeacherClasses.length === 0)
        .slice().sort((a, b) => {
          const diff = getAvailabilityRank(a) - getAvailabilityRank(b);
          return diff || a.name.localeCompare(b.name);
        });

      let html = `<ul class="c-teacher-menu" role="listbox">`;
      html += `
        <li role="option" aria-selected="${!value}">
          <button type="button" class="c-teacher-menu__option j-teacher-option ${!value ? 'c-is-selected' : ''}" data-teacher-name="">
            Assignment pending
            ${!value ? '<svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
          </button>
        </li>`;
      orderedStaff.forEach((teacher) => {
        const isSelected = teacher.name === value;
        html += `
          <li role="option" aria-selected="${isSelected}">
            <button type="button" class="c-teacher-menu__item j-teacher-option ${isSelected ? 'c-is-selected' : ''}" data-teacher-name="${escapeHtml(teacher.name)}" data-teacher-id="${teacher.id}">
              <span class="c-teacher-menu__initials">${escapeHtml(teacherInitials(teacher.name))}</span>
              <span class="c-teacher-menu__item-meta">
                <span class="c-teacher-menu__item-name">${escapeHtml(teacher.name)}</span>
                <span class="c-teacher-menu__item-status">${getAvailabilityLabel(teacher)}</span>
              </span>
              ${isSelected ? '<svg class="c-icon c-teacher-menu__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
            </button>
          </li>`;
      });
      html += `</ul><div class="c-workload-preview j-workload-preview c-workload-preview--${placement}"></div>`;
      popover.innerHTML = html;

      popover.querySelectorAll('.j-teacher-option').forEach((optBtn) => {
        optBtn.addEventListener('click', () => {
          setClassDraftField(draftKey, 'teacherName', optBtn.dataset.teacherName);
          closeMenu();
          triggerValue.textContent = optBtn.dataset.teacherName || 'Assignment pending';
          triggerValue.classList.toggle('c-is-placeholder', !optBtn.dataset.teacherName);
          renderSummary();
          const form = rootEl.closest('.j-inline-class-form');
          refreshSaveButtonState(form, draftKey);
        });
        optBtn.addEventListener('mouseenter', () => {
          const teacher = staffAssignments.find((t) => t.id === optBtn.dataset.teacherId);
          renderPreview(teacher || null);
        });
        optBtn.addEventListener('focus', () => {
          const teacher = staffAssignments.find((t) => t.id === optBtn.dataset.teacherId);
          renderPreview(teacher || null);
        });
      });
    }

    function openMenu() {
      renderMenu();
      rootEl.classList.add('c-is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      rootEl.classList.remove('c-is-open');
      trigger.setAttribute('aria-expanded', 'false');
      popover.innerHTML = '';
    }

    trigger.addEventListener('click', () => {
      rootEl.classList.contains('c-is-open') ? closeMenu() : openMenu();
    });
    document.addEventListener('mousedown', (event) => {
      if (rootEl.classList.contains('c-is-open') && !rootEl.contains(event.target)) closeMenu();
    });

    renderSummary();
  }

  function wireSubjectTeacherField(rootEl) {
    const trigger = rootEl.querySelector('.j-subject-teacher-trigger');
    const triggerValue = rootEl.querySelector('.j-subject-teacher-trigger-value');
    const popover = rootEl.querySelector('.j-subject-teacher-popover');
    const placement = rootEl.dataset.previewPlacement;
    const className = rootEl.dataset.className;
    const subjectName = rootEl.dataset.subject;

    function currentValue() {
      return (state.subjectAssignments[className] || {})[subjectName] || '';
    }

    function renderPreview(teacher) {
      if (!teacher) { popover.querySelector('.j-workload-preview')?.classList.remove('c-is-visible'); return; }
      const w = getTeacherWorkload(teacher);
      let preview = popover.querySelector('.j-workload-preview');
      if (!preview) return;
      preview.innerHTML = `
        <div class="c-workload-preview__head">
          <span class="c-teacher-menu__initials c-teacher-menu__initials--lg">${escapeHtml(teacherInitials(teacher.name))}</span>
          <div style="min-width:0">
            <p class="c-workload-preview__name">${escapeHtml(teacher.name)}</p>
            <p class="c-workload-preview__sub">Workload preview</p>
          </div>
        </div>
        <div class="c-workload-preview__body">
          <section>
            <p class="c-workload-group__label"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>Subject taught</p>
            <div class="c-workload-group__tags">${workloadTagsHtml([w.subject])}</div>
          </section>
          <section>
            <p class="c-workload-group__label"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>Subject classes</p>
            <div class="c-workload-group__tags">${workloadTagsHtml(w.subjectClasses)}</div>
          </section>
          <section>
            <p class="c-workload-group__label"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>Class teacher</p>
            <div class="c-workload-group__tags">${workloadTagsHtml(w.classTeacherClasses)}</div>
          </section>
          <section>
            <p class="c-workload-group__label"><svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>Extracurriculars</p>
            <div class="c-workload-group__tags">${workloadTagsHtml(w.extracurriculars)}</div>
          </section>
        </div>`;
      preview.classList.add('c-is-visible');
      const rect = preview.getBoundingClientRect();
      if (rect.left < 260) {
        preview.classList.remove('c-workload-preview--left');
        preview.classList.add('c-workload-preview--right');
      } else if (rect.right > window.innerWidth - 20) {
        preview.classList.remove('c-workload-preview--right');
        preview.classList.add('c-workload-preview--left');
      }
    }

    function renderMenu() {
      const value = currentValue();
      const orderedStaff = staffAssignments.slice().sort((a, b) => {
        const diff = getAvailabilityRank(a) - getAvailabilityRank(b);
        return diff || a.name.localeCompare(b.name);
      });

      let html = `<ul class="c-teacher-menu" role="listbox">`;
      html += `
        <li role="option" aria-selected="${!value}">
          <button type="button" class="c-teacher-menu__option j-teacher-option ${!value ? 'c-is-selected' : ''}" data-teacher-name="">
            Assignment pending
            ${!value ? '<svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
          </button>
        </li>`;
      orderedStaff.forEach((teacher) => {
        const isSelected = teacher.name === value;
        html += `
          <li role="option" aria-selected="${isSelected}">
            <button type="button" class="c-teacher-menu__item j-teacher-option ${isSelected ? 'c-is-selected' : ''}" data-teacher-name="${escapeHtml(teacher.name)}" data-teacher-id="${teacher.id}">
              <span class="c-teacher-menu__initials">${escapeHtml(teacherInitials(teacher.name))}</span>
              <span class="c-teacher-menu__item-meta">
                <span class="c-teacher-menu__item-name">${escapeHtml(teacher.name)}</span>
                <span class="c-teacher-menu__item-status">${getAvailabilityLabel(teacher)}</span>
              </span>
              ${isSelected ? '<svg class="c-icon c-teacher-menu__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
            </button>
          </li>`;
      });
      html += `</ul><div class="c-workload-preview j-workload-preview c-workload-preview--${placement}"></div>`;
      popover.innerHTML = html;

      popover.querySelectorAll('.j-teacher-option').forEach((optBtn) => {
        optBtn.addEventListener('click', () => {
          if (!state.subjectAssignments[className]) {
            state.subjectAssignments[className] = {};
          }
          state.subjectAssignments[className][subjectName] = optBtn.dataset.teacherName;

          closeMenu();
          triggerValue.textContent = optBtn.dataset.teacherName || 'Assignment pending';
          triggerValue.classList.toggle('c-is-placeholder', !optBtn.dataset.teacherName);

          const detailsEl = rootEl.closest('.c-class-details');
          if (detailsEl) {
            let missing = 0;
            detailsEl.querySelectorAll('.j-subject-teacher-trigger-value').forEach(span => {
              if (span.classList.contains('c-is-placeholder')) missing++;
            });
            const warnContainer = detailsEl.querySelector('.j-warning-container');
            if (warnContainer) {
              let warnSpan = warnContainer.querySelector('.c-class-row__warning');
              if (missing > 0) {
                if (!warnSpan) {
                  warnSpan = document.createElement('span');
                  warnSpan.className = 'c-class-row__warning';
                  warnContainer.insertBefore(warnSpan, warnContainer.firstElementChild);
                }
                warnSpan.title = missing + ' missing subject assignment(s)';
                warnSpan.innerHTML = '<svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> ' + missing + ' missing';
              } else if (warnSpan) {
                warnSpan.remove();
              }
            }
          }
        });
        optBtn.addEventListener('mouseenter', () => {
          const teacher = staffAssignments.find((t) => t.id === optBtn.dataset.teacherId);
          renderPreview(teacher || null);
        });
        optBtn.addEventListener('focus', () => {
          const teacher = staffAssignments.find((t) => t.id === optBtn.dataset.teacherId);
          renderPreview(teacher || null);
        });
      });
    }

    function openMenu() {
      renderMenu();
      rootEl.classList.add('c-is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      rootEl.classList.remove('c-is-open');
      trigger.setAttribute('aria-expanded', 'false');
      popover.innerHTML = '';
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (rootEl.classList.contains('c-is-open')) closeMenu();
      else openMenu();
    });

    document.addEventListener('click', (e) => {
      if (rootEl.classList.contains('c-is-open') && !rootEl.contains(e.target)) closeMenu();
    });
  }

  /* =======================================================================
     11. CURRICULUM SUBJECTS
     ======================================================================= */

  function renderCurriculumGrid() {
    const container = document.getElementById('j-curriculum-grid');
    let html = state.curriculumGroups.map((group) => renderCurriculumCard(group)).join('');
    if (state.editingCurriculumRange === 'NEW' && state.curriculumDraft) {
      html += renderInlineCurriculumEditor('NEW');
    }
    container.innerHTML = html;
    wireCurriculumGrid();
  }

  function renderCurriculumCard(group) {
    const isEditing = state.editingCurriculumRange === group.range && state.curriculumDraft;
    if (isEditing) return renderInlineCurriculumEditor(group.range);

    const subjectsHtml = group.subjects.map((subject) =>
      `<span class="c-subject-chip ${getSubjectBadgeTone(subject)}">${escapeHtml(subject)}</span>`
    ).join('');

    return `
      <article class="c-curriculum-card" data-range="${escapeHtml(group.range)}">
        <div class="c-curriculum-card__top">
          <div>
            <h3 class="c-curriculum-card__range">${escapeHtml(group.range)}</h3>
            ${group.description ? `<p class="c-curriculum-card__desc">${escapeHtml(group.description)}</p>` : ''}
          </div>
          <div class="c-curriculum-card__badges" style="display:flex; gap:0.5rem; align-items:center;">
            <span class="c-curriculum-card__count">${group.subjects.length} subjects</span>
            <button type="button" class="c-curriculum-card__edit-btn j-edit-curriculum-btn" data-range="${escapeHtml(group.range)}" aria-label="Edit ${escapeHtml(group.range)} curriculum subjects">
              <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6.5a1.5 1.5 0 0 0-3-3l-9.9 9.9a2 2 0 0 0-.5.83l-.9 3.02c-.1.34.23.67.57.57l3.02-.9a2 2 0 0 0 .83-.5z"/></svg>
            </button>
            <button type="button" class="j-delete-curriculum-btn" data-range="${escapeHtml(group.range)}" aria-label="Delete ${escapeHtml(group.range)} curriculum subjects" style="background:rgba(127,3,3,0.1); border:1px solid rgba(127,3,3,0.3); border-radius:var(--radius-lg); color:var(--maroon); padding:5px; display:flex; align-items:center; cursor:pointer;">
              <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="c-curriculum-card__subjects">${subjectsHtml}</div>
      </article>`;
  }

  function renderInlineCurriculumEditor(originalRange) {
    const draft = state.curriculumDraft;
    const chipsHtml = draft.subjects.length
      ? draft.subjects.map((subject) => `
          <span class="c-removable-chip" style="display:inline-flex;align-items:center;gap:4px;">
            ${escapeHtml(subject)}
            <button type="button" class="c-removable-chip__remove j-remove-subject-btn" data-subject="${escapeHtml(subject)}" aria-label="Remove ${escapeHtml(subject)}">
              <svg class="c-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </span>`).join('')
      : `<p class="c-curriculum-editor__empty">No subjects added yet.</p>`;

    return `
      <article class="c-curriculum-card">
        <form class="c-curriculum-editor j-inline-curriculum-form" data-original-range="${escapeHtml(originalRange)}">
          <div class="c-curriculum-editor__field">
            <label class="c-curriculum-editor__label">Learning stage</label>
            <input class="c-curriculum-editor__input j-curriculum-range-input" value="${escapeHtml(draft.range)}" placeholder="e.g. Years 12–13" />
          </div>
          <div class="c-curriculum-editor__field">
            <label class="c-curriculum-editor__label">Description</label>
            <input class="c-curriculum-editor__input c-curriculum-editor__input--desc j-curriculum-description-input" placeholder="Describe this learning stage" value="${escapeHtml(draft.description)}" />
          </div>
          <div class="c-curriculum-editor__field">
            <p class="c-curriculum-editor__chips-label">Subjects</p>
            <div class="c-curriculum-editor__chips j-curriculum-chips">${chipsHtml}</div>
          </div>
          <div class="c-curriculum-editor__add-row">
            <input class="c-curriculum-editor__add-input j-new-subject-input" placeholder="Add a subject" value="${escapeHtml(draft.newSubject)}" />
            <button type="button" class="c-curriculum-editor__add-btn j-add-subject-btn" ${draft.newSubject.trim() ? '' : 'disabled'} aria-label="Add subject to this stage">
              <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add
            </button>
          </div>
          <div class="c-curriculum-editor__footer">
            <button type="button" class="c-btn-cancel-cherry j-cancel-curriculum-btn">
              Cancel
            </button>
            <button type="submit" class="c-btn-save-maroon ${draft.range.trim() ? '' : 'c-is-disabled'}" ${draft.range.trim() ? '' : 'disabled'}>
              Save subjects
            </button>
          </div>
        </form>
      </article>`;
  }

  function wireCurriculumGrid() {
    const addSectionBtn = document.getElementById('j-open-add-curriculum');
    if (addSectionBtn) {
      addSectionBtn.onclick = () => startAddingCurriculumSection();
    }
    document.querySelectorAll('.j-edit-curriculum-btn').forEach((btn) => {
      btn.addEventListener('click', () => startEditingCurriculum(btn.dataset.range));
    });
    document.querySelectorAll('.j-delete-curriculum-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const range = btn.dataset.range;
        const group = state.curriculumGroups.find((g) => g.range === range);
        if (group) {
          showConfirmDeleteModal({
            title: `Delete ${range} Curriculum?`,
            description: `This will remove the curriculum group for ${range} and all its subjects.`,
            buttonText: 'Delete',
            onConfirm: () => {
              state.curriculumGroups = state.curriculumGroups.filter((g) => g.range !== range);
              renderCurriculumGrid();
            }
          });
        }
      });
    });

    const form = document.querySelector('.j-inline-curriculum-form');
    if (!form) return;

    form.querySelector('.j-curriculum-range-input').addEventListener('input', (e) => {
      state.curriculumDraft.range = e.target.value;
      form.querySelector('.c-btn-save-maroon').disabled = !e.target.value.trim();
    });
    form.querySelector('.j-curriculum-description-input').addEventListener('input', (e) => {
      state.curriculumDraft.description = e.target.value;
    });
    const newSubjectInput = form.querySelector('.j-new-subject-input');
    newSubjectInput.addEventListener('input', (e) => {
      state.curriculumDraft.newSubject = e.target.value;
      form.querySelector('.j-add-subject-btn').disabled = !e.target.value.trim();
    });
    newSubjectInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addDraftSubject(); }
    });
    form.querySelector('.j-add-subject-btn').addEventListener('click', addDraftSubject);
    form.querySelectorAll('.j-remove-subject-btn').forEach((btn) => {
      btn.addEventListener('click', () => removeDraftSubject(btn.dataset.subject));
    });
    form.querySelector('.j-cancel-curriculum-btn').addEventListener('click', () => {
      state.editingCurriculumRange = null;
      state.curriculumDraft = null;
      renderCurriculumGrid();
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      saveCurriculumEdit(form.dataset.originalRange);
    });
  }

  function startAddingCurriculumSection() {
    state.editingCurriculumRange = 'NEW';
    state.curriculumDraft = { range: 'Years 12–13', description: 'Advanced Secondary Stage', subjects: ['Physics', 'Chemistry', 'Biology'], newSubject: '' };
    renderCurriculumGrid();
  }

  function startEditingCurriculum(range) {
    const group = state.curriculumGroups.find((g) => g.range === range);
    if (!group) return;
    state.editingCurriculumRange = range;
    state.curriculumDraft = { range: group.range, description: group.description, subjects: group.subjects.slice(), newSubject: '' };
    renderCurriculumGrid();
  }

  function addDraftSubject() {
    const draft = state.curriculumDraft;
    const subject = draft.newSubject.trim();
    if (!draft || !subject || draft.subjects.includes(subject)) return;
    draft.subjects.push(subject);
    draft.newSubject = '';
    renderCurriculumGrid();
  }

  function removeDraftSubject(subject) {
    if (!state.curriculumDraft) return;
    state.curriculumDraft.subjects = state.curriculumDraft.subjects.filter((s) => s !== subject);
    renderCurriculumGrid();
  }

  function saveCurriculumEdit(originalRange) {
    const draft = state.curriculumDraft;
    if (!draft || !draft.range.trim()) return;
    const updatedGroup = { range: draft.range.trim(), description: draft.description.trim(), subjects: draft.subjects };
    
    if (originalRange === 'NEW' || !state.curriculumGroups.some((g) => g.range === originalRange)) {
      state.curriculumGroups.push(updatedGroup);
    } else {
      if (updatedGroup.range !== originalRange && state.curriculumGroups.some((g) => g.range === updatedGroup.range)) return;
      state.curriculumGroups = state.curriculumGroups.map((g) => (g.range === originalRange ? updatedGroup : g));
    }

    // Sync subjects to classes in the updated range
    const match = updatedGroup.range.match(/Years\s+(\d+)[–-](\d+)/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      for (let i = start; i <= end; i++) {
        const gradeName = 'Grade ' + i;
        const gradeObj = state.grades.find(g => g.name === gradeName);
        if (gradeObj) {
          gradeObj.classes.forEach(className => {
            if (!state.subjectAssignments[className]) state.subjectAssignments[className] = {};
            updatedGroup.subjects.forEach(subject => {
              if (state.subjectAssignments[className][subject] === undefined) {
                state.subjectAssignments[className][subject] = ''; // assignment pending
              }
            });
          });
        }
      }
    }

    state.editingCurriculumRange = null;
    state.curriculumDraft = null;
    renderCurriculumGrid();
    renderGradeGrid(); // Re-render grades grid to show missing assignments if any
  }

  /* =======================================================================
     12. MODAL — ADD A GRADE
     ======================================================================= */

  function initAddGradeModal() {
    const layer = document.getElementById('j-modal-add-grade');
    const form = document.getElementById('j-add-grade-form');
    const nameInput = document.getElementById('j-add-grade-name');
    const submitBtn = document.getElementById('j-add-grade-submit');

    document.getElementById('j-open-add-grade').addEventListener('click', () => {
      nameInput.value = '';
      submitBtn.disabled = true;
      openModal(layer, nameInput);
    });

    nameInput.addEventListener('input', () => { submitBtn.disabled = !nameInput.value.trim(); });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return;

      const id = `g-${Date.now()}`;
      const classPrefix = (name.match(/\d+/) || ['New'])[0];
      const firstSection = `${classPrefix}-A`;

      state.grades.push({
        id, name, classes: [firstSection],
        subjectScores: Object.fromEntries(initialSubjects.map((subject) => [subject, [75]]))
      });
      addEnrollmentGradeRecord({ id, name, classNames: [firstSection] });
      saveClassEnrollmentRecord(id, null, firstSection, 30);
      state.selectedGradeId = id;

      closeModal(layer);
      renderGradeGrid();
      refreshPerformanceFilters();
      renderPerfChart();
    });
  }

  /* =======================================================================
     13. GENERIC MODAL OPEN / CLOSE (shared by every modal on this page)
     ======================================================================= */

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

  function openDeleteStructureModal(grade) {
    let selectedFullGrade = false;
    const selectedClasses = new Set();

    const overlay = document.createElement('div');
    overlay.className = 'c-modal-layer c-is-open';
    overlay.style.cssText = 'position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem;';
    
    const scrim = document.createElement('div');
    scrim.style.cssText = 'position:fixed; inset:0; background:rgba(15,65,74,0.55); backdrop-filter:blur(4px);';
    overlay.appendChild(scrim);

    const card = document.createElement('div');
    card.className = 'c-modal';
    card.style.cssText = 'position:relative; z-index:10; background:#fff; border-radius:1.5rem; padding:2rem; width:100%; max-width:32rem; text-align:center; box-shadow:var(--shadow-xl); border-top:1px solid rgba(127,3,3,0.1); border-bottom:1px solid rgba(127,3,3,0.1); backdrop-filter:blur(8px); display:flex; flex-direction:column; gap:1.25rem;';

    function renderContent() {
      const classPillsHtml = grade.classes.map(c => {
        const isSel = selectedClasses.has(c);
        return `
          <button type="button" class="j-del-pill-class" data-class="${escapeHtml(c)}" style="padding:0.5rem 1rem; border-radius:var(--radius-full); font-size:0.8125rem; font-weight:600; cursor:pointer; border:1px solid ${isSel ? '#7f0303' : 'var(--color-border)'}; background:${isSel ? '#7f0303' : '#fcfbf7'}; color:${isSel ? '#fff' : 'var(--midnight)'}; display:flex; align-items:center; gap:4px; transition:all 0.15s;">
            ${isSel ? `<svg class="c-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>` : ''} Class ${escapeHtml(c)}
          </button>
        `;
      }).join('');

      const fullGradeSel = selectedFullGrade;
      const fullGradePillHtml = `
        <button type="button" class="j-del-pill-grade" style="padding:0.5rem 1rem; border-radius:var(--radius-full); font-size:0.8125rem; font-weight:600; cursor:pointer; border:1px solid ${fullGradeSel ? '#7f0303' : 'var(--color-border)'}; background:${fullGradeSel ? '#7f0303' : '#fcfbf7'}; color:${fullGradeSel ? '#fff' : 'var(--midnight)'}; display:flex; align-items:center; gap:4px; transition:all 0.15s;">
          ${fullGradeSel ? `<svg class="c-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>` : ''} Full ${escapeHtml(grade.name)}
        </button>
      `;

      card.innerHTML = `
        <div style="margin:0 auto; display:flex; align-items:center; justify-content:center; height:3.5rem; width:3.5rem; border-radius:50%; background:rgba(127,3,3,0.1); color:#7f0303;">
          <svg class="c-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </div>
        <div>
          <h2 style="margin:0; font-size:1.15rem; font-weight:700; color:var(--midnight);">Delete Academic Structures</h2>
          <p style="margin:0.25rem 0 0; font-size:0.8125rem; color:rgba(15, 65, 74, 0.75);">Select the grade or the classes you wish to remove. They will accumulate as selected tags.</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:center; margin:0.5rem 0;">
          <p style="margin:0; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:rgba(15, 65, 74, 0.5);">Grade option</p>
          <div>${fullGradePillHtml}</div>
          <p style="margin:0.5rem 0 0; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:rgba(15, 65, 74, 0.5);">Class options</p>
          <div style="display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center;">${classPillsHtml}</div>
        </div>
        <div style="display:flex; justify-content:center; gap:0.75rem; margin-top:0.5rem;">
          <button type="button" class="j-cancel-del-btn" style="padding:0.625rem 1.25rem; font-size:0.8125rem; font-weight:600; border-radius:0.5rem; border:1px solid var(--color-border); background:#fff; color:var(--midnight); cursor:pointer; min-width:6.5rem;">Cancel</button>
          <button type="button" class="j-confirm-del-btn" style="padding:0.625rem 1.25rem; font-size:0.8125rem; font-weight:600; border-radius:0.5rem; border:none; background:#7f0303; color:#fff; cursor:pointer; min-width:6.5rem;" ${(!selectedFullGrade && selectedClasses.size === 0) ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Delete Selected</button>
        </div>
      `;

      card.querySelector('.j-cancel-del-btn').addEventListener('click', close);
      card.querySelector('.j-del-pill-grade').addEventListener('click', () => {
        selectedFullGrade = !selectedFullGrade;
        if (selectedFullGrade) {
          selectedClasses.clear();
        }
        renderContent();
      });
      card.querySelectorAll('.j-del-pill-class').forEach(btn => {
        btn.addEventListener('click', () => {
          const c = btn.dataset.class;
          if (selectedClasses.has(c)) {
            selectedClasses.delete(c);
          } else {
            selectedClasses.add(c);
            selectedFullGrade = false;
          }
          renderContent();
        });
      });
      const confirmBtn = card.querySelector('.j-confirm-del-btn');
      if (confirmBtn && (selectedFullGrade || selectedClasses.size > 0)) {
        confirmBtn.addEventListener('click', () => {
          executeDeletion();
          close();
        });
      }
    }

    function executeDeletion() {
      if (selectedFullGrade) {
        state.grades = state.grades.filter(g => g.id !== grade.id);
        state.enrollmentGrades = state.enrollmentGrades.filter(g => g.id !== grade.id);
        if (state.selectedGradeId === grade.id) {
          const remaining = state.grades;
          state.selectedGradeId = remaining.length ? remaining[0].id : '';
        }
      } else {
        grade.classes = grade.classes.filter(c => !selectedClasses.has(c));
        const enrollmentGrade = state.enrollmentGrades.find(g => g.id === grade.id);
        if (enrollmentGrade) {
          enrollmentGrade.classNames = enrollmentGrade.classNames.filter(c => !selectedClasses.has(c));
        }
        selectedClasses.forEach(c => {
          delete state.classTeachers[c];
          delete state.subjectAssignments[c];
        });
      }
      renderGradeGrid();
      refreshPerformanceFilters();
      renderPerfChart();
    }

    const close = () => { overlay.remove(); };
    scrim.addEventListener('click', close);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    renderContent();
  }

  function openModal(layerEl, focusEl) {
    layerEl.classList.add('c-is-open');
    if (focusEl) window.setTimeout(() => focusEl.focus(), 50);
  }
  function closeModal(layerEl) { layerEl.classList.remove('c-is-open'); }

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
     14. SHARED CHART TOOLTIP HELPER
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
  function hideTooltip() { tooltipEl.classList.remove('c-is-visible'); }

  /* =======================================================================
     15. APP BOOTSTRAP
     ======================================================================= */

  function init() {
    renderGradeGrid();
    renderCurriculumGrid();

    try { initPerformanceFilters(); } catch (e) {}
    try { renderPerfChart(); } catch (e) {}

    try { renderExamWeekdays(); } catch (e) {}
    try { initExamCalendarNav(); } catch (e) {}
    try { refreshExamCalendar(); } catch (e) {}
    try { initExamEventEditor(); } catch (e) {}
    try { initExamDaySchedule(); } catch (e) {}

    try { initAddGradeModal(); } catch (e) {}
    try { initModalDismissHandlers(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('resize', () => {
    if (document.getElementById('j-perf-chart-svg')) {
      renderPerfChart();
    }
  });
})();
