// This file only shows events. event-editor.js changes them and sends the new list back through calendarApi.setEvents().
(function ()
{
  'use strict';

  document.addEventListener('DOMContentLoaded', function ()
  {
    const calendarEl = document.getElementById('j-calendar');
    if (!calendarEl) return;

    const firstYear = Number(calendarEl.dataset.firstYear);
    const lastYear = Number(calendarEl.dataset.lastYear);

    // Local time, so the day never shifts
    function parseDate(text)
    {
      const [y, m, d] = String(text).split('-').map(Number);
      return new Date(y, m - 1, d);
    }

    function formatIsoDate(date)
    {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function formatDate(date, withYear, withWeekday)
    {
      return window.formatSchoolDate(formatIsoDate(date), withWeekday ? 'long' : withYear ? 'full' : 'day');
    }

    // The school's today, never the computer's clock
    const today = parseDate(window.schoolToday);

    function sameDay(a, b)
    {
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    const state = {
      viewDate: new Date(today.getFullYear(), today.getMonth(), 1),
      selectedDate: today,
      events: []
    };

    function setEvents(list)
    {
      state.events = list.map(ev => ({ ...ev, date: parseDate(ev.date) }));
    }

    function eventsOn(date)
    {
      return state.events.filter(ev => sameDay(ev.date, date));
    }

    // A chosen day without events moves to the month's first day that has some
    function chooseDayWithEvents()
    {
      if (eventsOn(state.selectedDate).length > 0) return;
      const first = state.events.find(ev =>
        ev.date.getFullYear() === state.viewDate.getFullYear() && ev.date.getMonth() === state.viewDate.getMonth()
      );
      if (first) state.selectedDate = first.date;
    }

    function renderGrid()
    {
      const daysEl = document.getElementById('j-calendar-days');
      const year = state.viewDate.getFullYear();
      const month = state.viewDate.getMonth();
      const blanksBefore = (new Date(year, month, 1).getDay() + 6) % 7;   // The week starts on Monday
      const dayCount = new Date(year, month + 1, 0).getDate();

      daysEl.innerHTML = '';

      for (let i = 0; i < blanksBefore; i++)
      {
        daysEl.appendChild(blankCell());
      }

      for (let day = 1; day <= dayCount; day++)
      {
        const date = new Date(year, month, day);
        const count = eventsOn(date).length;
        const isSelected = sameDay(date, state.selectedDate);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'c-calendar__day';
        btn.classList.toggle('c-has-events', count > 0);
        btn.classList.toggle('c-is-selected', isSelected);
        btn.classList.toggle('c-calendar__day--today', sameDay(date, today));
        btn.dataset.day = String(day);
        btn.setAttribute('aria-label', `${formatDate(date)}, ${count} events`);

        const number = document.createElement('span');
        number.className = 'c-calendar__day-number';
        number.textContent = String(day);
        btn.appendChild(number);

        if (count > 0 && !isSelected)
        {
          const dot = document.createElement('span');
          dot.className = 'c-calendar__day-dot';
          dot.setAttribute('aria-hidden', 'true');
          btn.appendChild(dot);
        }

        daysEl.appendChild(btn);
      }

      while (daysEl.children.length % 7 !== 0)
      {
        daysEl.appendChild(blankCell());
      }
    }
