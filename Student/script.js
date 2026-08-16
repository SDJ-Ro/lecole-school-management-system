// =========================================================
// L'École Student Portal — interactivity
// =========================================================
 
document.addEventListener('DOMContentLoaded', () => {
 
  /* ---------------------------------------------------------
     1. PAGE ROUTER (hash based)
     --------------------------------------------------------- */
  const pages = {
    dashboard:    document.getElementById('page-dashboard'),
    academic:     document.getElementById('page-academic'),
    sports:       document.getElementById('page-sports'),
    achievements: document.getElementById('page-achievements'),
    certificates: document.getElementById('page-certificates'),
    notices:      document.getElementById('page-notices'),
    profile:      document.getElementById('page-profile'),
  };
 
  const navItems = document.querySelectorAll('.nav-item');
 
  function showPage(name){
    if(!pages[name]) name = 'dashboard';
 
    Object.entries(pages).forEach(([key, el]) => {
      if(!el) return;
      el.hidden = key !== name;
    });
 
    navItems.forEach(item => {
      const isCurrent = item.dataset.page === name;
      item.classList.toggle('active', isCurrent);
      item.classList.toggle('c-is-selected', isCurrent);
      item.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
    });
 
    // mark notices as read once the user actually visits the Notice Board page
    if(name === 'notices'){
      const badge = document.getElementById('notice-badge');
      if(badge) badge.style.display = 'none';
    }
 
    if (name === 'sports') {
      if (scBrowseView) scBrowseView.hidden = false;
      if (scDetailView) scDetailView.hidden = true;
    }

    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }
 
  function routeFromHash(){
    const hash = (window.location.hash || '#dashboard').replace('#', '');
    showPage(hash);
  }
 
  window.addEventListener('hashchange', routeFromHash);
  routeFromHash(); // initial load
 
  /* ---------------------------------------------------------
     2. ACADEMIC PERFORMANCE CHART (inline SVG, no libraries)
     --------------------------------------------------------- */
  const chartData = {
    'Term 1': [
      { subject: 'English', mine: 78, best: 88 },
      { subject: 'Math',    mine: 82, best: 91 },
      { subject: 'Science', mine: 74, best: 89 },
      { subject: 'Religion', mine: 74, best: 89 },
      { subject: 'History', mine: 67, best: 79 },
      { subject: 'Sinhala', mine: 74, best: 89 },
      { subject: 'Geography', mine: 74, best: 89 },
      { subject: 'Civic', mine: 74, best: 89 },
      { subject: 'Aesthetics', mine: 74, best: 89 },
      { subject: 'ICT',     mine: 84, best: 92 },
      { subject: 'Health Science', mine: 74, best: 89 },
      { subject: 'Tanil', mine: 74, best: 89 },
    ],
    'Term 2': [
      { subject: 'English', mine: 81, best: 90 },
      { subject: 'Math',    mine: 86, best: 94 },
      { subject: 'Science', mine: 76, best: 91 },
      { subject: 'Religion', mine: 71, best: 82 },
      { subject: 'History', mine: 71, best: 82 },
      { subject: 'Sinhala', mine: 78, best: 90 },
      { subject: 'Geography', mine: 78, best: 90 },
      { subject: 'Civic', mine: 78, best: 90 },
      { subject: 'Aesthetics', mine: 78, best: 90 },
      { subject: 'ICT',     mine: 87, best: 93 },
      { subject: 'Health Science', mine: 78, best: 90 },
      { subject: 'Tanil', mine: 78, best: 90 },
    ],
    'Term 3': [
      { subject: 'English', mine: 85, best: 93 },
      { subject: 'Math',    mine: 89, best: 96 },
      { subject: 'Science', mine: 80, best: 93 },
      { subject: 'Religion', mine: 75, best: 85 },
      { subject: 'History', mine: 76, best: 86 },
      { subject: 'Sinhala', mine: 82, best: 92 },
      { subject: 'Geography', mine: 82, best: 92 },
      { subject: 'Civic', mine: 82, best: 92 },
      { subject: 'Aesthetics', mine: 82, best: 92 },
      { subject: 'ICT',     mine: 90, best: 95 },
      { subject: 'Health Science', mine: 82, best: 92 },
      { subject: 'Tanil', mine: 82, best: 92 },
    ],
  };
 
  const svgEl = document.getElementById('perf-chart');
  const chartTooltip = document.getElementById('j-chart-tooltip');
 
  function renderChart(termKey){
    const data = chartData[termKey] || chartData['Term 2'];
 
    // fixed, spacious width per subject; height 390 for clean Y-axis spacing
    const H = 390;
    const padLeft = 50, padRight = 16, padTop = 16, padBottom = 46;
    const perSubjectW = 95;
 
    const groupCount = data.length;
    const groupW = perSubjectW;
    const plotW = groupW * groupCount;
    const plotH = H - padTop - padBottom;
    const W = padLeft + plotW + padRight;
 
    const barW = groupW * 0.22;
    const barGap = groupW * 0.06;
 
    const maxVal = 100;
    const axisColor = '#7b9698';
 
    let svg = '';
 
    // y-axis tick labels (no gridlines)
    [0, 25, 50, 75, 100].forEach(val => {
      const y = padTop + plotH - (val / maxVal) * plotH;
      svg += `<text x="${padLeft - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#93a1a2" font-family="inherit">${val}</text>`;
    });
 
    // bars + subject labels
    data.forEach((d, i) => {
      const groupX = padLeft + i * groupW;
      const barMineX = groupX + groupW / 2 - barGap / 2 - barW;
      const barBestX = groupX + groupW / 2 + barGap / 2;
 
      const mineH = (d.mine / maxVal) * plotH;
      const bestH = (d.best / maxVal) * plotH;
 
      const mineY = padTop + plotH - mineH;
      const bestY = padTop + plotH - bestH;
 
      svg += `<rect class="chart-bar" data-subject="${d.subject}" data-type="My Score" data-value="${d.mine}" x="${barMineX}" y="${mineY}" width="${barW}" height="${mineH}" rx="4" fill="#7F0303"/>`;
      svg += `<rect class="chart-bar" data-subject="${d.subject}" data-type="Highest Score" data-value="${d.best}" x="${barBestX}" y="${bestY}" width="${barW}" height="${bestH}" rx="4" fill="#7FC7CC"/>`;
      svg += `<text x="${groupX + groupW / 2}" y="${padTop + plotH + 18}" text-anchor="middle" font-size="12" font-weight="400" fill="#5c6b6c" font-family="inherit">${d.subject}</text>`;
    });
 
    // X and Y axis lines
    svg += `<line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + plotH}" stroke="${axisColor}" stroke-width="1.5"/>`;
    svg += `<line x1="${padLeft}" y1="${padTop + plotH}" x2="${padLeft + plotW}" y2="${padTop + plotH}" stroke="${axisColor}" stroke-width="1.5"/>`;
 
    // axis titles
    const yCenter = padTop + plotH / 2;
    svg += `<text x="14" y="${yCenter}" text-anchor="middle" font-size="11.5" font-weight="600" letter-spacing="0.05em" fill="var(--moss, #4B5B34)" font-family="inherit" transform="rotate(-90 14 ${yCenter})">SCORE (%)</text>`;
 
    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.style.width = `${W}px`;
    svgEl.style.height = `${H}px`;
    svgEl.innerHTML = svg;
    svgEl.querySelectorAll('.chart-bar').forEach(bar => {
      const subjectName = bar.dataset.subject;
      const subjData = data.find(item => item.subject === subjectName);
      if (subjData) {
        bar.addEventListener('mouseenter', (e) => showChartTooltip(e, subjData));
        bar.addEventListener('mousemove', positionChartTooltip);
        bar.addEventListener('mouseleave', hideChartTooltip);
      }
    });
  }
 
  function showChartTooltip(e, d){
    if (!chartTooltip) return;
    chartTooltip.innerHTML = `
      <p class="c-chart-tooltip__label" style="margin:0; font-size:0.8125rem; font-weight:700; color:var(--midnight, #0F414A);">${d.subject}</p>
      <p class="c-chart-tooltip__row c-chart-tooltip__row--total" style="margin:0.25rem 0 0; font-size:0.8125rem; font-weight:600; color:#7fa9b8;">Highest Score : ${d.best}%</p>
      <p class="c-chart-tooltip__row c-chart-tooltip__row--sports" style="margin:0.25rem 0 0; font-size:0.8125rem; font-weight:600; color:#7F0303;">My Score : ${d.mine}%</p>
    `;
    chartTooltip.classList.add('c-is-visible');
    positionChartTooltip(e);
  }
 
  function positionChartTooltip(e){
    if (!chartTooltip) return;
    const p = 14, rect = chartTooltip.getBoundingClientRect();
    let l = e.clientX + p, t = e.clientY + p;
    if (l + rect.width > window.innerWidth - 8) l = e.clientX - rect.width - p;
    if (t + rect.height > window.innerHeight - 8) t = e.clientY - rect.height - p;
    chartTooltip.style.left = `${Math.max(8, l)}px`;
    chartTooltip.style.top = `${Math.max(8, t)}px`;
  }
 
  function hideChartTooltip(){
    if (chartTooltip) chartTooltip.classList.remove('c-is-visible');
  }
 
  const termDropdown       = document.getElementById('term-dropdown');
  const termDropdownBtn    = document.getElementById('term-dropdown-btn');
  const termDropdownMenu   = document.getElementById('term-dropdown-menu');
  const termDropdownLabel  = document.getElementById('term-dropdown-label');
  const termDropdownOptions = termDropdownMenu.querySelectorAll('.nb-dropdown-option');

  function closeTermDropdown(){
    termDropdown.classList.remove('is-open');
    termDropdownMenu.hidden = true;
    termDropdownBtn.setAttribute('aria-expanded', 'false');
  }

  function openTermDropdown(){
    termDropdown.classList.add('is-open');
    termDropdownMenu.hidden = false;
    termDropdownBtn.setAttribute('aria-expanded', 'true');
  }

  termDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if(termDropdownMenu.hidden) openTermDropdown(); else closeTermDropdown();
  });

  termDropdownOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const value = opt.dataset.value;
      termDropdownLabel.textContent = value;
      termDropdownOptions.forEach(o => {
        const selected = o === opt;
        o.classList.toggle('is-selected', selected);
        o.setAttribute('aria-selected', String(selected));
      });
      closeTermDropdown();
      renderChart(value);
    });
  });

  document.addEventListener('click', (e) => {
    if(!termDropdown.contains(e.target)) closeTermDropdown();
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeTermDropdown();
  });

  renderChart(termDropdownLabel.textContent);
 
 
  
  /* ---------------------------------------------------------
     3. CALENDAR WIDGET (Ported from Admin)
     --------------------------------------------------------- */
  const state = {
    viewDate: new Date(2026, 6, 1), // July 2026
    selectedDate: new Date(2026, 6, 18),
    calendarEvents: [
      { id: '1', date: new Date(2026, 6, 15), time: '09:00 AM', title: 'Mid-term Exam', details: 'English Literature' },
      { id: '2', date: new Date(2026, 6, 18), time: '08:30–10:30 AM', title: 'Mathematics examination', details: 'Grades 6–8 · Respective classrooms' },
      { id: '3', date: new Date(2026, 6, 18), time: '02:00 PM', title: 'Sports Meet Finals', details: 'U17 Cricket Ground' }
    ]
  };
  window.studentCalendarState = state;

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MIN_CALENDAR_YEAR = 2024;
  const MAX_CALENDAR_YEAR = 2028;

  function sameCalendarDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }
  function formatMonthDay(d) {
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }
  function changeCalendarView(selected, nextViewMonth) {
    if (selected.getFullYear() === nextViewMonth.getFullYear() && selected.getMonth() === nextViewMonth.getMonth()) return selected;
    return nextViewMonth;
  }

  function renderCalendarGrid() {
    const weekdaysEl = document.getElementById('j-calendar-weekdays');
    const daysEl = document.getElementById('j-calendar-days');
    if (!weekdaysEl || !daysEl) return;

    weekdaysEl.innerHTML = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="c-calendar__weekday">${d}</div>`).join('');
    daysEl.innerHTML = '';

    const year = state.viewDate.getFullYear();
    const month = state.viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'c-calendar__day-blank';
      daysEl.appendChild(blank);
    }

    Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const isSelected = sameCalendarDay(date, state.selectedDate);
      const hasEvents = state.calendarEvents.some((ev) => sameCalendarDay(ev.date, date));

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

    countEl.textContent = `${dayEvents.length} EVENT${dayEvents.length === 1 ? '' : 'S'} SCHEDULED`;

    if (dayEvents.length) {
      const visibleEvents = dayEvents.slice(0, 2);
      detailEl.innerHTML = `
        <div class="c-calendar__day-events">
          ${visibleEvents.map(ev => `
            <article class="c-day-event-card">
              <p class="c-day-event-card__eyebrow">${formatMonthDay(state.selectedDate)} · ${ev.time}</p>
              <h3 class="c-day-event-card__title">${ev.title}</h3>
              <p class="c-day-event-card__details">${ev.details}</p>
            </article>
          `).join('')}
          ${visibleEvents.length === 1 ? `
            <div class="c-calendar__no-more-events">
              <span>No more events scheduled for this day</span>
            </div>
          ` : ''}
        </div>`;
    } else {
      detailEl.innerHTML = `
        <div class="c-calendar__empty-day">
          <p style="color:rgba(255,255,255,0.7); font-size:0.875rem; margin:0; text-align:center;">No events scheduled for ${formatMonthDay(state.selectedDate)}.</p>
        </div>`;
    }
  }

  function renderMonthSelect() {
    const root = document.getElementById('j-select-month');
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
    const root = document.getElementById('j-select-year');
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

  // Bind dropdown toggles
  ['j-select-month', 'j-select-year'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const trigger = el.querySelector('.c-select__trigger');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = el.classList.contains('c-is-open');
      document.querySelectorAll('.c-select').forEach(sel => sel.classList.remove('c-is-open', 'c-is-menu-visible'));
      if (!isOpen) {
        el.classList.add('c-is-open');
        requestAnimationFrame(() => el.classList.add('c-is-menu-visible'));
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.c-select').forEach(sel => sel.classList.remove('c-is-open', 'c-is-menu-visible'));
  });

  document.getElementById('j-calendar-prev')?.addEventListener('click', () => {
    state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1, 1);
    renderCalendarGrid();
    renderMonthSelect();
    renderYearSelect();
  });
  document.getElementById('j-calendar-next')?.addEventListener('click', () => {
    state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 1);
    renderCalendarGrid();
    renderMonthSelect();
    renderYearSelect();
  });

  renderCalendarGrid();
  renderCalendarDayDetail();
  renderMonthSelect();
  renderYearSelect();

  const jOpenDaySchedule = document.getElementById('j-open-day-schedule');
  const mrrModal = document.getElementById('j-day-schedule-modal');
  if (jOpenDaySchedule && mrrModal) {
    jOpenDaySchedule.addEventListener('click', () => mrrModal.hidden = false);
    mrrModal.querySelector('.mrr-close')?.addEventListener('click', () => mrrModal.hidden = true);
  }

 
  /* ---------------------------------------------------------
     5. USER MENU + LOGOUT
     --------------------------------------------------------- */
  document.getElementById('user-menu-toggle').addEventListener('click', () => {
    window.location.hash = '#profile';
  });
 
  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const confirmed = confirm('Are you sure you want to log out?');
    if(confirmed){
      alert('Logged out! (redirect to your login page here)');
    }
  });
 
});
 
/* ---------------------------------------------------------
     6. ACADEMIC RECORDS PAGE
     --------------------------------------------------------- */
 
  const GRADES = [6, 7, 8, 9, 10, 11];
  const TERMS = ['Term 1', 'Term 2', 'Term 3'];
  const SUBJECTS = ['English Language', 'Mathematics', 'Science','Religion', 'History','Sinhala', 'Geography', 'ICT', 'Civics', 'Aesthetics', 'Health Science', 'Tanil'];

  // class teachers who might be assigned to a grade, and the month each
  // term's feedback is typically written in
  const CLASS_TEACHERS = ['Mr. Aruna Silva', 'Mrs. Kumari Fernando', 'Mr. Chamara Perera', 'Mrs. Nilmini Rajapaksa', 'Mr. Dinesh Wickramasinghe', 'Mrs. Ishara Gunasekara'];
  const TERM_FEEDBACK_MONTHS = { 'Term 1': 'Apr', 'Term 2': 'Aug', 'Term 3': 'Dec' };

  // a small pool of feedback phrasings so notes don't all read the same
  const FEEDBACK_TEMPLATES = [
    (grade, term) => `A steady and encouraging ${term} for Grade ${grade}. Keep building on the stronger subjects while giving a little extra attention to the weaker ones.`,
    (grade, term) => `Good, consistent effort shown throughout ${term}. Continue focusing on practical work and regular revision ahead of the next assessments.`,
    (grade, term) => `Noticeable improvement in class participation this ${term}. Please keep up the disciplined study routine at home.`,
    (grade, term) => `A solid performance overall in ${term}, with some room to grow in time management during exams. Well done on the effort shown.`,
    (grade, term) => `Confidence in the core subjects has grown this ${term}. Encourage more reading outside the syllabus to build on this momentum.`
  ];
 
  // small deterministic "random" so numbers look natural but never change on reload
  function seededValue(seed){
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
 
  // "1" -> "1st", "2" -> "2nd", "3" -> "3rd", "11" -> "11th", "17" -> "17th", etc.
  function ordinalSuffix(n){
    const rem100 = n % 100;
    if(rem100 >= 11 && rem100 <= 13) return `${n}th`;
    switch(n % 10){
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  }
 
  // builds the full marks data set for every grade / term / subject
  function buildAcademicData(){
    const data = {};
 
    GRADES.forEach((grade, gIdx) => {
      data[grade] = { terms: {}, trend: [] };
 
      TERMS.forEach((term, tIdx) => {
        const rows = SUBJECTS.map((subject, sIdx) => {
          const seed = grade * 131 + tIdx * 37 + sIdx * 17;
          // marks trend gently upward across grades, with per-term/subject variation
          const base = 68 + gIdx * 2 + tIdx * 1.5;
          const marks = Math.min(98, Math.round(base + seededValue(seed) * 22));
          const highest = Math.min(100, marks + 3 + Math.round(seededValue(seed + 5) * 8));
          return { subject, marks, highest };
        });
        data[grade].terms[term] = rows;
 
        const myAvg = Math.round(rows.reduce((s, r) => s + r.marks, 0) / rows.length);
        const gradeAvg = Math.max(0, myAvg - 4 - Math.round(seededValue(grade * 7 + tIdx) * 5));
        data[grade].trend.push({ term, mine: myAvg, grade: gradeAvg });
 
        // class position: broadly tracks the term average (higher average -> better/lower
        // rank), with a small deterministic jitter so it isn't a perfectly straight line
        const classSize = 42;
        const jitter = Math.round(seededValue(grade * 53 + tIdx * 11 + 3) * 6) - 3;
        let position = Math.round(classSize - ((myAvg - 55) / 45) * (classSize - 1)) + jitter;
        position = Math.min(classSize, Math.max(1, position));
 
        data[grade].positions = data[grade].positions || {};
        data[grade].positions[term] = position;
      });
 
      // one class-teacher feedback entry per term, keyed by term so the
      // Digital Record Book can show the right note for whichever
      // grade + term the student has selected
      data[grade].feedback = {};
      TERMS.forEach((term, tIdx) => {
        const seed = grade * 211 + tIdx * 43;
        const teacher = CLASS_TEACHERS[Math.floor(seededValue(seed) * CLASS_TEACHERS.length)];
        const template = FEEDBACK_TEMPLATES[Math.floor(seededValue(seed + 3) * FEEDBACK_TEMPLATES.length)];
        const day = 2 + Math.floor(seededValue(seed + 9) * 26);

        data[grade].feedback[term] = {
          name: teacher,
          date: `${TERM_FEEDBACK_MONTHS[term]} ${day}, 2024`,
          text: template(grade, term)
        };
      });
    });
 
    return data;
  }
 
  const academicData = buildAcademicData();
 
  let currentGrade = 6;
  let currentTerm = 'Term 1';
 
  const recordGradeLabel = document.getElementById('record-grade-label');
  const marksTableBody = document.getElementById('marks-table-body');
  const totalMarksLabel = document.getElementById('total-marks-label');
  const totalMarksScored = document.getElementById('total-marks-scored');
  const totalMarksAverage = document.getElementById('total-marks-average');
  const totalMarksPosition = document.getElementById('total-marks-position');
  const trendGradeGridEl = document.getElementById('trend-grade-grid');
  const trendTooltipEl = document.getElementById('trend-tooltip');
  const trendDotsEl = document.getElementById('trend-dots');
  const trendPrevBtn = document.getElementById('trend-prev-btn');
  const trendNextBtn = document.getElementById('trend-next-btn');
  const feedbackTermLabel = document.getElementById('feedback-term-label');
  const teacherFeedbackCard = document.getElementById('teacher-feedback-card');
 
  // which grade's chart the trend carousel is currently showing (independent of currentGrade)
  let trendViewGrade = currentGrade;

  // small reusable custom dropdown (button + menu + checkmark), matching the
  // Notice Board's category dropdown style, for dynamically-populated lists
  function setupDropdown(dropdownEl, options, initialValue, onChange){
    const btnEl = dropdownEl.querySelector('.nb-dropdown-btn');
    const menuEl = dropdownEl.querySelector('.nb-dropdown-menu');
    const labelEl = btnEl.querySelector('span');

    function close(){
      dropdownEl.classList.remove('is-open');
      menuEl.hidden = true;
      btnEl.setAttribute('aria-expanded', 'false');
    }

    function open(){
      dropdownEl.classList.add('is-open');
      menuEl.hidden = false;
      btnEl.setAttribute('aria-expanded', 'true');
    }

    function renderOptions(selectedValue){
      menuEl.innerHTML = options.map(opt => `
        <button type="button" class="nb-dropdown-option${String(opt.value) === String(selectedValue) ? ' is-selected' : ''}" data-value="${opt.value}" role="option" aria-selected="${String(opt.value) === String(selectedValue)}">
          <span>${opt.label}</span>
          <svg class="nb-dropdown-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      `).join('');

      const selectedOpt = options.find(o => String(o.value) === String(selectedValue));
      if(selectedOpt) labelEl.textContent = selectedOpt.label;

      menuEl.querySelectorAll('.nb-dropdown-option').forEach(optEl => {
        optEl.addEventListener('click', () => {
          const val = optEl.dataset.value;
          renderOptions(val);
          close();
          onChange(val);
        });
      });
    }

    btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if(menuEl.hidden) open(); else close();
    });

    document.addEventListener('click', (e) => {
      if(!dropdownEl.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') close();
    });

    renderOptions(initialValue);

    return {
      setValue(val){ renderOptions(val); }
    };
  }

  // Grade dropdown (Grade 6 - Grade 11)
  const gradeDropdownApi = setupDropdown(
    document.getElementById('grade-dropdown'),
    GRADES.map(g => ({ value: g, label: `Grade ${g}` })),
    currentGrade,
    (val) => {
      currentGrade = Number(val);
      trendViewGrade = currentGrade;
      renderAcademicPage();
    }
  );

  // Term dropdown (Term 1 - Term 3)
  const termDropdownApi = setupDropdown(
    document.getElementById('record-term-dropdown'),
    TERMS.map(t => ({ value: t, label: t })),
    currentTerm,
    (val) => {
      currentTerm = val;
      renderAcademicPage();
    }
  );
 
  function renderMarksTable(){
    const rows = academicData[currentGrade].terms[currentTerm];
    marksTableBody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.subject}</td>
        <td>${r.marks}</td>
        <td>${r.highest}</td>
      </tr>
    `).join('');
  }
 
  function renderTotalMarksCard(){
    const rows = academicData[currentGrade].terms[currentTerm];
    const scored = rows.reduce((s, r) => s + r.marks, 0);
    const outOf = rows.length * 100;
    const avg = ((scored / outOf) * 100).toFixed(1);
    const position = academicData[currentGrade].positions[currentTerm];
 
    totalMarksLabel.textContent = `Total Marks (${currentTerm})`;
    totalMarksScored.textContent = scored;
    document.querySelector('.total-marks-out-of').textContent = `/${outOf}`;
    totalMarksAverage.textContent = `${avg}%`;
    totalMarksPosition.textContent = ordinalSuffix(position);
  }

  // shows the class teacher's feedback for whichever grade + term is
  // currently selected in the Digital Record Book
  function renderTeacherFeedback(){
    const feedback = academicData[currentGrade].feedback[currentTerm];

    feedbackTermLabel.textContent = `${currentTerm}, Grade ${currentGrade}`;

    teacherFeedbackCard.innerHTML = `
      <div class="teacher-feedback-avatar">
        <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
      </div>
      <div class="teacher-feedback-body">
        <div class="teacher-feedback-meta">
          <span class="teacher-feedback-name">${feedback.name}</span>
          <span class="teacher-feedback-date">${feedback.date}</span>
        </div>
        <p class="teacher-feedback-text">${feedback.text}</p>
      </div>
    `;
  }
 

  // builds the small multi-bar SVG markup for a single grade's trend (Term 1-3)
  function buildGradeTrendSvg(grade){
    const trend = academicData[grade].trend;
 
    const W = 260, H = 130;
    const padLeft = 34, padRight = 6, padTop = 8, padBottom = 32;
    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;
 
    const groupCount = trend.length;
    const groupW = plotW / groupCount;
    const barW = groupW * 0.1;
    const barGap = groupW * 0.06;
    const maxVal = 100;
 
    let svg = '';
 
    [0, 50, 100].forEach(val => {
      const y = padTop + plotH - (val / maxVal) * plotH;
      svg += `<text x="${padLeft - 6}" y="${y + 3}" text-anchor="end" font-size="8.5" fill="#93a1a2" font-family="inherit">${val}</text>`;
    });

    // Y axis
    svg += `<line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + plotH}" stroke="#c9c0aa" stroke-width="1.25"/>`;
    // X axis
    svg += `<line x1="${padLeft}" y1="${padTop + plotH}" x2="${W - padRight}" y2="${padTop + plotH}" stroke="#c9c0aa" stroke-width="1.25"/>`;

    // Y axis title (rotated), e.g. "MARKS"
    const yTitleX = 9;
    const yTitleY = padTop + plotH / 2;
    svg += `<text x="${yTitleX}" y="${yTitleY}" text-anchor="middle" font-size="8.5" font-weight="600" letter-spacing="0.05em" fill="var(--moss, #4B5B34)" font-family="inherit" transform="rotate(-90 ${yTitleX} ${yTitleY})">MARKS</text>`;

    // X axis title, e.g. "ACADEMIC TERM"
    svg += `<text x="${padLeft + plotW / 2}" y="${H - 3}" text-anchor="middle" font-size="8.5" font-weight="600" letter-spacing="0.05em" fill="var(--moss, #4B5B34)" font-family="inherit">ACADEMIC TERM</text>`;
 
    trend.forEach((d, i) => {
      const groupX = padLeft + i * groupW;
      const barMineX = groupX + groupW / 2 - barGap / 2 - barW;
      const barGradeX = groupX + groupW / 2 + barGap / 2;
 
      const mineH = (d.mine / maxVal) * plotH;
      const gradeH = (d.grade / maxVal) * plotH;
      const mineY = padTop + plotH - mineH;
      const gradeY = padTop + plotH - gradeH;
 
      svg += `<rect class="trend-bar" data-grade-num="${grade}" data-term="${d.term}" data-mine="${d.mine}" data-grade="${d.grade}"
                x="${barMineX}" y="${mineY}" width="${barW}" height="${Math.max(mineH,1)}" rx="2" fill="#1f3a3d"/>`;
      svg += `<rect class="trend-bar" data-grade-num="${grade}" data-term="${d.term}" data-mine="${d.mine}" data-grade="${d.grade}"
                x="${barGradeX}" y="${gradeY}" width="${barW}" height="${Math.max(gradeH,1)}" rx="2" fill="#e7b6b0"/>`;
 
      svg += `<text x="${groupX + groupW / 2}" y="${padTop + plotH + 12}" text-anchor="middle" font-size="9" font-weight="600" fill="#5c6b6c" font-family="inherit">T${i + 1}</text>`;
    });
 
    return { svg, W, H };
  }
 
  // renders a single card for the grade currently being viewed in the carousel,
  // with prev/next arrows and dot indicators to switch between grades 6-11
  function renderTrendChart(){
    const grade = trendViewGrade;
    const { svg, W, H } = buildGradeTrendSvg(grade);
    const trend = academicData[grade].trend;
    const overallAvg = Math.round(trend.reduce((s, d) => s + d.mine, 0) / trend.length);
    const isCurrent = grade === currentGrade;

    trendGradeGridEl.innerHTML = `
      <div class="trend-grade-card${isCurrent ? ' current' : ''}" data-grade-num="${grade}">
        <div class="trend-grade-card-header">
          <span class="trend-grade-card-title">Grade ${grade}</span>
          <span class="trend-grade-card-avg">Avg ${overallAvg}%</span>
        </div>
        <svg class="trend-grade-card-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${svg}</svg>
      </div>
    `;

    trendGradeGridEl.querySelectorAll('.trend-bar').forEach(bar => {
      bar.addEventListener('mouseenter', (e) => showTrendTooltip(e.target));
      bar.addEventListener('mousemove', (e) => positionTrendTooltip(e));
      bar.addEventListener('mouseleave', hideTrendTooltip);
    });

    // clicking the card jumps the record book / sidebar to that grade
    trendGradeGridEl.querySelectorAll('.trend-grade-card').forEach(card => {
      card.addEventListener('click', () => {
        currentGrade = Number(card.dataset.gradeNum);
        currentTerm = 'Term 1';
        renderAcademicPage();
      });
    });

    // dot indicators, one per grade
    const gradeIndex = GRADES.indexOf(grade);
    trendDotsEl.innerHTML = GRADES.map((g, i) => `
      <button class="trend-dot${i === gradeIndex ? ' active' : ''}" data-grade-num="${g}" aria-label="Show Grade ${g}" type="button"></button>
    `).join('');

    trendDotsEl.querySelectorAll('.trend-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        trendViewGrade = Number(dot.dataset.gradeNum);
        renderTrendChart();
      });
    });

    trendPrevBtn.disabled = gradeIndex === 0;
    trendNextBtn.disabled = gradeIndex === GRADES.length - 1;
  }

  trendPrevBtn.addEventListener('click', () => {
    const i = GRADES.indexOf(trendViewGrade);
    if (i > 0){
      trendViewGrade = GRADES[i - 1];
      renderTrendChart();
    }
  });

  trendNextBtn.addEventListener('click', () => {
    const i = GRADES.indexOf(trendViewGrade);
    if (i < GRADES.length - 1){
      trendViewGrade = GRADES[i + 1];
      renderTrendChart();
    }
  });
 
  function showTrendTooltip(bar){
    const gradeNum = bar.dataset.gradeNum;
    const term = bar.dataset.term;
    const mine = bar.dataset.mine;
    const grade = bar.dataset.grade;
 
    trendTooltipEl.innerHTML = `
      <strong>Grade ${gradeNum} — ${term}</strong><br>
      My Average: <span class="tt-mine">${mine}</span><br>
      Grade Average: <span class="tt-grade">${grade}</span>
    `;
    trendTooltipEl.hidden = false;
  }
 
  function positionTrendTooltip(e){
    trendTooltipEl.style.left = `${e.clientX}px`;
    trendTooltipEl.style.top = `${e.clientY - 12}px`;
  }
 
  function hideTrendTooltip(){
    trendTooltipEl.hidden = true;
  }
 
  function renderAcademicPage(){
    recordGradeLabel.textContent = `Grade ${currentGrade}`;
 
    gradeDropdownApi.setValue(currentGrade);
    termDropdownApi.setValue(currentTerm);
 
    renderMarksTable();
    renderTotalMarksCard();
    renderTeacherFeedback();
    renderTrendChart();
  }
 
  document.getElementById('export-pdf-btn').addEventListener('click', () => {
    alert(`Exporting Grade ${currentGrade} — ${currentTerm} record book as PDF… (hook this up to your backend/export logic)`);
  });
 
  renderAcademicPage();
/* ---------------------------------------------------------
     7. SPORTS & CLUBS PAGE
     --------------------------------------------------------- */

(function(){

  // ---- icon library (feather-style paths), reused for card watermarks + detail hero ----
  const scIcons = {
    award:    '<circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/>',
    medal:    '<circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/>',
    trophy:   '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    mic:      '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
    grid:     '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    music:    '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    ball:     '<circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M2 12h20"/><path d="M4 6a15 15 0 0 0 16 0"/><path d="M4 18a15 15 0 0 1 16 0"/>',
    palette:  '<path d="M12 22c5.5 0 10-4 10-9a9 9 0 0 0-9-9A10 10 0 0 0 2 12c0 5.5 4.5 10 10 10z"/><circle cx="7.5" cy="10.5" r="1.3"/><circle cx="12" cy="7.3" r="1.3"/><circle cx="16.5" cy="10.5" r="1.3"/><circle cx="9" cy="16" r="1.3"/>',
    droplet:  '<path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/>',
    cpu:      '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
    phone:    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    lock:     '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    arrow:    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    heart:    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    check:    '<polyline points="20 6 9 17 4 12"/>',
    back:     '<polyline points="15 18 9 12 15 6"/>',
    pin:      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    clock:    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    mail:     '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    users:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    camera:   '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    bell:     '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  };

  function icon(name, extraAttrs){
    let attrs = '';
    if (typeof extraAttrs === 'number') {
      attrs = `width="${extraAttrs}" height="${extraAttrs}" class="c-icon"`;
    } else {
      attrs = extraAttrs || '';
      if (!attrs.includes('class=')) attrs = `class="c-icon" ${attrs}`;
      if (!attrs.includes('width=')) attrs = `width="16" height="16" ${attrs}`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${attrs}>${scIcons[name] || ''}</svg>`;
  }

  // filled person silhouette, used as a stand-in profile picture where a real photo isn't available
  function personAvatar(){
    return `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>`;
  }

  // ---- activity data ----
  const scActivities = [
    {
      id: 'cricket', title: 'U17 Cricket', type: 'sport', categoryLabel: 'Main Sport',
      enrolled: true, iconName: 'award', gradient: 'linear-gradient(135deg, #2f5233, #1c3639)',
      teacher: 'Mr. Aruna Silva', teacherTitle: 'Level 2 Coaching Cert. — Sri Lanka Cricket',
      phone: '+94 77 123 4567', email: 'a.silva@lecoleschool.edu',
      schedule: 'Tuesdays & Thursdays, 3:30 – 5:30 PM', location: 'Main Cricket Ground',
      enrolledSince: 'Grade 9',
      enrolledDate: 'September 4, 2023',
      description: 'The U17 Cricket squad represents the school at zonal and national inter-school tournaments. Training covers batting, bowling, fielding drills and match strategy, with regular practice matches against neighbouring schools.',
      achievements: [
        { title: 'Zonal Runners-up', year: '2025', tags: ['Zonal', 'Team'], gradient: 'linear-gradient(135deg, #2f5233, #1c3639)' },
        { title: 'Player of the Series — Inter-school U17 Tournament', year: '2025', tags: ['Inter-School', 'Individual'], gradient: 'linear-gradient(135deg, #c97f2e, #1c3639)' },
      ],
      teacherBio: 'Coaching the U17 squad for over 8 years, Mr. Silva previously played club cricket for Colombo District and holds a Level 2 coaching certification from Sri Lanka Cricket.',
      gallery: [
        { caption: 'Nets Practice, Term 2', gradient: 'linear-gradient(135deg, #3a5a5e, #1c3639)' },
        { caption: 'Trophy Presentation', gradient: 'linear-gradient(135deg, #c97f2e, #1c3639)' },
        { caption: 'Squad Team Photo, 2025', gradient: 'linear-gradient(135deg, #7fa9b8, #274448)' },
      ],
      noticeBoard: [
        { title: 'Practice moved to Ground 2', date: 'Jul 18, 2026', author: 'Mr. Aruna Silva', body: 'Due to resurfacing works on the Main Cricket Ground, Tuesday and Thursday practice sessions will be held on Ground 2 until further notice.' },
        { title: 'Fitness assessment this Friday', date: 'Jul 14, 2026', author: 'Mr. Aruna Silva', body: 'All squad members must report 30 minutes early on Friday for the term fitness assessment. Please bring appropriate sports gear.' },
        { title: 'Kit collection reminder', date: 'Jul 10, 2026', author: 'Mr. Aruna Silva', body: 'Squad members who haven\u2019t yet collected their new training kit can do so from the PE office before Friday.' },
      ],
      team: [
        { name: 'Ravindu Jayasekara', grade: 'Grade 12', role: 'Captain' },
        { name: 'Dinuka Wickramasinghe', grade: 'Grade 12', role: 'Vice-Captain' },
        { name: 'Jason Perera', grade: 'Grade 11', role: 'All-rounder' },
        { name: 'Tharindu Madushan', grade: 'Grade 11', role: 'Fast Bowler' },
        { name: 'Sachintha Bandara', grade: 'Grade 10', role: 'Wicketkeeper' },
        { name: 'Kavindu Rathnayake', grade: 'Grade 10', role: 'Batsman' },
        { name: 'Nipun Senanayake', grade: 'Grade 12', role: 'Batsman' },
        { name: 'Yohan Fernando', grade: 'Grade 11', role: 'Fast Bowler' },
        { name: 'Malith Gunasekara', grade: 'Grade 11', role: 'Spin Bowler' },
        { name: 'Chamika Abeywardena', grade: 'Grade 10', role: 'All-rounder' },
        { name: 'Ruwan Dissanayake', grade: 'Grade 10', role: 'Batsman' },
        { name: 'Hasitha Karunaratne', grade: 'Grade 9', role: 'Spin Bowler' },
        { name: 'Isuru Weligama', grade: 'Grade 9', role: 'Fielder' },
        { name: 'Nadeesha Perera', grade: 'Grade 9', role: 'All-rounder' },
        { name: 'Chathura Ekanayake', grade: 'Grade 12', role: 'Fielder' },
      ],
      events: [
        { title: 'Practice Match vs. Royal College', date: 'Jul 26, 2026, 3:30 PM', location: 'Main Cricket Ground', type: 'Match', result: 'Won by 42 runs' },
        { title: 'Zonal Tournament — Round 1', date: 'Aug 2, 2026, 9:00 AM', location: 'District Sports Complex', type: 'Tournament', result: null },
        { title: 'Inter-house Cricket Sixes', date: 'Aug 15, 2026, 2:00 PM', location: 'Main Cricket Ground', type: 'Match', result: null },
      ],
    },
    {
      id: 'debating', title: 'Debating Society', type: 'club', categoryLabel: 'Academic Club',
      enrolled: false, iconName: 'mic', gradient: 'linear-gradient(135deg, #274448, #1c3639)',
      teacher: 'Mr. Chaminda Weerasinghe', phone: null, email: null,
      schedule: 'Every Wednesday, 2:00 – 3:30 PM', location: 'Room B12',
      description: 'The Debating Society sharpens public speaking, critical thinking and argumentation skills through weekly practice debates, workshops and inter-school competitions.',
      achievements: ['Runners-up, National Schools Debate Championship 2025'],
    },
    {
      id: 'chess', title: 'Chess Club', type: 'sport', categoryLabel: 'Mental Sport',
      enrolled: false, iconName: 'grid', gradient: 'linear-gradient(135deg, #5c4a2e, #1c3639)',
      teacher: 'Ms. Dilani Fernando', phone: null, email: null,
      schedule: 'Mondays & Fridays, 3:00 – 4:30 PM', location: 'Library Annex',
      description: 'Weekly sessions covering openings, tactics and endgame theory, with friendly matches and an annual inter-house chess tournament.',
      achievements: [],
    },
    {
      id: 'orchestra', title: 'Orchestra & Choir', type: 'club', categoryLabel: 'Performing Arts',
      enrolled: false, iconName: 'music', gradient: 'linear-gradient(135deg, #5e1917, #1c3639)',
      teacher: 'Dr. Malini Peiris', phone: null, email: null,
      schedule: 'Every Saturday, 9:00 AM – 12:00 PM', location: 'Music Hall',
      description: 'Open to both instrumentalists and singers, the Orchestra & Choir performs at school assemblies, concerts and the annual founder\u2019s day ceremony.',
      achievements: ['Best Ensemble, Inter-school Music Festival 2024'],
    },
    {
      id: 'basketball', title: 'Basketball Team', type: 'sport', categoryLabel: 'Team Sport',
      enrolled: false, iconName: 'ball', gradient: 'linear-gradient(135deg, #c97f2e, #1c3639)',
      teacher: 'Mr. Nadun Jayasuriya', phone: null, email: null,
      schedule: 'Mon, Wed & Fri, 4:00 – 5:30 PM', location: 'Indoor Courts',
      description: 'Competitive training for the school\u2019s basketball team, with conditioning, skills drills and scrimmage matches ahead of the inter-school league.',
      achievements: [],
    },
    {
      id: 'art', title: 'Art & Design Club', type: 'club', categoryLabel: 'Creative Arts',
      enrolled: true, iconName: 'palette', gradient: 'linear-gradient(135deg, #7fa9b8, #274448)',
      teacher: 'Mrs. Sanduni Gunawardena', phone: '+94 71 456 7890', email: 's.gunawardena@lecoleschool.edu',
      schedule: 'Every Thursday, 2:30 – 4:00 PM', location: 'Art Studio',
      enrolledSince: 'Grade 8',
      description: 'A creative space for painting, sketching, mural work and design projects, culminating in an annual exhibition of student artwork.',
      achievements: ['Best Mural, Inter-school Art Fest 2025'],
    },
    {
      id: 'swimming', title: 'Swimming Squad', type: 'sport', categoryLabel: 'Aquatics',
      enrolled: false, iconName: 'droplet', gradient: 'linear-gradient(135deg, #2b4e63, #1c3639)',
      teacher: 'Mr. Ishan Rodrigo', phone: null, email: null,
      schedule: 'Tuesdays & Thursdays, 6:00 – 7:30 AM', location: 'School Pool',
      description: 'Early-morning squad training focused on stroke technique, endurance and race starts, preparing swimmers for inter-school galas.',
      achievements: [],
    },
    {
      id: 'robotics', title: 'Robotics Club', type: 'club', categoryLabel: 'STEM Club',
      enrolled: false, iconName: 'cpu', gradient: 'linear-gradient(135deg, #3a5a5e, #1c3639)',
      teacher: 'Mr. Kasun Fonseka', phone: null, email: null,
      schedule: 'Every Tuesday, 3:00 – 4:30 PM', location: 'Tech Lab 2',
      description: 'Students design, build and program robots for inter-school robotics challenges, learning electronics, mechanics and coding along the way.',
      achievements: ['Finalist, National Schools Robotics Challenge 2025'],
    },
  ];

  // per-activity mutable "interested" state (simulates a join request being sent)
  const scInterestState = {};

  // ---- filter state ----
  const scFilters = { type: 'all', search: '', enrolledOnly: false, categories: new Set() };

  // ---- DOM refs ----
  const scBrowseView   = document.getElementById('sc-browse-view');
  const scDetailView    = document.getElementById('sc-detail-view');
  const scGridEl        = document.getElementById('sc-grid');
  const scEmptyEl       = document.getElementById('sc-empty');

  // the student currently signed in — used to personalize the roster/schedule view
  const CURRENT_STUDENT_NAME = 'Jason Perera';
  const SC_MONTH_ABBR = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
  const SC_MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const SC_MONTH_ABBR_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  // mini schedule-calendar state, scoped to whichever rich club detail page is open
  let scCalYear = null, scCalMonth = null, scCalSelectedKey = null;
  const scSearchInput   = document.getElementById('sc-search-input');
  const scTabsEl        = document.getElementById('sc-tabs');
  const scFilterBtn     = document.getElementById('sc-filter-btn');
  const scFilterPanel   = document.getElementById('sc-filter-panel');
  const scFilterCount   = document.getElementById('sc-filter-count');
  const scFilterEnrolled= document.getElementById('sc-filter-enrolled');
  const scFilterCatsEl  = document.getElementById('sc-filter-categories');
  const scFilterReset   = document.getElementById('sc-filter-reset');
  const scFilterApply   = document.getElementById('sc-filter-apply');

  if(!scGridEl) return; // page markup not present, bail safely

  // build the category checkbox list once (unique categoryLabel per type available)
  function buildCategoryFilterOptions(){
    const uniqueCats = [...new Set(scActivities.map(a => a.categoryLabel))].sort();
    scFilterCatsEl.innerHTML = uniqueCats.map(cat => `
      <label class="sc-filter-check">
        <input type="checkbox" data-category="${cat}">
        ${cat}
      </label>
    `).join('');

    scFilterCatsEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if(cb.checked) scFilters.categories.add(cb.dataset.category);
        else scFilters.categories.delete(cb.dataset.category);
        updateFilterButtonState();
        renderScGrid();
      });
    });
  }

  function updateFilterButtonState(){
    const activeCount = (scFilters.enrolledOnly ? 1 : 0) + scFilters.categories.size;
    scFilterBtn.classList.toggle('active', activeCount > 0);
    if(activeCount > 0){
      scFilterCount.hidden = false;
      scFilterCount.textContent = activeCount;
    } else {
      scFilterCount.hidden = true;
    }
  }

  function getFilteredActivities(){
    const q = scFilters.search.trim().toLowerCase();
    const targetIds = new Set(['cricket', 'debating', 'basketball']);
    return scActivities.filter(a => {
      if(!targetIds.has(a.id)) return false;
      if(scFilters.type !== 'all' && a.type !== scFilters.type) return false;
      if(scFilters.enrolledOnly && !a.enrolled) return false;
      if(scFilters.categories.size > 0 && !scFilters.categories.has(a.categoryLabel)) return false;
      if(q){
        const haystack = `${a.title} ${a.teacher} ${a.categoryLabel}`.toLowerCase();
        if(!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => (b.enrolled === true) - (a.enrolled === true));
  }

  function renderBadge(activity){
    if(activity.enrolled){
      return `<span class="sc-badge sc-badge-enrolled"><span class="sc-badge-dot"></span>Enrolled</span>`;
    }
    if(activity.type === 'club'){
      return `<span class="sc-badge sc-badge-club">Club</span>`;
    }
    return `<span class="sc-badge sc-badge-sport">Sport</span>`;
  }

  function renderActionButton(activity){
    if(activity.enrolled){
      return `
        <button class="sc-btn sc-btn-view" data-action="view" data-id="${activity.id}" type="button">
          View Details ${icon('arrow')}
        </button>
      `;
    }

    const isRequested = scInterestState[activity.id];
    if(isRequested){
      return `
        <button class="sc-btn sc-btn-requested" data-action="none" type="button" disabled>
          Requested ${icon('check')}
        </button>
      `;
    }

    const styleClass = activity.type === 'club' ? 'sc-btn-interest-club' : 'sc-btn-interest-sport';
    return `
      <button class="sc-btn ${styleClass}" data-action="interest" data-id="${activity.id}" type="button">
        Interest ${icon('heart')}
      </button>
    `;
  }

  function renderCard(activity){
    return `
      <div class="sc-card${activity.enrolled ? ' sc-card-active' : ''}" data-id="${activity.id}">
        <div class="sc-card-media" style="background:${activity.gradient}">
          ${renderBadge(activity)}
          ${icon(activity.iconName, 'class="sc-card-icon-bg"')}
          <div class="sc-card-media-text">
            <div class="sc-card-category">${activity.categoryLabel}</div>
            <div class="sc-card-title">${activity.title}</div>
          </div>
        </div>
        <div class="sc-card-body">
          <div class="sc-teacher-box">
            <div class="sc-teacher-label">Teacher in Charge</div>
            <div class="sc-teacher-name">${activity.teacher}</div>
          </div>
          ${activity.enrolled ? `
            <div class="sc-contact-row">
              <span class="sc-contact-icon">${icon('phone')}</span>
              <span class="sc-contact-phone">${activity.phone}</span>
            </div>
          ` : `
            <div class="sc-contact-row locked">
              <span class="sc-contact-icon locked">${icon('lock')}</span>
              Coach contact hidden until enrollment
            </div>
          `}
          <div class="sc-card-actions">
            ${renderActionButton(activity)}
          </div>
        </div>
      </div>
    `;
  }

  function renderScGrid(){
    const filtered = getFilteredActivities();

    scGridEl.innerHTML = filtered.map(renderCard).join('');
    scEmptyEl.hidden = filtered.length > 0;
    scGridEl.hidden = filtered.length === 0;

    // clicking anywhere on a card opens its detail view
    scGridEl.querySelectorAll('.sc-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if(e.target.closest('[data-action]')) return; // let the button handler deal with it
        openScDetail(card.dataset.id);
      });
    });

    // "View Details" buttons
    scGridEl.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openScDetail(btn.dataset.id);
      });
    });

    // "Interest" buttons
    scGridEl.querySelectorAll('[data-action="interest"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sendInterest(btn.dataset.id);
      });
    });
  }

  function sendInterest(id){
    if(scInterestState[id]) return;
    scInterestState[id] = true;
    renderScGrid();
    // if the detail view for this activity happens to be open, refresh it too
    if(!scDetailView.hidden && scDetailView.dataset.activeId === id){
      openScDetail(id);
    }
  }

  function renderDetailInfoItem(iconName, label, value, locked){
    return `
      <div class="sc-detail-info-item">
        <span class="sc-detail-info-icon${locked ? ' locked' : ''}">${icon(iconName)}</span>
        <div>
          <div class="sc-detail-info-label">${label}</div>
          <div class="sc-detail-info-value${locked ? ' locked' : ''}">${value}</div>
        </div>
      </div>
    `;
  }

  // parses event date strings like "Jul 26, 2026, 3:30 PM" for the mini schedule calendar
  function parseEventDateTime(str){
    const m = /^([A-Za-z]{3})[a-z]*\s+(\d{1,2}),\s*(\d{4})(?:,\s*(.+))?$/.exec(str || '');
    if(!m || !(m[1] in SC_MONTH_ABBR)) return { year: 2026, month: 0, day: 1, time: '' };
    return { year: parseInt(m[3], 10), month: SC_MONTH_ABBR[m[1]], day: parseInt(m[2], 10), time: m[4] || '' };
  }

  // ---- Team & Roster — personalized to highlight the signed-in student ----
  function renderRosterSection(activity){
    if(!activity.team || !activity.team.length) return '';
    return `
      <div class="c-panel__heading-row" style="margin-bottom: 0.75rem;">
        <span class="c-panel__heading-icon">${icon('users', 20)}</span>
        <h2 class="c-panel__title c-font-display">Team &amp; Roster</h2>
      </div>
      <div class="sc-roster-card">
        <div class="sc-roster-card-header">
          <span class="sc-roster-card-title">${activity.title} Squad</span>
          <span class="sc-roster-card-count">${activity.team.length} Players</span>
        </div>
        <div class="sc-roster-list">
          ${activity.team.map(m => {
            const isYou = m.name === CURRENT_STUDENT_NAME;
            return `
              <div class="sc-roster-item${isYou ? ' sc-roster-item-you' : ''}">
                <span class="sc-roster-avatar">${m.name.split(' ').map(n => n[0]).slice(-2).join('')}</span>
                <div class="sc-roster-info">
                  <div class="sc-roster-name-row">
                    <span class="sc-roster-name">${m.name}</span>
                    ${isYou ? '<span class="sc-roster-you-tag">YOU</span>' : ''}
                  </div>
                  <div class="sc-roster-grade">${m.grade || ''}</div>
                </div>
                <div class="sc-roster-role">${m.role}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ---- Schedule & Events — the same dark calendar widget used on the Dashboard,
  // scoped to this activity's own events (practice matches, tournaments, etc.) ----
  function renderScheduleSection(activity){
    if(!activity.events || !activity.events.length) return '';
    return `
      <div class="c-panel__heading-row" style="margin-bottom: 0.75rem;">
        <span class="c-panel__heading-icon">${icon('calendar', 20)}</span>
        <h2 class="c-panel__title c-font-display">Schedule &amp; Events</h2>
      </div>
      <section class="c-calendar calendar-panel" aria-label="Schedule &amp; Events Calendar">
        <header class="c-calendar__header calendar-header">
          <div class="c-calendar__header-row">
            <div class="c-calendar__nav calendar-nav">
              <button type="button" class="c-calendar__nav-btn" id="sc-cal-prev" aria-label="Previous month">
                <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button type="button" class="c-calendar__nav-btn" id="sc-cal-next" aria-label="Next month">
                <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
            <div class="c-calendar__month-year">
              <div class="c-select c-select--month" id="sc-select-month">
                <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                  <span class="j-select-value" id="sc-cal-month-label">July</span>
                  <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="c-select__menu" role="listbox" aria-label="Choose calendar month"></div>
              </div>
              <div class="c-select c-select--year" id="sc-select-year">
                <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                  <span class="j-select-value" id="sc-cal-year-label">2026</span>
                  <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="c-select__menu" role="listbox" aria-label="Choose calendar year"></div>
              </div>
            </div>
          </div>
        </header>
        <div class="c-calendar__weekdays">
          <span class="c-calendar__weekday">MO</span>
          <span class="c-calendar__weekday">TU</span>
          <span class="c-calendar__weekday">WE</span>
          <span class="c-calendar__weekday">TH</span>
          <span class="c-calendar__weekday">FR</span>
          <span class="c-calendar__weekday">SA</span>
          <span class="c-calendar__weekday">SU</span>
        </div>
        <div class="c-calendar__days calendar-grid" id="sc-cal-grid"></div>
        <footer class="c-calendar__footer calendar-day-detail">
          <div class="c-calendar__footer-row cal-detail-summary">
            <span class="c-calendar__event-count cal-detail-count" id="sc-cal-detail-count">SELECT A DATE</span>
            <button type="button" class="c-calendar__view-all-btn cal-detail-viewall" id="sc-cal-view-all">VIEW ALL</button>
          </div>
          <div class="c-calendar__day-detail cal-detail-events" id="sc-cal-detail-events"></div>
        </footer>
      </section>
    `;
  }

  function initScCalendar(activity){
    const events = activity.events.map(ev => ({ ...ev, ...parseEventDateTime(ev.date) }));
    const todayTs = new Date().setHours(0, 0, 0, 0);
    const focus = events.find(e => new Date(e.year, e.month, e.day).getTime() >= todayTs) || events[events.length - 1];
    scCalYear = focus.year;
    scCalMonth = focus.month;
    scCalSelectedKey = `${focus.year}-${focus.month + 1}-${focus.day}`;
    renderScMiniCalendar(activity);
  }

  function renderScMiniCalendar(activity){
    const calGridEl = document.getElementById('sc-cal-grid');
    const calLabelEl = document.getElementById('sc-cal-month-label');
    const calCountEl = document.getElementById('sc-cal-detail-count');
    const calEventsEl = document.getElementById('sc-cal-detail-events');
    if(!calGridEl) return;

    const events = activity.events.map(ev => ({ ...ev, ...parseEventDateTime(ev.date) }));
    const eventsByKey = {};
    events.forEach(ev => {
      const key = `${ev.year}-${ev.month + 1}-${ev.day}`;
      (eventsByKey[key] = eventsByKey[key] || []).push(ev);
    });

    calLabelEl.textContent = `${SC_MONTH_NAMES[scCalMonth]} ${scCalYear}`;

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    const rawFirstDay = new Date(scCalYear, scCalMonth, 1).getDay();
    const firstDay = (rawFirstDay + 6) % 7; // Monday = 0, Sunday = 6
    const daysInMonth = new Date(scCalYear, scCalMonth + 1, 0).getDate();

    const monthValEl = document.getElementById('sc-cal-month-label');
    const yearValEl = document.getElementById('sc-cal-year-label');
    if (monthValEl) monthValEl.textContent = SC_MONTH_NAMES[scCalMonth];
    if (yearValEl) yearValEl.textContent = String(scCalYear);

    // Populate dropdown menus
    const monthSelectRoot = document.getElementById('sc-select-month');
    if (monthSelectRoot) {
      const menuEl = monthSelectRoot.querySelector('.c-select__menu');
      if (menuEl) {
        menuEl.innerHTML = SC_MONTH_NAMES.map((name, idx) => `<button type="button" class="c-select__option ${idx === scCalMonth ? 'c-is-selected' : ''}" data-value="${idx}" role="option"><span>${name}</span></button>`).join('');
        menuEl.querySelectorAll('.c-select__option').forEach(opt => {
          opt.onclick = (e) => {
            e.stopPropagation();
            scCalMonth = Number(opt.dataset.value);
            renderScMiniCalendar(activity);
            monthSelectRoot.classList.remove('c-is-open', 'c-is-menu-visible');
          };
        });
      }
      const triggerBtn = monthSelectRoot.querySelector('.c-select__trigger');
      if (triggerBtn) {
        triggerBtn.onclick = (e) => {
          e.stopPropagation();
          const isOpen = monthSelectRoot.classList.contains('c-is-open');
          document.querySelectorAll('.c-select').forEach(s => s.classList.remove('c-is-open', 'c-is-menu-visible'));
          if (!isOpen) {
            monthSelectRoot.classList.add('c-is-open');
            requestAnimationFrame(() => monthSelectRoot.classList.add('c-is-menu-visible'));
          }
        };
      }
    }

    const yearSelectRoot = document.getElementById('sc-select-year');
    if (yearSelectRoot) {
      const menuEl = yearSelectRoot.querySelector('.c-select__menu');
      if (menuEl) {
        const YEARS = [2024, 2025, 2026, 2027, 2028];
        menuEl.innerHTML = YEARS.map(yr => `<button type="button" class="c-select__option ${yr === scCalYear ? 'c-is-selected' : ''}" data-value="${yr}" role="option"><span>${yr}</span></button>`).join('');
        menuEl.querySelectorAll('.c-select__option').forEach(opt => {
          opt.onclick = (e) => {
            e.stopPropagation();
            scCalYear = Number(opt.dataset.value);
            renderScMiniCalendar(activity);
            yearSelectRoot.classList.remove('c-is-open', 'c-is-menu-visible');
          };
        });
      }
      const triggerBtn = yearSelectRoot.querySelector('.c-select__trigger');
      if (triggerBtn) {
        triggerBtn.onclick = (e) => {
          e.stopPropagation();
          const isOpen = yearSelectRoot.classList.contains('c-is-open');
          document.querySelectorAll('.c-select').forEach(s => s.classList.remove('c-is-open', 'c-is-menu-visible'));
          if (!isOpen) {
            yearSelectRoot.classList.add('c-is-open');
            requestAnimationFrame(() => yearSelectRoot.classList.add('c-is-menu-visible'));
          }
        };
      }
    }

    let cellsHtml = '';
    for(let i = 0; i < firstDay; i++){
      cellsHtml += `<div class="c-calendar__day-blank"></div>`;
    }
    for(let day = 1; day <= daysInMonth; day++){
      const key = `${scCalYear}-${scCalMonth + 1}-${day}`;
      const hasEvts = !!eventsByKey[key];
      const isSel = (key === scCalSelectedKey);
      cellsHtml += `
        <button type="button" class="c-calendar__day ${hasEvts ? 'c-has-events' : ''} ${isSel ? 'c-is-selected' : ''}" data-key="${key}">
          <span style="line-height:1">${day}</span>
          ${hasEvts && !isSel ? '<span class="c-calendar__day-dot" aria-hidden="true"></span>' : ''}
        </button>`;
    }
    calGridEl.innerHTML = cellsHtml;

    const selectedEvents = scCalSelectedKey ? (eventsByKey[scCalSelectedKey] || []) : [];
    if(!scCalSelectedKey || !selectedEvents.length){
      const dateLabel = scCalSelectedKey
        ? `${SC_MONTH_NAMES[Number(scCalSelectedKey.split('-')[1]) - 1]} ${scCalSelectedKey.split('-')[2]}`
        : `${SC_MONTH_NAMES[scCalMonth]} ${scCalYear}`;
      calCountEl.textContent = '0 EVENTS SCHEDULED';
      calEventsEl.innerHTML = `
        <div class="c-calendar__empty-day">
          <p style="color:rgba(255,255,255,0.7); font-size:0.875rem; margin:0; text-align:center;">No events scheduled for ${dateLabel}.</p>
        </div>`;
    } else {
      calCountEl.textContent = `${selectedEvents.length} EVENT${selectedEvents.length > 1 ? 'S' : ''} SCHEDULED`;
      const [, m, d] = scCalSelectedKey.split('-').map(Number);
      const dateLabel = `${SC_MONTH_ABBR_SHORT[m - 1]} ${d}`;
      const visibleEvents = selectedEvents.slice(0, 2);
      calEventsEl.innerHTML = `
        <div class="c-calendar__day-events">
          ${visibleEvents.map(ev => `
            <article class="c-day-event-card">
              <p class="c-day-event-card__eyebrow">${dateLabel} · ${(ev.type || 'EVENT').toUpperCase()}${ev.time ? ' · ' + ev.time : ''}</p>
              <h3 class="c-day-event-card__title">${ev.title}</h3>
              <p class="c-day-event-card__details">${ev.result ? 'Result: ' + ev.result : (ev.location || '')}</p>
            </article>
          `).join('')}
          ${visibleEvents.length === 1 ? `
            <div class="c-calendar__no-more-events">
              <span>No more events scheduled for this day</span>
            </div>
          ` : ''}
        </div>`;
    }

    calGridEl.querySelectorAll('.c-calendar__day').forEach(day => {
      day.addEventListener('click', () => {
        scCalSelectedKey = day.dataset.key;
        renderScMiniCalendar(activity);
      });
    });

    const viewAllBtn = document.getElementById('sc-cal-view-all');
    if (viewAllBtn) {
      viewAllBtn.onclick = () => {
        const scLayer = document.getElementById('j-modal-sc-day-schedule');
        const scTitle = document.getElementById('j-sc-day-schedule-title');
        const scDesc  = document.getElementById('j-sc-day-schedule-description');
        const scBody  = document.getElementById('j-sc-day-schedule-body');
        const scEyebrow = document.getElementById('j-sc-day-schedule-eyebrow');

        if (!scLayer) return;

        if (scEyebrow) scEyebrow.textContent = `${(activity.title || 'ACTIVITY').toUpperCase()} SCHEDULE`;

        const events = activity.events.map(ev => ({ ...ev, ...parseEventDateTime(ev.date) }));
        const eventsByKey = {};
        events.forEach(ev => {
          const key = `${ev.year}-${ev.month + 1}-${ev.day}`;
          (eventsByKey[key] = eventsByKey[key] || []).push(ev);
        });

        let targetEvents = [];
        let dateStr = '';

        if (scCalSelectedKey) {
          const [y, m, d] = scCalSelectedKey.split('-').map(Number);
          const selDate = new Date(y, m - 1, d);
          dateStr = `${SC_MONTH_NAMES[m - 1]} ${d}, ${y}`;
          targetEvents = eventsByKey[scCalSelectedKey] || [];
        } else {
          dateStr = `${SC_MONTH_NAMES[scCalMonth]} ${scCalYear}`;
          targetEvents = events;
        }

        if (scTitle) scTitle.textContent = dateStr;
        if (scDesc) scDesc.textContent = `${targetEvents.length} event${targetEvents.length === 1 ? '' : 's'} scheduled for ${activity.title}.`;

        if (scBody) {
          if (targetEvents.length) {
            scBody.innerHTML = `<ol class="c-day-schedule__list">${targetEvents.map((ev, i) => `
              <li class="c-day-schedule__item" style="animation-delay:${i * 35}ms">
                <div class="c-day-schedule__item-top">
                  <div>
                    <p class="c-day-schedule__time">
                      <svg class="c-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      ${ev.time || 'All Day'}
                    </p>
                    <h3 class="c-day-schedule__title">${ev.title}</h3>
                  </div>
                  <span class="c-day-schedule__type">${(ev.type || activity.categoryLabel || 'EVENT').toUpperCase()}</span>
                </div>
                ${(ev.result || ev.location) ? `<p class="c-day-schedule__details">
                  <svg class="c-icon c-day-schedule__details-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>${ev.result ? 'Result: ' + ev.result : ev.location}</span>
                </p>` : ''}
              </li>`).join('')}</ol>`;
          } else {
            scBody.innerHTML = `
              <div class="c-day-schedule__empty">
                <span class="c-day-schedule__empty-icon" aria-hidden="true">
                  <svg class="c-icon" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                </span>
                <h3 class="c-day-schedule__empty-title">No events scheduled</h3>
                <p class="c-day-schedule__empty-text">No events found for ${dateStr}.</p>
              </div>`;
          }
        }

        scLayer.classList.add('c-is-open');
      };
    }

    document.getElementById('sc-cal-prev').onclick = () => {
      scCalMonth--;
      if(scCalMonth < 0){ scCalMonth = 11; scCalYear--; }
      renderScMiniCalendar(activity);
    };
    document.getElementById('sc-cal-next').onclick = () => {
      scCalMonth++;
      if(scCalMonth > 11){ scCalMonth = 0; scCalYear++; }
      renderScMiniCalendar(activity);
    };

    alignRosterListHeight();
  }

  // ---- Notice Board — card grid ----
  function renderNoticeBoardSection(activity){
    if(!activity.noticeBoard || !activity.noticeBoard.length) return '';
    const cats = ['Extracurricular', 'Academic', 'General'];
    return `
      <div class="c-panel__heading-row" style="margin-bottom: 0.75rem;">
        <span class="c-panel__heading-icon">${icon('bell', 20)}</span>
        <h2 class="c-panel__title c-font-display">Notice Board</h2>
      </div>
      <div class="c-notice-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        ${activity.noticeBoard.map((n, i) => {
          const cat = cats[i % cats.length];
          const initials = n.author ? n.author.split(' ').map(w => w[0]).slice(0,2).join('') : 'ED';
          return `
            <div class="c-notice-card" data-category="${cat}">
              <div class="c-notice-card__tags">
                <span class="c-tag">${cat}</span>
                <span class="c-tag">${activity.title}</span>
              </div>
              <h3 class="c-notice-card__title">${n.title}</h3>
              <p class="c-notice-card__body">${n.body}</p>
              <div class="c-notice-card__footer">
                <div class="c-notice-card__author">
                  <span class="c-avatar">${initials}</span>
                  <div>
                    <p class="c-notice-card__author-name">${n.author || 'School Admin'}</p>
                    <p class="c-notice-card__date">${n.date.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ---- Achievements & Gallery — merged; supports both the simple string-list
  // format (most clubs) and the richer card format (clubs with a full roster) ----
  function renderAchievementsGallerySection(activity){
    const achievements = (activity.achievements || []).filter(a => typeof a === 'object' || typeof a === 'string');
    const twoAchvs = achievements.slice(0, 2);

    return `
      <section class="c-panel" style="margin-bottom: 1.25rem;">
        <div class="c-panel__heading-row" style="margin-bottom: 1rem;">
          <span class="c-panel__heading-icon">${icon('medal', 20)}</span>
          <h2 class="c-panel__title c-font-display">Achievements &amp; Gallery</h2>
        </div>
        <div class="c-achv-grid">
          ${twoAchvs.map((a, i) => {
            const title = typeof a === 'string' ? a : a.title;
            const year = typeof a === 'string' ? '2025' : (a.year || '2025');
            const level = (typeof a === 'object' && a.tags) ? a.tags[0] : 'Zonal';
            const kind = (typeof a === 'object' && a.tags) ? a.tags[1] : 'Team';
            return `
              <div class="c-achv-card j-activity-achv-card" data-ach-idx="${i}" style="cursor: pointer;">
                <div class="c-achv-card__media-empty">
                  ${icon('trophy', 28)}
                </div>
                <div class="c-achv-card__body">
                  <div class="c-achv-card__row">
                    <span class="c-achv-card__title">${title}</span>
                    <span class="c-achv-card__year">${year}</span>
                  </div>
                  <div class="c-achv-card__tags">
                    <span class="c-achv-card__level">${level}</span>
                    <span class="c-achv-card__dot">•</span>
                    <span class="c-achv-card__kind">${kind}</span>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderTeacherCoachSection(activity){
    const teacherAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces';
    const email = activity.email || 'a.silva@lecoleschool.edu';
    const phone = activity.phone || '+94 77 123 4567';

    return `
      <section class="c-panel" style="margin-bottom: 1.25rem;">
        <div class="c-staff-grid c-staff-grid--two" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
          <article class="c-staff-card">
            <div class="c-staff-card__header">
              <h2 class="c-staff-card__role">Teacher in Charge</h2>
            </div>
            <div class="c-staff-card__person">
              <img src="${teacherAvatar}" alt="${activity.teacher}" />
              <div>
                <p class="c-staff-card__name">${activity.teacher}</p>
                <p class="c-staff-card__specialty">Teacher in Charge</p>
              </div>
            </div>
            <div class="c-staff-card__contact">
              <p class="c-staff-card__contact-row">${icon('mail', 14)}<span>${email}</span></p>
              <p class="c-staff-card__contact-row">${icon('phone', 14)}<span>${phone}</span></p>
            </div>
          </article>

          <article class="c-staff-card">
            <div class="c-staff-card__header">
              <h2 class="c-staff-card__role">Coach / Instructor</h2>
            </div>
            <div class="c-staff-card__person">
              <img src="${teacherAvatar}" alt="${activity.teacher}" />
              <div>
                <p class="c-staff-card__name">${activity.teacher}</p>
                <p class="c-staff-card__specialty">${activity.teacherTitle || 'Level 2 Coaching Cert. — Sri Lanka Cricket'}</p>
              </div>
            </div>
            <div class="c-staff-card__contact">
              <p class="c-staff-card__contact-row">${icon('mail', 14)}<span>${email}</span></p>
              <p class="c-staff-card__contact-row">${icon('phone', 14)}<span>${phone}</span></p>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  // Sizes the roster list's scroll area so the roster card's bottom edge lines
  // up with the calendar's bottom edge, without resizing the calendar itself
  // and without losing the roster list's own scrollbar.
  function alignRosterListHeight(){
    const grid = scDetailView.querySelector('.sc-roster-calendar-grid');
    if(!grid) return;
    const calendarPanel = grid.querySelector('.calendar-panel');
    const rosterHeader = grid.querySelector('.sc-roster-card-header');
    const rosterList = grid.querySelector('.sc-roster-list');
    if(!calendarPanel || !rosterHeader || !rosterList) return;

    const calendarHeight = calendarPanel.getBoundingClientRect().height;
    const headerHeight = rosterHeader.getBoundingClientRect().height;
    const available = calendarHeight - headerHeight - 2; // minus the roster card's 1px top+bottom border
    rosterList.style.maxHeight = `${Math.max(available, 120)}px`;
  }

  function openScDetail(id){
    const activity = scActivities.find(a => a.id === id);
    if(!activity) return;

    scDetailView.dataset.activeId = id;

    // clubs with a full team roster get the richer, personalized layout;
    // everything else keeps the simpler single-column view
    const isRich = !!(activity.team && activity.team.length);

    const teacherBioHtml = activity.teacherBio ? `<p class="sc-detail-teacher-bio">${activity.teacherBio}</p>` : '';

    const contactInfoHtml = activity.enrolled ? `
      ${renderDetailInfoItem('phone', 'Coach Contact', activity.phone)}
      ${renderDetailInfoItem('mail', 'Email', activity.email)}
    ` : `
      ${renderDetailInfoItem('lock', 'Coach Contact', 'Hidden until enrollment', true)}
    `;

    const actionHtml = activity.enrolled
      ? `<div class="sc-detail-info-item"><span class="sc-detail-info-icon">${icon('check')}</span><div><div class="sc-detail-info-label">Status</div><div class="sc-detail-info-value">Enrolled since ${activity.enrolledSince}</div></div></div>`
      : renderActionButton(activity);

    // rich (team-based) activities: Team & Roster sits next to the Schedule & Events
    // calendar, matched to the same height the same way the Dashboard lines up its
    // calendar with the performance chart beside it. Notice Board, Details and
    // Status/enrollment follow underneath as their own row.
    const rosterCalendarGridHtml = isRich ? `
      <div class="sc-roster-calendar-grid">
        <div>${renderRosterSection(activity)}</div>
        <div>${renderScheduleSection(activity)}</div>
      </div>
    ` : '';

    const bodyHtml = isRich ? `
      ${renderNoticeBoardSection(activity)}
      <div class="sc-notice-grid">
        <div class="sc-notice-card sc-notice-card-teal">
          <div class="sc-notice-card-title">Details</div>
          <div class="sc-detail-info-list">
            ${renderDetailInfoItem('clock', 'Schedule', activity.schedule)}
            ${renderDetailInfoItem('pin', 'Location', activity.location)}
          </div>
        </div>
        <div class="sc-notice-card sc-notice-card-orange">
          <div class="sc-notice-card-title">Status</div>
          ${activity.enrolled ? `
            <div class="sc-detail-info-list">
              ${renderDetailInfoItem('check', 'Enrolled Since', activity.enrolledSince)}
              ${activity.enrolledDate ? renderDetailInfoItem('calendar', 'Enrollment Date', activity.enrolledDate) : ''}
            </div>
          ` : actionHtml}
        </div>
      </div>
    ` : `
      <p class="sc-detail-desc">${activity.description}</p>
      ${renderAchievementsGallerySection(activity)}
    `;

    // full-width panels, sit above the two-column grid, in this order:
    // Achievements & Gallery, then Teacher in Charge / Coach & Instructor
    const topFullWidthHtml = isRich ? `
      <div class="sc-detail-side-card sc-fullwidth-panel">
        ${renderAchievementsGallerySection(activity)}
      </div>
      ${renderTeacherCoachSection(activity)}
    ` : '';

    const sideHtml = isRich ? '' : `
      <div class="sc-detail-side-card">
        <div class="sc-detail-section-title">Details</div>
        <div class="sc-detail-info-list">
          ${renderDetailInfoItem('users', 'Teacher in Charge', activity.teacher)}
          ${renderDetailInfoItem('clock', 'Schedule', activity.schedule)}
          ${renderDetailInfoItem('pin', 'Location', activity.location)}
          ${contactInfoHtml}
        </div>
        ${teacherBioHtml}
      </div>
      <div class="sc-detail-side-card sc-detail-actions">
        ${actionHtml}
      </div>
    `;

    scDetailView.innerHTML = `
      <button class="sc-detail-back" id="sc-back-btn" type="button">${icon('back')} Back to Sports &amp; Clubs</button>

      <div class="sc-detail-hero" style="background:${activity.gradient}">
        ${icon(activity.iconName, 'class="sc-detail-hero-icon-bg"')}
        <div class="sc-detail-hero-text">
          <div class="sc-detail-hero-category">${activity.type ? activity.type.toUpperCase() + ' • ' : ''}${activity.categoryLabel.toUpperCase()}</div>
          <div class="sc-detail-hero-title">${activity.title}</div>
        </div>
        <div class="sc-detail-hero-badge">${renderBadge(activity)}</div>
      </div>

      ${topFullWidthHtml}

      ${rosterCalendarGridHtml}

      ${isRich ? `
        <div>${bodyHtml}</div>
      ` : `
        <div class="sc-detail-grid">
          <div>
            ${bodyHtml}
          </div>

          <div>
            ${sideHtml}
          </div>
        </div>
      `}
    `;

    document.getElementById('sc-back-btn').addEventListener('click', closeScDetail);

    // Attach click listeners to Sports & Clubs Detail achievement cards
    scDetailView.querySelectorAll('.j-activity-achv-card').forEach(card => {
      card.onclick = () => {
        const idx = Number(card.dataset.achIdx);
        const item = activity.achievements && activity.achievements[idx];
        if (item) {
          openScAchievementPage({
            id: 'sc-' + idx,
            title: item.title,
            categoryLabel: activity.title,
            year: item.year,
            date: `${item.year}`,
            place: item.tags ? item.tags[0] : '1st Place / Winners',
            level: item.tags ? item.tags[1] : 'Inter-School / Regional',
            description: `${item.title} was officially earned by ${activity.title} during the ${item.year} season.`
          });
        }
      };
    });

    const interestBtn = scDetailView.querySelector('[data-action="interest"]');
    if(interestBtn){
      interestBtn.addEventListener('click', () => sendInterest(activity.id));
    }

    if(isRich && activity.events && activity.events.length){
      initScCalendar(activity);
    }

    scBrowseView.hidden = true;
    scDetailView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

    if(isRich){
      requestAnimationFrame(alignRosterListHeight);
    }
  }

  function closeScDetail(){
    scDetailView.hidden = true;
    scBrowseView.hidden = false;
    delete scDetailView.dataset.activeId;
  }

  function openScAchievementPage(ach) {
    const scAchievementView = document.getElementById('sc-achievement-view');
    if (!scAchievementView) return;

    scDetailView.hidden = true;
    scAchievementView.hidden = false;

    const eventTitle = ach.title || 'Achievement Record';
    const place = ach.place || (ach.tags ? ach.tags[0] : '1st Place / Winners');
    const level = ach.level || (ach.tags ? ach.tags[1] : 'Inter-School / Regional');
    const year = ach.year || 2025;
    const eventDate = ach.date || `${year}`;
    const venue = ach.venue || 'School Grounds / Main Arena';
    const description = ach.description || `${eventTitle} was officially recognised during the ${year} season as a ${level.toLowerCase()} achievement.`;
    const details = ach.details || '';
    const tournament = ach.tournament || eventTitle;
    const organisedBy = ach.organisedBy || 'Western Province Schools Association';
    const award = ach.award || 'Gold Medal / Trophy';
    const representing = ach.representing || 'Team A (Senior)';
    const ageGroup = ach.ageGroup || 'Under 19';
    const participants = ach.participants || ['Jason Perera (Capt)', 'Ravindu Jayasekara', 'Dinuka Wickramasinghe', 'Tharindu Madushan', 'Sachintha Bandara'];
    const defaultGallery = [
      { image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80', caption: `${eventTitle} - Match action` },
      { image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80', caption: `${eventTitle} - Team celebration` },
      { image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600&auto=format&fit=crop&q=80', caption: `${eventTitle} - Award presentation` }
    ];
    const galleryList = (ach.gallery && ach.gallery.length) ? ach.gallery : defaultGallery;

    scAchievementView.innerHTML = `
      <div class="c-view" style="margin-top: 10px;">
        <div style="margin-bottom: 1.25rem;">
          <button type="button" class="sc-detail-back" id="sc-ach-back-btn">${icon('back')} Back</button>
        </div>
        <article class="c-achv-article">
          <header class="c-achv-hero">
            <div class="c-achv-hero__chips">
              <span class="c-chip c-chip--sunshine">${place}</span>
              <span class="c-chip c-chip--sky">${level}</span>
              <span class="c-chip c-chip--sand">${year}</span>
            </div>
            <h1 class="c-achv-hero__title c-font-display">${eventTitle}</h1>
            <p class="c-achv-hero__meta">
              ${icon('calendar', 16)} <span>${eventDate}</span>
              <span aria-hidden="true">·</span>
              ${icon('pin', 16)} <span>${venue}</span>
            </p>
          </header>
          <div class="c-achv-body">
            <section class="c-achv-summary">
              <p>${description}</p>
              ${details ? `<p>${details}</p>` : ''}
            </section>
            <section>
              <div class="c-section-heading">
                <svg class="c-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AF5031" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                <h2>Event information</h2>
              </div>

              <div class="c-fact-grid">
                <ul>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Tournament / event</p><p class="c-fact-item__value">${tournament}</p></div></li>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Date</p><p class="c-fact-item__value">${eventDate}</p></div></li>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Venue</p><p class="c-fact-item__value">${venue}</p></div></li>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Scope / level</p><p class="c-fact-item__value">${level}</p></div></li>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Age group</p><p class="c-fact-item__value">${ageGroup}</p></div></li>
                </ul>
                <ul>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Organised by</p><p class="c-fact-item__value">${organisedBy}</p></div></li>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Position / result</p><p class="c-fact-item__value">${place}</p></div></li>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Award / medal</p><p class="c-fact-item__value">${award}</p></div></li>
                  <li class="c-fact-item"><span class="c-fact-item__dot"></span><div><p class="c-fact-item__label">Representing</p><p class="c-fact-item__value">${representing}</p></div></li>
                </ul>
              </div>
            </section>
            <section class="c-participants-panel">
              <div class="c-participants-panel__top">
                <h2 class="c-participants-panel__heading">
                  <svg class="c-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Participants
                </h2>
                <span class="c-participants-panel__count">${participants.length}</span>
              </div>
              <ul class="c-participants-grid">
                ${participants.map(p => `<li class="c-participant"><span class="c-participant__dot"></span>${p}</li>`).join('')}
              </ul>
            </section>
            <section>
              <div class="c-section-heading">
                <svg class="c-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AF5031" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <h2>Event gallery</h2>
              </div>
              <div class="c-gallery-grid">
                ${galleryList.map(g => `
                  <div class="c-gallery-item">
                    ${typeof g === 'string' ? `<img src="${g}" alt="Event gallery photo" />` : (g.image ? `<img src="${g.image}" alt="${g.caption || 'Event gallery photo'}" />` : `<div style="padding:1rem;font-size:12px;color:rgba(15,65,74,0.6);">${g.caption || 'Event photo'}</div>`)}
                  </div>
                `).join('')}
              </div>
            </section>
          </div>
        </article>
      </div>
    `;

    document.getElementById('sc-ach-back-btn').addEventListener('click', () => {
      scAchievementView.hidden = true;
      scDetailView.hidden = false;
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    });

    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  window.addEventListener('resize', () => {
    if(!scDetailView.hidden && scDetailView.querySelector('.sc-roster-calendar-grid')){
      alignRosterListHeight();
    }
  });

  // ---- wire up toolbar controls ----
  scSearchInput.addEventListener('input', (e) => {
    scFilters.search = e.target.value;
    renderScGrid();
  });

  scTabsEl.querySelectorAll('.sc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      scFilters.type = tab.dataset.type;
      scTabsEl.querySelectorAll('.sc-tab').forEach(t => t.classList.toggle('active', t === tab));
      renderScGrid();
    });
  });

  scFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    scFilterPanel.hidden = !scFilterPanel.hidden;
  });

  scFilterPanel.addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('click', () => {
    scFilterPanel.hidden = true;
  });

  scFilterEnrolled.addEventListener('change', () => {
    scFilters.enrolledOnly = scFilterEnrolled.checked;
    updateFilterButtonState();
    renderScGrid();
  });

  scFilterReset.addEventListener('click', () => {
    scFilters.enrolledOnly = false;
    scFilters.categories.clear();
    scFilterEnrolled.checked = false;
    scFilterCatsEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    updateFilterButtonState();
    renderScGrid();
  });

  scFilterApply.addEventListener('click', () => {
    scFilterPanel.hidden = true;
  });

  buildCategoryFilterOptions();
  renderScGrid();

})();

/* ---------------------------------------------------------
     8. CHARACTER CERTIFICATE PAGE
     --------------------------------------------------------- */
(function(){
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#cert-download-btn, .export-btn');
    if (btn) {
      e.preventDefault();
      window.print();
    }
  });
})();

/* ---------------------------------------------------------
     8b. MISSING RECORD REQUEST MODAL
     --------------------------------------------------------- */
(function(){
  const formOverlay = document.getElementById('mrr-overlay');
  const successOverlay = document.getElementById('mrr-success-overlay');

  const formCloseBtn = document.getElementById('mrr-close');
  const formCancelBtn = document.getElementById('mrr-cancel-btn');
  const formSubmitBtn = document.getElementById('mrr-submit-btn');
  const formEl = document.getElementById('mrr-form');

  const successDoneBtn = document.getElementById('mrr-done-btn');
  const refEl = document.getElementById('mrr-ref');
  const successTextEl = document.getElementById('mrr-success-text');

  const typeInput = document.getElementById('mrr-type');
  const typeTrigger = document.getElementById('mrr-type-trigger');
  const typeMenu = document.getElementById('mrr-type-menu');
  const typeLabel = document.getElementById('mrr-type-label');

  const subjectField = document.getElementById('mrr-subject-field');
  const subjectInput = document.getElementById('mrr-subject');
  const subjectTrigger = document.getElementById('mrr-subject-trigger');
  const subjectMenu = document.getElementById('mrr-subject-menu');
  const subjectLabel = document.getElementById('mrr-subject-label');

  const activityKindField = document.getElementById('mrr-activity-kind-field');
  const activityKindInput = document.getElementById('mrr-activity-kind');
  const activityKindTrigger = document.getElementById('mrr-activity-kind-trigger');
  const activityKindMenu = document.getElementById('mrr-activity-kind-menu');
  const activityKindLabel = document.getElementById('mrr-activity-kind-label');

  const sportField = document.getElementById('mrr-sport-field');
  const sportInput = document.getElementById('mrr-sport');
  const sportTrigger = document.getElementById('mrr-sport-trigger');
  const sportMenu = document.getElementById('mrr-sport-menu');
  const sportLabel = document.getElementById('mrr-sport-label');

  const clubField = document.getElementById('mrr-club-field');
  const clubInput = document.getElementById('mrr-club');
  const clubTrigger = document.getElementById('mrr-club-trigger');
  const clubMenu = document.getElementById('mrr-club-menu');
  const clubLabel = document.getElementById('mrr-club-label');

  const routingBox = document.getElementById('mrr-routing');
  const routingNameEl = document.getElementById('mrr-routing-name');

  const nameField = document.getElementById('mrr-name');
  const dateInput = document.getElementById('mrr-date');
  const dateTrigger = document.getElementById('mrr-date-trigger');
  const dateLabel = document.getElementById('mrr-date-label');
  const issuerField = document.getElementById('mrr-issuer');
  const descField = document.getElementById('mrr-desc');

  const dropzone = document.getElementById('mrr-dropzone');
  const fileInput = document.getElementById('mrr-file-input');
  const fileList = document.getElementById('mrr-file-list');

  const CLASS_TEACHER = { name: 'Mrs. Nilmini Rajapaksa', role: 'Class Teacher — Grade 6-A' };
  const SUBJECT_TEACHERS = {
    'English Language': 'Mrs. Kumari Fernando',
    'Mathematics':       'Mr. Dinesh Wickramasinghe',
    'Science':           'Dr. Malini Peiris',
    'Religion':          'Mr. Chamara Perera',
    'History':           'Mrs. Ishara Gunasekara',
    'Sinhala':           'Mrs. Nilmini Rajapaksa',
    'Geography':         'Mr. Aruna Silva',
    'ICT':               'Mr. Kasun Fonseka',
    'Civics':            'Mr. Chaminda Weerasinghe',
    'Aesthetics':        'Mrs. Sanduni Gunawardena',
    'Health Science':    'Mr. Ishan Rodrigo',
    'Tamil':             'Ms. Dilani Fernando',
  };
  const SPORT_TEACHERS = {
    'U17 Cricket':      'Mr. Aruna Silva',
    'Chess Club':       'Ms. Dilani Fernando',
    'Basketball Team':  'Mr. Nadun Jayasuriya',
    'Swimming Squad':   'Mr. Ishan Rodrigo',
  };
  const CLUB_TEACHERS = {
    'Debating Society':   'Mr. Chaminda Weerasinghe',
    'Orchestra & Choir':  'Dr. Malini Peiris',
    'Art & Design Club':  'Mrs. Sanduni Gunawardena',
    'Robotics Club':      'Mr. Kasun Fonseka',
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  let stagedFiles = [];

  function openFormModal() {
    resetForm();
    if (formOverlay) {
      formOverlay.hidden = false;
      formOverlay.classList.add('c-is-open');
    }
  }

  function closeFormModal() {
    if (formOverlay) {
      formOverlay.classList.remove('c-is-open');
      formOverlay.hidden = true;
    }
  }

  function openSuccessModal(refNumber, teacher) {
    closeFormModal();
    if (refEl) refEl.textContent = 'Reference: ' + refNumber;
    if (successTextEl && teacher) {
      successTextEl.textContent = `Your request has been sent to ${teacher.name} (${teacher.role}) for review. This usually takes 3–5 working days. You'll see the status update on this page once it's processed.`;
    }
    if (successOverlay) {
      successOverlay.hidden = false;
      successOverlay.classList.add('c-is-open');
    }
  }

  function closeSuccessModal() {
    if (successOverlay) {
      successOverlay.classList.remove('c-is-open');
      successOverlay.hidden = true;
    }
  }

  function setupCustomSelect(dropdownId, triggerBtn, menuDiv, hiddenInput, labelSpan, onChangeCb) {
    if (!triggerBtn || !menuDiv) return;
    const dropdownWrap = document.getElementById(dropdownId);

    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = !menuDiv.hidden;
      document.querySelectorAll('.c-custom-select-menu').forEach(m => m.hidden = true);
      document.querySelectorAll('.c-custom-select').forEach(w => w.classList.remove('is-open'));
      document.querySelectorAll('.c-dp-calendar-popup').forEach(p => p.remove());

      if (!isOpen) {
        menuDiv.hidden = false;
        if (dropdownWrap) dropdownWrap.classList.add('is-open');
      }
    });

    menuDiv.querySelectorAll('.c-custom-select-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const val = opt.dataset.value;
        const text = opt.querySelector('span') ? opt.querySelector('span').textContent.trim() : opt.textContent.trim();

        if (hiddenInput) hiddenInput.value = val;
        if (labelSpan) labelSpan.textContent = text;

        menuDiv.querySelectorAll('.c-custom-select-option').forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');

        menuDiv.hidden = true;
        if (dropdownWrap) dropdownWrap.classList.remove('is-open');

        if (hiddenInput) clearFieldError(hiddenInput.id);
        if (onChangeCb) onChangeCb(val);
      });
    });
  }

  function resetCustomSelect(dropdownId, hiddenInput, labelSpan, placeholder) {
    if (hiddenInput) hiddenInput.value = '';
    if (labelSpan) labelSpan.textContent = placeholder;
    const dropdownWrap = document.getElementById(dropdownId);
    if (dropdownWrap) {
      dropdownWrap.classList.remove('is-open');
      dropdownWrap.querySelectorAll('.c-custom-select-option').forEach(o => o.classList.remove('is-selected'));
      const menuDiv = dropdownWrap.querySelector('.c-custom-select-menu');
      if (menuDiv) menuDiv.hidden = true;
    }
  }

  function setupCustomDatePicker(datepickerId, triggerBtn, hiddenInput, labelSpan) {
    if (!triggerBtn || !hiddenInput || !labelSpan) return;
    const container = document.getElementById(datepickerId);
    if (!container) return;

    let popupEl = null;
    let currDate = new Date();

    function formatDateForDisplay(d) {
      if (!d) return 'Select date...';
      return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    }

    function formatDateISO(d) {
      if (!d) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function closePopup() {
      if (popupEl) {
        popupEl.remove();
        popupEl = null;
      }
    }

    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      document.querySelectorAll('.c-custom-select-menu').forEach(m => m.hidden = true);
      document.querySelectorAll('.c-custom-select').forEach(w => w.classList.remove('is-open'));

      if (popupEl) {
        closePopup();
        return;
      }

      popupEl = document.createElement('div');
      popupEl.className = 'c-dp-calendar-popup';

      let activeYear = currDate.getFullYear();
      let activeMonth = currDate.getMonth();

      function renderPopup() {
        const firstDay = new Date(activeYear, activeMonth, 1);
        const startDayIndex = (firstDay.getDay() + 6) % 7;
        const totalDaysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
        const prevMonthTotalDays = new Date(activeYear, activeMonth, 0).getDate();

        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(activeYear, activeMonth, 1));
        const today = new Date();

        let daysHtml = '';
        for (let i = startDayIndex - 1; i >= 0; i--) {
          const dayNum = prevMonthTotalDays - i;
          daysHtml += `<button type="button" class="c-dp-day is-outside" disabled>${dayNum}</button>`;
        }
        for (let d = 1; d <= totalDaysInMonth; d++) {
          const iterDate = new Date(activeYear, activeMonth, d);
          const isToday = iterDate.toDateString() === today.toDateString();
          const isSel = hiddenInput.value === formatDateISO(iterDate);
          daysHtml += `<button type="button" class="c-dp-day ${isToday ? 'is-today' : ''} ${isSel ? 'is-selected' : ''}" data-day="${d}">${d}</button>`;
        }
        const totalCells = startDayIndex + totalDaysInMonth;
        const trailing = (7 - (totalCells % 7)) % 7;
        for (let i = 1; i <= trailing; i++) {
          daysHtml += `<button type="button" class="c-dp-day is-outside" disabled>${i}</button>`;
        }

        popupEl.innerHTML = `
          <div class="c-dp-header">
            <button type="button" class="c-dp-nav-btn dp-prev" aria-label="Previous month">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <h4 class="c-dp-title">${monthName}</h4>
            <button type="button" class="c-dp-nav-btn dp-next" aria-label="Next month">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div class="c-dp-weekdays">
            <div class="c-dp-weekday">Mo</div><div class="c-dp-weekday">Tu</div><div class="c-dp-weekday">We</div>
            <div class="c-dp-weekday">Th</div><div class="c-dp-weekday">Fr</div><div class="c-dp-weekday">Sa</div>
            <div class="c-dp-weekday">Su</div>
          </div>
          <div class="c-dp-days">${daysHtml}</div>
          <div class="c-dp-footer">
            <button type="button" class="c-dp-today-btn dp-today">Select Today</button>
          </div>
        `;

        popupEl.querySelector('.dp-prev').addEventListener('click', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          activeMonth--;
          if (activeMonth < 0) { activeMonth = 11; activeYear--; }
          renderPopup();
        });

        popupEl.querySelector('.dp-next').addEventListener('click', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          activeMonth++;
          if (activeMonth > 11) { activeMonth = 0; activeYear++; }
          renderPopup();
        });

        popupEl.querySelector('.dp-today').addEventListener('click', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          currDate = new Date();
          hiddenInput.value = formatDateISO(currDate);
          labelSpan.textContent = formatDateForDisplay(currDate);
          clearFieldError(hiddenInput.id);
          closePopup();
        });

        popupEl.querySelectorAll('.c-dp-day:not(.is-outside)').forEach(btn => {
          btn.addEventListener('click', (ev) => {
            ev.preventDefault(); ev.stopPropagation();
            const dayNum = Number(btn.dataset.day);
            currDate = new Date(activeYear, activeMonth, dayNum);
            hiddenInput.value = formatDateISO(currDate);
            labelSpan.textContent = formatDateForDisplay(currDate);
            clearFieldError(hiddenInput.id);
            closePopup();
          });
        });
      }

      renderPopup();
      container.appendChild(popupEl);
    });

    document.addEventListener('click', (ev) => {
      if (popupEl && !container.contains(ev.target)) {
        closePopup();
      }
    });
  }

  setupCustomDatePicker('mrr-date-datepicker', dateTrigger, dateInput, dateLabel);

  function resolveTeacher() {
    const type = typeInput ? typeInput.value : '';

    if (type === 'academic') {
      const subject = subjectInput ? subjectInput.value : '';
      if (!subject) return null;
      return { name: SUBJECT_TEACHERS[subject] || 'Subject Teacher', role: subject + ' Subject Teacher' };
    }

    if (type === 'sports') {
      const kind = activityKindInput ? activityKindInput.value : '';
      if (kind === 'sport') {
        const sport = sportInput ? sportInput.value : '';
        if (!sport) return null;
        return { name: SPORT_TEACHERS[sport] || 'Teacher in Charge', role: 'Teacher in Charge — ' + sport };
      }
      if (kind === 'club') {
        const club = clubInput ? clubInput.value : '';
        if (!club) return null;
        return { name: CLUB_TEACHERS[club] || 'Teacher in Charge', role: 'Teacher in Charge — ' + club };
      }
      return null;
    }

    if (type === 'certificate' || type === 'attendance' || type === 'other') {
      return CLASS_TEACHER;
    }

    return null;
  }

  function isLinkComplete() {
    const type = typeInput ? typeInput.value : '';
    if (type === 'academic') return !!(subjectInput && subjectInput.value);
    if (type === 'sports') {
      const kind = activityKindInput ? activityKindInput.value : '';
      if (kind === 'sport') return !!(sportInput && sportInput.value);
      if (kind === 'club') return !!(clubInput && clubInput.value);
      return false;
    }
    return !!type;
  }

  function updateFieldVisibility() {
    const type = typeInput ? typeInput.value : '';
    const kind = activityKindInput ? activityKindInput.value : '';

    if (subjectField) subjectField.hidden = type !== 'academic';
    if (activityKindField) activityKindField.hidden = type !== 'sports';
    if (sportField) sportField.hidden = !(type === 'sports' && kind === 'sport');
    if (clubField) clubField.hidden = !(type === 'sports' && kind === 'club');

    if (type !== 'academic') clearFieldError('mrr-subject');
    if (type !== 'sports') clearFieldError('mrr-activity-kind');
    if (!(type === 'sports' && kind === 'sport')) clearFieldError('mrr-sport');
    if (!(type === 'sports' && kind === 'club')) clearFieldError('mrr-club');
  }

  function updateRouting() {
    const teacher = resolveTeacher();
    if (!teacher || !routingBox) {
      if (routingBox) routingBox.hidden = true;
      return;
    }
    if (routingNameEl) routingNameEl.textContent = teacher.name + ' — ' + teacher.role;
    routingBox.hidden = false;
  }

  function updateSubmitState() {
    if (formSubmitBtn) formSubmitBtn.disabled = !isLinkComplete();
  }

  function refreshRouting() {
    updateFieldVisibility();
    updateRouting();
    updateSubmitState();
  }

  setupCustomSelect('mrr-type-dropdown', typeTrigger, typeMenu, typeInput, typeLabel, (val) => {
    if (val !== 'sports') {
      resetCustomSelect('mrr-activity-kind-dropdown', activityKindInput, activityKindLabel, 'Select one...');
      resetCustomSelect('mrr-sport-dropdown', sportInput, sportLabel, 'Select the sport...');
      resetCustomSelect('mrr-club-dropdown', clubInput, clubLabel, 'Select the club...');
    }
    if (val !== 'academic') {
      resetCustomSelect('mrr-subject-dropdown', subjectInput, subjectLabel, 'Select the subject...');
    }
    refreshRouting();
  });

  setupCustomSelect('mrr-subject-dropdown', subjectTrigger, subjectMenu, subjectInput, subjectLabel, () => {
    clearFieldError('mrr-subject');
    updateRouting();
    updateSubmitState();
  });

  setupCustomSelect('mrr-activity-kind-dropdown', activityKindTrigger, activityKindMenu, activityKindInput, activityKindLabel, (val) => {
    resetCustomSelect('mrr-sport-dropdown', sportInput, sportLabel, 'Select the sport...');
    resetCustomSelect('mrr-club-dropdown', clubInput, clubLabel, 'Select the club...');
    clearFieldError('mrr-activity-kind');
    refreshRouting();
  });

  setupCustomSelect('mrr-sport-dropdown', sportTrigger, sportMenu, sportInput, sportLabel, () => {
    clearFieldError('mrr-sport');
    updateRouting();
    updateSubmitState();
  });

  setupCustomSelect('mrr-club-dropdown', clubTrigger, clubMenu, clubInput, clubLabel, () => {
    clearFieldError('mrr-club');
    updateRouting();
    updateSubmitState();
  });

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderFileList() {
    if (!fileList) return;
    fileList.innerHTML = '';
    stagedFiles.forEach((file, index) => {
      const isPdf = file.type === 'application/pdf';
      const item = document.createElement('div');
      item.className = 'mrr-file-item';
      item.innerHTML = `
        <div class="mrr-file-icon">
          ${isPdf
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>'}
        </div>
        <div class="mrr-file-info">
          <div class="mrr-file-name">${file.name}</div>
          <div class="mrr-file-size">${formatSize(file.size)}</div>
        </div>
        <button type="button" class="mrr-file-remove" data-index="${index}" aria-label="Remove file">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
      fileList.appendChild(item);
    });

    fileList.querySelectorAll('.mrr-file-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        stagedFiles.splice(Number(btn.dataset.index), 1);
        renderFileList();
      });
    });
  }

  function addFiles(fileArray) {
    Array.from(fileArray).forEach(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!isValidType || file.size > MAX_FILE_SIZE) return;
      stagedFiles.push(file);
    });
    renderFileList();
    if (stagedFiles.length) clearFieldError('mrr-proof');
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });

    fileInput.addEventListener('change', () => {
      addFiles(fileInput.files);
      fileInput.value = '';
    });

    ['dragenter', 'dragover'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
      });
    });
    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  function setFieldError(fieldId) {
    const el = document.getElementById(fieldId);
    const wrap = el ? el.closest('.mrr-field') : null;
    if (wrap) wrap.classList.add('has-error');
  }

  function clearFieldError(fieldId) {
    const target = fieldId === 'mrr-proof' ? dropzone : document.getElementById(fieldId);
    const wrap = target ? target.closest('.mrr-field') : null;
    if (wrap) wrap.classList.remove('has-error');
  }

  [nameField, dateInput, descField].forEach(field => {
    if (field) {
      field.addEventListener('input', () => clearFieldError(field.id));
      field.addEventListener('change', () => clearFieldError(field.id));
    }
  });

  function resetForm() {
    if (formEl) formEl.reset();
    stagedFiles = [];
    renderFileList();
    resetCustomSelect('mrr-type-dropdown', typeInput, typeLabel, 'Select a record type...');
    resetCustomSelect('mrr-subject-dropdown', subjectInput, subjectLabel, 'Select the subject...');
    resetCustomSelect('mrr-activity-kind-dropdown', activityKindInput, activityKindLabel, 'Select one...');
    resetCustomSelect('mrr-sport-dropdown', sportInput, sportLabel, 'Select the sport...');
    resetCustomSelect('mrr-club-dropdown', clubInput, clubLabel, 'Select the club...');
    if (dateInput) dateInput.value = '';
    if (dateLabel) dateLabel.textContent = 'Select date...';
    document.querySelectorAll('.c-dp-calendar-popup').forEach(p => p.remove());

    ['mrr-type', 'mrr-name', 'mrr-date', 'mrr-desc', 'mrr-proof', 'mrr-subject', 'mrr-activity-kind', 'mrr-sport', 'mrr-club'].forEach(clearFieldError);
    if (subjectField) subjectField.hidden = true;
    if (activityKindField) activityKindField.hidden = true;
    if (sportField) sportField.hidden = true;
    if (clubField) clubField.hidden = true;
    if (routingBox) routingBox.hidden = true;
    updateSubmitState();
  }

  // Document Event Delegation for Open/Close Triggers
  document.addEventListener('click', (e) => {
    if (e.target.closest('#cert-missing-btn') || e.target.closest('.cert-missing-btn')) {
      e.preventDefault();
      openFormModal();
      return;
    }
    if (e.target.closest('#mrr-close') || e.target.closest('#mrr-cancel-btn') || e.target === document.getElementById('mrr-backdrop')) {
      closeFormModal();
      return;
    }
    if (e.target.closest('#mrr-done-btn') || e.target === document.getElementById('mrr-success-backdrop')) {
      closeSuccessModal();
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFormModal();
      closeSuccessModal();
    }
  });

  if (formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      if (!typeInput || !typeInput.value) { setFieldError('mrr-type'); valid = false; }
      if (typeInput && typeInput.value === 'academic' && (!subjectInput || !subjectInput.value)) { setFieldError('mrr-subject'); valid = false; }
      if (typeInput && typeInput.value === 'sports' && (!activityKindInput || !activityKindInput.value)) { setFieldError('mrr-activity-kind'); valid = false; }
      if (typeInput && typeInput.value === 'sports' && activityKindInput && activityKindInput.value === 'sport' && (!sportInput || !sportInput.value)) { setFieldError('mrr-sport'); valid = false; }
      if (typeInput && typeInput.value === 'sports' && activityKindInput && activityKindInput.value === 'club' && (!clubInput || !clubInput.value)) { setFieldError('mrr-club'); valid = false; }
      if (!nameField || !nameField.value.trim()) { setFieldError('mrr-name'); valid = false; }
      if (!dateField || !dateField.value) { setFieldError('mrr-date'); valid = false; }
      if (!descField || !descField.value.trim()) { setFieldError('mrr-desc'); valid = false; }
      if (!stagedFiles.length) { setFieldError('mrr-proof'); valid = false; }

      if (!valid) {
        if (formOverlay) formOverlay.querySelector('.has-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      const teacher = resolveTeacher() || CLASS_TEACHER;
      const refNumber = 'MRR-' + Math.floor(1000 + Math.random() * 9000) + '-' + new Date().getFullYear();
      openSuccessModal(refNumber, teacher);
    });
  }
})();;

/* ---------------------------------------------------------
     8c. REQUEST CHARACTER CERTIFICATE MODAL
     --------------------------------------------------------- */
/* ---------------------------------------------------------
     8c. REQUEST CHARACTER CERTIFICATE MODALS (2 Pop-up Windows)
     --------------------------------------------------------- */
(function(){
  function initRCC() {
    const formOverlay = document.getElementById('rcc-overlay');
    const successOverlay = document.getElementById('rcc-success-overlay');

    const formCloseBtn = document.getElementById('rcc-close');
    const formBackdrop = document.getElementById('rcc-backdrop');
    const formCancelBtn = document.getElementById('rcc-cancel-btn');

    const successBackdrop = document.getElementById('rcc-success-backdrop');
    const doneBtn = document.getElementById('rcc-done-btn');

    const form = document.getElementById('rcc-form');
    const refEl = document.getElementById('rcc-ref');
    const successTextEl = document.getElementById('rcc-success-text');

    const purposeInput = document.getElementById('rcc-purpose');
    const purposeTrigger = document.getElementById('rcc-purpose-trigger');
    const purposeMenu = document.getElementById('rcc-purpose-menu');
    const purposeLabel = document.getElementById('rcc-purpose-label');

    const deliveryInput = document.getElementById('rcc-delivery');
    const deliveryTrigger = document.getElementById('rcc-delivery-trigger');
    const deliveryMenu = document.getElementById('rcc-delivery-menu');
    const deliveryLabel = document.getElementById('rcc-delivery-label');

    const copiesField = document.getElementById('rcc-copies');
    const notesField = document.getElementById('rcc-notes');

    const PURPOSE_LABELS = {
      university:  'University / Higher Education Admission',
      employment:  'Employment / Job Application',
      visa:        'Visa / Immigration',
      scholarship: 'Scholarship Application',
      other:       'Other'
    };

    const DELIVERY_LABELS = {
      office: 'collection from the School Office',
      email:  'email as a signed PDF'
    };

    // Setup Custom Dropdown UI
    function setupCustomSelect(dropdownId, triggerBtn, menuDiv, hiddenInput, labelSpan) {
      if (!triggerBtn || !menuDiv) return;
      const dropdownWrap = document.getElementById(dropdownId);

      triggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = !menuDiv.hidden;
        document.querySelectorAll('.c-custom-select-menu').forEach(m => m.hidden = true);
        document.querySelectorAll('.c-custom-select').forEach(w => w.classList.remove('is-open'));

        if (!isOpen) {
          menuDiv.hidden = false;
          if (dropdownWrap) dropdownWrap.classList.add('is-open');
        }
      });

      menuDiv.querySelectorAll('.c-custom-select-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const val = opt.dataset.value;
          const text = opt.textContent.trim();

          if (hiddenInput) hiddenInput.value = val;
          if (labelSpan) labelSpan.textContent = text;

          menuDiv.querySelectorAll('.c-custom-select-option').forEach(o => o.classList.remove('is-selected'));
          opt.classList.add('is-selected');

          menuDiv.hidden = true;
          if (dropdownWrap) dropdownWrap.classList.remove('is-open');

          if (hiddenInput) clearFieldError(hiddenInput.id);
        });
      });
    }

    setupCustomSelect('rcc-purpose-dropdown', purposeTrigger, purposeMenu, purposeInput, purposeLabel);
    setupCustomSelect('rcc-delivery-dropdown', deliveryTrigger, deliveryMenu, deliveryInput, deliveryLabel);

    // Close custom dropdowns when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.c-custom-select-menu').forEach(m => m.hidden = true);
      document.querySelectorAll('.c-custom-select').forEach(w => w.classList.remove('is-open'));
    });

    function setFieldError(fieldId) {
      const el = document.getElementById(fieldId);
      const wrap = el ? el.closest('.mrr-field') : null;
      if (wrap) wrap.classList.add('has-error');
    }

    function clearFieldError(fieldId) {
      const el = document.getElementById(fieldId);
      const wrap = el ? el.closest('.mrr-field') : null;
      if (wrap) wrap.classList.remove('has-error');
    }

    if (copiesField) copiesField.addEventListener('input', () => clearFieldError('rcc-copies'));

    function resetForm() {
      if (form) form.reset();
      if (purposeInput) purposeInput.value = '';
      if (purposeLabel) purposeLabel.textContent = 'Select a purpose...';
      if (purposeMenu) purposeMenu.querySelectorAll('.c-custom-select-option').forEach(o => o.classList.remove('is-selected'));

      if (deliveryInput) deliveryInput.value = '';
      if (deliveryLabel) deliveryLabel.textContent = 'Select delivery method...';
      if (deliveryMenu) deliveryMenu.querySelectorAll('.c-custom-select-option').forEach(o => o.classList.remove('is-selected'));

      if (copiesField) copiesField.value = 1;
      if (notesField) notesField.value = '';
      ['rcc-purpose', 'rcc-copies', 'rcc-delivery'].forEach(clearFieldError);
    }

    function openFormModal() {
      if (!formOverlay) return;
      resetForm();
      formOverlay.hidden = false;
      formOverlay.removeAttribute('hidden');
      formOverlay.style.display = 'flex';
      formOverlay.classList.add('c-is-open');

      if (successOverlay) {
        successOverlay.hidden = true;
        successOverlay.setAttribute('hidden', '');
        successOverlay.style.display = 'none';
        successOverlay.classList.remove('c-is-open');
      }
    }

    function closeFormModal() {
      if (!formOverlay) return;
      formOverlay.hidden = true;
      formOverlay.setAttribute('hidden', '');
      formOverlay.style.display = 'none';
      formOverlay.classList.remove('c-is-open');
    }

    function openSuccessModal(refNumber, message) {
      closeFormModal();
      if (!successOverlay) return;
      if (refEl) refEl.textContent = 'Reference: ' + refNumber;
      if (successTextEl) successTextEl.textContent = message;

      successOverlay.hidden = false;
      successOverlay.removeAttribute('hidden');
      successOverlay.style.display = 'flex';
      successOverlay.classList.add('c-is-open');
    }

    function closeSuccessModal() {
      if (!successOverlay) return;
      successOverlay.hidden = true;
      successOverlay.setAttribute('hidden', '');
      successOverlay.style.display = 'none';
      successOverlay.classList.remove('c-is-open');
    }

    // Global click listener for Request Character Certificate buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#cert-request-btn, .cert-request-btn');
      if (btn) {
        e.preventDefault();
        openFormModal();
      }
    });

    if (formCloseBtn) formCloseBtn.addEventListener('click', closeFormModal);
    if (formCancelBtn) formCancelBtn.addEventListener('click', closeFormModal);
    if (formBackdrop) formBackdrop.addEventListener('click', closeFormModal);

    if (doneBtn) doneBtn.addEventListener('click', closeSuccessModal);
    if (successBackdrop) successBackdrop.addEventListener('click', closeSuccessModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (formOverlay && !formOverlay.hidden) closeFormModal();
        if (successOverlay && !successOverlay.hidden) closeSuccessModal();
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        const copies = copiesField ? Number(copiesField.value) : 1;
        if (!purposeInput || !purposeInput.value) { setFieldError('rcc-purpose'); valid = false; }
        if (!copies || copies < 1 || copies > 5) { setFieldError('rcc-copies'); valid = false; }
        if (!deliveryInput || !deliveryInput.value) { setFieldError('rcc-delivery'); valid = false; }

        if (!valid) return;

        const refNumber = 'CCR-2026-0' + Math.floor(100 + Math.random() * 900);
        const purposeText = PURPOSE_LABELS[purposeInput.value] || purposeInput.value;
        const deliveryText = DELIVERY_LABELS[deliveryInput.value] || deliveryInput.value;

        const msg = `Your request (${purposeText}, ${copies} ${copies === 1 ? 'copy' : 'copies'}) has been sent to the Principal's Office for review and signing. This usually takes 5–7 working days. You'll be notified once it's ready for ${deliveryText}.`;

        openSuccessModal(refNumber, msg);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRCC);
  } else {
    initRCC();
  }
})();

/* ---------------------------------------------------------
     9. ACHIEVEMENTS PAGE
     --------------------------------------------------------- */
(function(){

  const statsGridEl   = document.getElementById('ach-stats-grid');
  const filtersEl     = document.getElementById('ach-filters');
  const timelineEl    = document.getElementById('ach-timeline');
  const emptyEl       = document.getElementById('ach-empty');

  if (!statsGridEl || !filtersEl || !timelineEl) return;

  const achIcons = {
    trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 6h2a2 2 0 0 1 0 4h-2"/><path d="M7 6H5a2 2 0 0 0 0 4h2"/>',
    medal:  '<circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/>',
    star:   '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    book:   '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    users:  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    palette:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.7-.4-1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.4-4-8-10-8Z"/',
  };

  function achIcon(name){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${achIcons[name] || achIcons.star}</svg>`;
  }

  // ---- achievement data (student's full record, 2023 - present) ----
  const achData = [
    {
      id: 'a1', title: 'Regional Winner — Cricket', category: 'sports', categoryLabel: 'Sports',
      date: 'Oct 2024', year: 2024, icon: 'trophy', featured: true,
      description: 'Won first place representing the school at the Regional Inter-School Cricket Championship, U17 division.',
    },
    {
      id: 'a2', title: 'Player of the Series', category: 'sports', categoryLabel: 'Sports',
      date: 'Mar 2025', year: 2025, icon: 'medal', featured: true,
      description: 'Named Player of the Series at the Inter-School U17 Cricket Tournament for consistent performances with bat and ball.',
    },
    {
      id: 'a3', title: 'Top of the Grade — Term 2', category: 'academic', categoryLabel: 'Academic',
      date: 'Aug 2025', year: 2025, icon: 'book', featured: true,
      description: 'Ranked 1st out of 142 students in Grade 10, Term 2, with a subject average of 91%.',
    },
    {
      id: 'a4', title: 'Best Mural — Inter-School Art Fest', category: 'clubs', categoryLabel: 'Clubs',
      date: 'Jun 2025', year: 2025, icon: 'palette',
      description: 'Awarded Best Mural for a collaborative piece submitted with the Art & Design Club at the annual Inter-School Art Fest.',
    },
    {
      id: 'a5', title: 'House Prefect — Teal House', category: 'leadership', categoryLabel: 'Leadership',
      date: 'Jan 2025', year: 2025, icon: 'users',
      description: 'Appointed House Prefect for Teal House, responsible for coordinating inter-house sports and events for the year.',
    },
    {
      id: 'a8', title: 'Distinction — Grade 9 Year-End Exams', category: 'academic', categoryLabel: 'Academic',
      date: 'Mar 2024', year: 2024, icon: 'book',
      description: 'Achieved distinction-level passes across all subjects in the Grade 9 year-end examinations.',
    },
    {
      id: 'a9', title: 'Captain — Junior Cricket Team', category: 'leadership', categoryLabel: 'Leadership',
      date: 'Feb 2023', year: 2023, icon: 'star',
      description: 'Appointed Captain of the Junior Cricket Team, leading the squad through the inter-house tournament season.',
    },
    {
      id: 'a10', title: 'Selected — Inter-School Art Exhibition', category: 'clubs', categoryLabel: 'Clubs',
      date: 'Sep 2023', year: 2023, icon: 'palette',
      description: 'Two original pieces selected for display at the Colombo Inter-School Art Exhibition.',
    },
    {
      id: 'a11', title: 'Zonal Runners-Up — Cricket 2025 Season', category: 'sports', categoryLabel: 'Sports',
      date: 'Apr 2025', year: 2025, icon: 'trophy',
      description: 'Helped the U17 Cricket squad finish as Zonal Runners-Up in a closely contested final.',
    },
    {
      id: 'a12', title: 'Merit Award — Science Quiz', category: 'academic', categoryLabel: 'Academic',
      date: 'May 2023', year: 2023, icon: 'star',
      description: 'Placed among the top three teams at the Inter-School Science Quiz, earning a merit award for the school.',
    },
  ];

  const categoryStyles = {
    academic:   { badgeClass: 'ach-badge-academic',   dotClass: 'ach-dot-academic' },
    sports:     { badgeClass: 'ach-badge-sports',     dotClass: 'ach-dot-sports' },
    clubs:      { badgeClass: 'ach-badge-clubs',      dotClass: 'ach-dot-clubs' },
    leadership: { badgeClass: 'ach-badge-leadership', dotClass: 'ach-dot-leadership' },
  };

  let activeCategory = 'all';

  // ---- stat cards (computed from the data, not hardcoded) ----
  function renderStats(){
    const lastYear = new Date().getFullYear() - 1;

    const total = achData.length;
    const earnedLastYear = achData.filter(a => a.year === lastYear).length;
    const extraCurriculars = achData.filter(a => a.category === 'sports' || a.category === 'clubs').length;
    const academic = achData.filter(a => a.category === 'academic').length;

    const stats = [
      { label: 'Total Achievements', value: total, icon: 'star', modifier: 'c-metric-card--moss' },
      { label: 'Earned in Last Year', value: earnedLastYear, icon: 'trophy', modifier: 'c-metric-card--maroon' },
      { label: 'Extra Curriculars', value: extraCurriculars, icon: 'medal', modifier: 'c-metric-card--sand' },
      { label: 'Academic', value: academic, icon: 'book', modifier: 'c-metric-card--sky' },
    ];

    if (statsGridEl) {
      statsGridEl.className = 'c-metrics-grid';
      statsGridEl.innerHTML = stats.map(s => `
        <div class="c-metric-card ${s.modifier}">
          <div class="c-metric-card__top">
            <span class="c-metric-card__icon">${achIcon(s.icon)}</span>
          </div>
          <p class="c-metric-card__value c-font-display">${s.value}</p>
          <p class="c-metric-card__label">${s.label}</p>
        </div>
      `).join('');
    }
  }

  // ---- full timeline, grouped by year (desc), filterable by category ----
  function renderTimeline(){
    const filtered = activeCategory === 'all'
      ? achData
      : achData.filter(a => a.category === activeCategory);

    emptyEl.hidden = filtered.length > 0;
    timelineEl.hidden = filtered.length === 0;
    if (filtered.length === 0){ timelineEl.innerHTML = ''; return; }

    const years = [...new Set(filtered.map(a => a.year))].sort((a, b) => b - a);

    timelineEl.innerHTML = years.map(year => {
      const items = filtered
        .filter(a => a.year === year)
        .sort((a, b) => new Date(`1 ${b.date}`) - new Date(`1 ${a.date}`));

      const itemsHtml = items.map(a => `
        <div class="ach-timeline-item">
          <div class="ach-timeline-marker">
            <span class="ach-timeline-dot ${categoryStyles[a.category].dotClass}"></span>
            <span class="ach-timeline-line"></span>
          </div>
          <div class="ach-timeline-card">
            <div class="ach-timeline-card-top">
              <div class="ach-timeline-icon">${achIcon(a.icon)}</div>
              <div>
                <div class="ach-timeline-title-row">
                  <span class="ach-timeline-title">${a.title}</span>
                  <span class="ach-badge ${categoryStyles[a.category].badgeClass}">${a.categoryLabel}</span>
                </div>
                <div class="ach-timeline-date">${a.date}</div>
              </div>
            </div>
            <p class="ach-timeline-desc">${a.description}</p>
          </div>
        </div>
      `).join('');

      return `
        <div class="ach-year-group">
          <div class="ach-year-label">${year}</div>
          <div class="ach-year-items">${itemsHtml}</div>
        </div>
      `;
    }).join('');
  }

  filtersEl.querySelectorAll('.ach-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      filtersEl.querySelectorAll('.ach-filter').forEach(b => b.classList.toggle('active', b === btn));
      renderTimeline();
    });
  });

  renderStats();
  renderTimeline();

})();

// =========================================================
// NOTICE BOARD PAGE (student view — read only)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const nbGrid = document.getElementById('nb-grid');
  if(!nbGrid) return; // Notice Board page not present on this build

  const nbSearchInput    = document.getElementById('nb-search-input');
  const nbEmpty          = document.getElementById('nb-empty');
  const nbDropdown       = document.getElementById('nb-category-dropdown');
  const nbDropdownBtn    = document.getElementById('nb-category-btn');
  const nbDropdownMenu   = document.getElementById('nb-category-menu');
  const nbDropdownLabel  = document.getElementById('nb-category-label');
  const nbDropdownOptions = nbDropdownMenu.querySelectorAll('.nb-dropdown-option');

  let nbActiveCategory = 'all';

  const noticeBoardData = [
    {
      title: 'Term 2 Examination Schedule — June 2026',
      body: 'Term 2 examinations run from 17–26 June 2026. Students should follow their grade and class section timetable for subject sessions, rooms, and reporting times. The make-up examination session is scheduled for 26 June for approved absences.',
      category: 'academic',
      tags: ['Academic', 'All Users'],
      author: 'Academic Office',
      date: 'Jun 10, 2026',
      pinned: true
    },
    {
      title: 'Varsity Football Training Schedule',
      body: 'The senior and junior football squads will begin their revised training schedule next Monday. Please check in with the coaching team before the first session.',
      category: 'extracurricular',
      tags: ['Extracurricular', 'Varsity Football Club', 'Students'],
      author: 'Mr. Weerasinghe',
      date: 'Jul 14, 2026',
      pinned: false
    },
    {
      title: 'Inter-programme Leadership Briefing',
      body: 'All extracurricular captains, club leads, and teachers in charge are requested to attend the term planning briefing in the main hall this Thursday at 14:30.',
      category: 'extracurricular',
      tags: ['Extracurricular', 'All Extracurriculars', 'Students', 'Teachers'],
      author: 'Student Life Office',
      date: 'Jul 12, 2026',
      pinned: false
    },
    {
      title: 'Library Renovation Notice',
      body: 'The main library will be closed for renovations starting next Monday. A temporary reading room has been set up in Hall B.',
      category: 'administrative',
      tags: ['Administrative', 'All Users'],
      author: 'Admin Office',
      date: 'May 20, 2026',
      pinned: false
    },
    {
      title: 'Parent-Teacher Meeting: Grade 10',
      body: 'The Grade 10 parent-teacher meeting will be held in the auditorium. Individual subject teacher slots will be shared with parents beforehand.',
      category: 'academic',
      tags: ['Academic', 'Parents'],
      author: 'Grade 10 Coordinator',
      date: 'Jun 25, 2026',
      pinned: false
    },
    {
      title: 'Debating Society Weekly Meet',
      body: 'This week\u2019s debate practice moves to the seminar room due to hall availability. Topic packs will be shared a day in advance.',
      category: 'extracurricular',
      tags: ['Extracurricular', 'Debating Society', 'Students'],
      author: 'Ms. Fernando',
      date: 'Jul 20, 2026',
      pinned: false
    },
    {
      title: 'Uniform Guidelines Reminder',
      body: 'With the new term underway, students are reminded to follow the full uniform and grooming guidelines as outlined in the student handbook.',
      category: 'administrative',
      tags: ['Administrative', 'Students', 'Parents'],
      author: 'Admin Office',
      date: 'Jun 1, 2026',
      pinned: false
    }
  ];

  const nbPinIcon = `
    <span class="nb-pin-icon" title="Pinned notice">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" x2="12" y1="17" y2="22"/>
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
      </svg>
    </span>`;

  function nbInitials(name){
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }

  function nbEscape(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderNoticeBoard(){
    const q   = (nbSearchInput.value || '').trim().toLowerCase();
    const cat = nbActiveCategory;

    const filtered = noticeBoardData.filter(n => {
      const matchesSearch = !q
        || n.title.toLowerCase().includes(q)
        || n.body.toLowerCase().includes(q)
        || n.tags.some(t => t.toLowerCase().includes(q));
      const matchesCategory = cat === 'all' || n.category === cat;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    if(!filtered.length){
      nbGrid.hidden = true;
      nbEmpty.hidden = false;
      nbGrid.innerHTML = '';
      return;
    }

    nbGrid.hidden = false;
    nbEmpty.hidden = true;

    nbGrid.innerHTML = filtered.map(n => {
      const catCap = n.category ? (n.category.charAt(0).toUpperCase() + n.category.slice(1)) : 'General';
      const initials = nbInitials(n.author);
      return `
        <div class="c-notice-card" data-category="${catCap}">
          ${n.pinned ? `
            <span class="c-notice-card__pin" title="Pinned notice">
              <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
            </span>
          ` : ''}
          <div class="c-notice-card__tags">
            ${n.tags.map(t => `<span class="c-tag">${nbEscape(t)}</span>`).join('')}
          </div>
          <h3 class="c-notice-card__title">${nbEscape(n.title)}</h3>
          <p class="c-notice-card__body">${nbEscape(n.body)}</p>
          <div class="c-notice-card__footer">
            <div class="c-notice-card__author">
              <span class="c-avatar">${initials}</span>
              <div>
                <p class="c-notice-card__author-name">${nbEscape(n.author)}</p>
                <p class="c-notice-card__date">${n.date.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function closeNbDropdown(){
    nbDropdown.classList.remove('is-open');
    nbDropdownMenu.hidden = true;
    nbDropdownBtn.setAttribute('aria-expanded', 'false');
  }

  function openNbDropdown(){
    nbDropdown.classList.add('is-open');
    nbDropdownMenu.hidden = false;
    nbDropdownBtn.setAttribute('aria-expanded', 'true');
  }

  nbDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if(nbDropdownMenu.hidden) openNbDropdown(); else closeNbDropdown();
  });

  nbDropdownOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      nbActiveCategory = opt.dataset.value;
      nbDropdownLabel.textContent = opt.querySelector('span').textContent;
      nbDropdownOptions.forEach(o => {
        const selected = o === opt;
        o.classList.toggle('is-selected', selected);
        o.setAttribute('aria-selected', String(selected));
      });
      closeNbDropdown();
      renderNoticeBoard();
    });
  });

  document.addEventListener('click', (e) => {
    if(!nbDropdown.contains(e.target)) closeNbDropdown();
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeNbDropdown();
  });

  nbSearchInput.addEventListener('input', renderNoticeBoard);

  renderNoticeBoard();
});

// =========================================================
// MY PROFILE PAGE — the account photo is the only editable
// field; everything else on that page is read-only text.
// The saved photo also mirrors onto the sidebar avatar.
// =========================================================
const PROFILE_AVATAR_KEY = 'lecole_profile_avatar';

document.addEventListener('DOMContentLoaded', () => {
  const sidebarAvatar  = document.querySelector('.user-avatar');
  const profileAvatar  = document.getElementById('profile-avatar');
  const avatarEditBtn  = document.getElementById('avatar-edit-btn');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const toast = document.getElementById('profile-toast');

  function applySidebarAvatar(dataUrl){
    if(!sidebarAvatar) return;
    if(dataUrl){
      sidebarAvatar.style.backgroundImage = `url(${dataUrl})`;
      sidebarAvatar.style.backgroundSize = 'cover';
      sidebarAvatar.style.backgroundPosition = 'center';
      sidebarAvatar.style.padding = '0';
      sidebarAvatar.innerHTML = '';
    } else {
      sidebarAvatar.style.backgroundImage = '';
      sidebarAvatar.style.padding = '6px';
      sidebarAvatar.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
    }
  }

  function applyProfileAvatar(dataUrl){
    if(!profileAvatar) return;
    if(dataUrl){
      profileAvatar.style.backgroundImage = `url(${dataUrl})`;
      profileAvatar.style.backgroundSize = 'cover';
      profileAvatar.style.backgroundPosition = 'center';
      profileAvatar.textContent = '';
    } else {
      profileAvatar.style.backgroundImage = '';
      profileAvatar.textContent = 'JP';
    }
  }

  function showToast(message){
    if(!toast) return;
    if(message) toast.querySelector('span').textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  // apply whatever photo was saved previously
  const savedAvatar = localStorage.getItem(PROFILE_AVATAR_KEY);
  applySidebarAvatar(savedAvatar);
  applyProfileAvatar(savedAvatar);

  // the camera icon on the Profile page is the only way to change the photo
  if(avatarEditBtn && avatarFileInput){
    avatarEditBtn.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', () => {
      const file = avatarFileInput.files && avatarFileInput.files[0];
      if(!file) return;

      if(!file.type.startsWith('image/')){
        showToast('Please choose an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        applyProfileAvatar(dataUrl);
        applySidebarAvatar(dataUrl);
        try{
          localStorage.setItem(PROFILE_AVATAR_KEY, dataUrl);
        }catch(err){
          // storage may be full for very large images — photo still shows for this session
        }
        showToast('Profile photo updated');
      };
      reader.readAsDataURL(file);
    });
  }
});

// =========================================================
// CHARACTER CERTIFICATE — single-page pagination
// =========================================================
// =========================================================
// CHARACTER CERTIFICATE — A4 Page Layout Engine (matching Management Panel)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const certVisiblePage = document.getElementById('certVisiblePage');
  const certContentRef = document.getElementById('certContentRef');
  if (!certVisiblePage || !certContentRef) return;

  const PAGE_INNER_HEIGHT = 915; // 1011px - 48px top - 48px bottom padding
  const SECTION_GAP = 28;
  const ITEM_GAP = 8;
  let certificatePage = 1;
  let totalPages = 1;

  function buildBlocks() {
    const blocks = [];
    const header = certContentRef.querySelector('.cert-doc-header');
    if (header) blocks.push({ kind: 'header', node: header, height: header.offsetHeight });

    const body = certContentRef.querySelector('.cert-doc-body');
    if (body) {
      Array.from(body.children).forEach((sec, sIdx) => {
        if (!sec.classList.contains('cert-section-block')) {
          blocks.push({ kind: 'other', node: sec, height: sec.offsetHeight });
          return;
        }
        const heading = sec.querySelector('.cert-section-heading');
        if (heading) blocks.push({ kind: 'heading', node: heading, sIdx, height: heading.offsetHeight });

        const pointsList = sec.querySelector('.cert-points');
        if (pointsList) {
          Array.from(pointsList.querySelectorAll(':scope > li')).forEach(li => {
            blocks.push({ kind: 'item', node: li, sIdx, listType: 'points', height: li.offsetHeight });
          });
          return;
        }
        const grid = sec.querySelector('.particulars-grid');
        if (grid) {
          Array.from(grid.querySelectorAll(':scope > .fact-row')).forEach(row => {
            blocks.push({ kind: 'item', node: row, sIdx, listType: 'grid', height: row.offsetHeight });
          });
        }
      });
    }

    const footer = certContentRef.querySelector('.cert-doc-footer');
    if (footer) blocks.push({ kind: 'footer', node: footer, height: footer.offsetHeight });

    return blocks;
  }

  function paginateContent() {
    const blocks = buildBlocks();
    if (!blocks.length) return [[]];

    const pages = [[]];
    let curH = 0;

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      if (b.kind === 'heading') {
        const sectionItems = [];
        for (let j = i + 1; j < blocks.length && blocks[j].sIdx === b.sIdx; j++) {
          sectionItems.push(blocks[j]);
        }

        const headingCost = b.height + 16;
        let min3H = headingCost;
        for (let k = 0; k < Math.min(3, sectionItems.length); k++) {
          min3H += sectionItems[k].height + ITEM_GAP;
        }

        if (curH + min3H + SECTION_GAP > PAGE_INNER_HEIGHT && curH > 0) {
          pages.push([]);
          curH = 0;
        }

        pages[pages.length - 1].push(b);
        curH += headingCost;
      } else if (b.kind === 'item') {
        const cost = b.height + ITEM_GAP;
        if (curH + cost > PAGE_INNER_HEIGHT && curH > 0) {
          pages.push([]);
          curH = 0;
        }
        pages[pages.length - 1].push(b);
        curH += cost;
      } else {
        const cost = b.height + SECTION_GAP;
        if (curH + cost > PAGE_INNER_HEIGHT && curH > 0) {
          pages.push([]);
          curH = 0;
        }
        pages[pages.length - 1].push(b);
        curH += cost;
      }
    }

    totalPages = pages.length;
    if (certificatePage > totalPages) certificatePage = totalPages;
    return pages;
  }

  function renderCurrentPage() {
    const pages = paginateContent();
    const pageIdx = certificatePage - 1;
    const pageBlocks = pages[pageIdx] || pages[0] || [];

    certVisiblePage.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'cert-doc-inner';

    let openSection = null;
    let openList = null;
    let openSIdx = -1;

    function flushSection() {
      if (openSection) { inner.appendChild(openSection); openSection = null; openList = null; openSIdx = -1; }
    }

    for (const b of pageBlocks) {
      if (b.kind === 'header' || b.kind === 'footer' || b.kind === 'other') {
        flushSection();
        inner.appendChild(b.node.cloneNode(true));
      } else if (b.kind === 'heading') {
        flushSection();
        openSection = document.createElement('div');
        openSection.className = 'cert-section-block';
        openSIdx = b.sIdx;
        openSection.appendChild(b.node.cloneNode(true));
      } else if (b.kind === 'item') {
        if (!openSection || openSIdx !== b.sIdx) {
          flushSection();
          openSection = document.createElement('div');
          openSection.className = 'cert-section-block';
          openSIdx = b.sIdx;
        }
        if (!openList) {
          if (b.listType === 'grid') {
            openList = document.createElement('div');
            openList.className = 'particulars-grid';
          } else {
            openList = document.createElement('ul');
            openList.className = 'cert-points';
          }
          openSection.appendChild(openList);
        }
        openList.appendChild(b.node.cloneNode(true));
      }
    }
    flushSection();

    const overlay = document.createElement('div');
    overlay.className = 'page-footer-overlay no-print';
    overlay.innerHTML = `<p>Page ${certificatePage} of ${totalPages}</p>`;

    certVisiblePage.appendChild(inner);
    certVisiblePage.appendChild(overlay);

    const paginationRow = document.getElementById('certPaginationRow');
    const pageLabel = document.getElementById('certPageLabel');
    const prevBtn = document.getElementById('cert-prev-btn');
    const nextBtn = document.getElementById('cert-next-btn');

    if (paginationRow) {
      if (totalPages > 1) {
        paginationRow.style.display = 'flex';
        if (pageLabel) pageLabel.textContent = `Page ${certificatePage} of ${totalPages}`;
        if (prevBtn) {
          prevBtn.disabled = certificatePage === 1;
          prevBtn.onclick = () => { if (certificatePage > 1) { certificatePage--; renderCurrentPage(); } };
        }
        if (nextBtn) {
          nextBtn.disabled = certificatePage === totalPages;
          nextBtn.onclick = () => { if (certificatePage < totalPages) { certificatePage++; renderCurrentPage(); } };
        }
      } else {
        paginationRow.style.display = 'none';
      }
    }
  }

  renderCurrentPage();
  window.addEventListener('resize', renderCurrentPage);

  // Trigger re-render when switching tabs to Character Certificate page
  const certTabNav = document.querySelectorAll('[data-page="certificates"]');
  certTabNav.forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(renderCurrentPage, 50);
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const brandLink = document.getElementById('j-brand-home-link');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '../Admin/landing_page/landing/index.html';
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '../Admin/landing_page/sign-in/access.html';
    });
  }

  const toggleBtn = document.getElementById('j-sidebar-toggle');
  const sidebarEl = document.getElementById('j-sidebar');
  let isCollapsed = false;
  if (toggleBtn && sidebarEl) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isCollapsed = !isCollapsed;
      sidebarEl.classList.toggle('c-is-collapsed', isCollapsed);
      document.body.classList.toggle('c-is-sidebar-collapsed', isCollapsed);
      toggleBtn.setAttribute('aria-label', isCollapsed ? 'Expand navigation' : 'Collapse navigation');
      const collapseIcon = toggleBtn.querySelector('.j-collapse-icon');
      if (collapseIcon) {
        collapseIcon.innerHTML = isCollapsed
          ? '<path d="m9 18 6-6-6-6"/>'
          : '<path d="m15 18-6-6 6-6"/>';
      }
    });
  }

  /* ---------------------------------------------------------
     Upcoming Events View All Modal Popup Logic
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Upcoming Events & Calendar View All Modal Popup Logic (1:1 Admin Parity)
     --------------------------------------------------------- */
  const dayScheduleEls = {
    layer: document.getElementById('j-modal-day-schedule'),
    title: document.getElementById('j-day-schedule-title'),
    description: document.getElementById('j-day-schedule-description'),
    body: document.getElementById('j-day-schedule-body')
  };

  function openDayScheduleModal() {
    const layer = dayScheduleEls.layer || document.getElementById('j-modal-day-schedule');
    const title = dayScheduleEls.title || document.getElementById('j-day-schedule-title');
    const description = dayScheduleEls.description || document.getElementById('j-day-schedule-description');
    const body = dayScheduleEls.body || document.getElementById('j-day-schedule-body');

    if (!layer) return;

    const state = window.studentCalendarState || {};
    const events = state.calendarEvents || [];
    const selDate = state.selectedDate || new Date();

    const sameCalendarDay = (d1, d2) => {
      if (!d1 || !d2) return false;
      const a = new Date(d1), b = new Date(d2);
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    };

    const dayEvents = events.filter((ev) => sameCalendarDay(ev.date, selDate));
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const longDate = `${WEEKDAYS[selDate.getDay()]}, ${MONTH_NAMES[selDate.getMonth()]} ${selDate.getDate()}, ${selDate.getFullYear()}`;

    if (title) title.textContent = longDate;
    if (description) description.textContent = dayEvents.length === 1
      ? '1 event is scheduled for this day.'
      : `${dayEvents.length} events are scheduled for this day.`;

    if (body) {
      if (dayEvents.length) {
        body.innerHTML = `<ol class="c-day-schedule__list">${dayEvents.map((event, index) => `
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
        body.innerHTML = `
          <div class="c-day-schedule__empty">
            <span class="c-day-schedule__empty-icon" aria-hidden="true">
              <svg class="c-icon" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            </span>
            <h3 class="c-day-schedule__empty-title">No events scheduled</h3>
            <p class="c-day-schedule__empty-text">${longDate} is clear.</p>
          </div>`;
      }
    }

    layer.classList.add('c-is-open');
  }

  window.openCalendarDayModal = openDayScheduleModal;

  // Dismiss modal handlers (matches Admin 1:1)
  document.querySelectorAll('.c-modal-layer').forEach((layer) => {
    layer.querySelectorAll('.j-modal-backdrop, .j-modal-close').forEach((el) => {
      el.addEventListener('click', () => layer.classList.remove('c-is-open'));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.c-modal-layer.c-is-open').forEach((layer) => layer.classList.remove('c-is-open'));
    }
  });

  const viewAllBtn = document.getElementById('j-open-day-schedule');
  if (viewAllBtn) viewAllBtn.addEventListener('click', openDayScheduleModal);
});
