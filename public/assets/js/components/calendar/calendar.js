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

    function blankCell()
    {
      const blank = document.createElement('span');
      blank.className = 'c-calendar__day-blank';
      blank.setAttribute('aria-hidden', 'true');
      return blank;
    }

    // Empty when this role's page doesn't have that template
    function fromTemplate(id)
    {
      const template = document.getElementById(id);
      return template ? template.content.cloneNode(true) : null;
    }

    function dayEvents()
    {
      return eventsOn(state.selectedDate);   // The server already sorts them, all-day events first, then by start time
    }

    function countText(count)
    {
      return `${count} event${count === 1 ? '' : 's'} scheduled`;
    }

    function fill(el, text)
    {
      el.textContent = text;
      el.hidden = !text;
    }

    function renderDay()
    {
      const detailEl = document.getElementById('j-calendar-day-detail');
      const events = dayEvents();

      document.getElementById('j-calendar-event-count').textContent = countText(events.length);
      document.getElementById('j-open-day-schedule').hidden = events.length === 0;

      const list = document.createElement('div');
      list.className = 'c-calendar__day-events';

      // Events can only be added from today on. Only staff pages have the "Add event" template.
      const isPast = formatIsoDate(state.selectedDate) < window.schoolToday;
      const addButton = isPast ? null : fromTemplate('tmpl-calendar-add-btn');

      if (events.length === 0)
      {
        const empty = fromTemplate(addButton ? 'tmpl-calendar-empty-short' : 'tmpl-calendar-empty');
        empty.querySelector('.j-calendar-empty-date').textContent = formatDate(state.selectedDate);
        list.appendChild(empty);
      }

      events.forEach(ev =>
      {
        const card = fromTemplate('tmpl-calendar-card');
        card.querySelector('article').dataset.eventId = ev.id;
        card.querySelector('article').classList.toggle('c-day-event-card--modifiable', ev.canDelete);   // Makes room for the edit and delete buttons
        card.querySelector('.j-card-eyebrow').textContent = `${formatDate(state.selectedDate)} · ${ev.time}`;
        card.querySelector('.j-card-title').textContent = ev.title;
        fill(card.querySelector('.j-card-details'), ev.details);
        fill(card.querySelector('.j-card-badge'), ev.audienceLabel);
        card.querySelector('.j-card-actions').hidden = !ev.canDelete;
        card.querySelector('.j-card-edit').hidden = !ev.canEdit;   // Past events can only be deleted, not edited
        list.appendChild(card);
      });

      if (addButton)
      {
        list.appendChild(addButton);
      }
      else if (events.length > 0)
      {
        list.appendChild(fromTemplate('tmpl-calendar-no-more'));
      }

      detailEl.replaceChildren(list);
    }
    
    function openDaySchedule()
    {
      const events = dayEvents();
      const longDate = formatDate(state.selectedDate, true, true);
      const listEl = document.getElementById('j-day-schedule-list');

      document.getElementById('j-day-schedule-title').textContent = longDate;
      document.getElementById('j-day-schedule-description').textContent = `${countText(events.length)} for this day.`;
      document.getElementById('j-day-schedule-empty').hidden = events.length > 0;
      document.getElementById('j-day-schedule-empty-text').textContent = `${longDate} is clear.`;

      listEl.replaceChildren(...events.map(ev =>
      {
        const item = fromTemplate('tmpl-day-schedule-item');
        item.querySelector('li').dataset.eventId = ev.id;
        item.querySelector('.j-schedule-item-time').textContent = ev.time;
        item.querySelector('.j-schedule-item-title').textContent = ev.title;
        fill(item.querySelector('.j-schedule-item-category'), ev.category);
        item.querySelector('.j-schedule-edit').hidden = !ev.canEdit;
        item.querySelector('.j-schedule-delete').hidden = !ev.canDelete;
        item.querySelector('.j-schedule-item-details-text').textContent = ev.details;
        item.querySelector('.j-schedule-item-details').hidden = !ev.details;
        item.querySelector('.j-schedule-item-meta').hidden = false;
        fill(item.querySelector('.j-schedule-item-badge'), ev.audienceLabel);
        fill(item.querySelector('.j-schedule-item-author'), ev.authorLabel);
        return item;
      }));

      window.openPopUp('j-day-schedule');
    }

    function renderHeader()
    {
      const month = state.viewDate.getMonth();
      const year = state.viewDate.getFullYear();

      window.setDropdownValue('j-select-month', String(month));
      window.setDropdownValue('j-select-year', String(year));
      document.getElementById('j-calendar-prev').disabled = year === firstYear && month === 0;
      document.getElementById('j-calendar-next').disabled = year === lastYear && month === 11;
    }

    function showMonth(year, month)
    {
      state.viewDate = new Date(year, month, 1);
      state.selectedDate = state.viewDate;
      chooseDayWithEvents();
      refresh();
    }

    function refresh()
    {
      renderHeader();
      renderGrid();
      renderDay();
    }

    document.getElementById('j-calendar-prev').addEventListener('click', () =>
    {
      showMonth(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1);
    });

    document.getElementById('j-calendar-next').addEventListener('click', () =>
    {
      showMonth(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1);
    });

    document.getElementById('j-select-month').addEventListener('dropdown:change', (e) =>
    {
      showMonth(state.viewDate.getFullYear(), Number(e.detail.value));
    });

    document.getElementById('j-select-year').addEventListener('dropdown:change', (e) =>
    {
      showMonth(Number(e.detail.value), state.viewDate.getMonth());
    });

    document.getElementById('j-calendar-days').addEventListener('click', (e) =>
    {
      const day = e.target.closest('.c-calendar__day');
      if (!day) return;
      state.selectedDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth(), Number(day.dataset.day));
      renderGrid();
      renderDay();
    });

    document.getElementById('j-open-day-schedule').addEventListener('click', openDaySchedule);

    // A click elsewhere on a card opens "View all"
    document.getElementById('j-calendar-day-detail').addEventListener('click', (e) =>
    {
      const card = e.target.closest('[data-event-id]');
      const ev = card ? state.events.find(item => String(item.id) === card.dataset.eventId) : null;

      if (e.target.closest('.j-card-edit'))
      {
        window.calendarEditor.open(ev);
      }
      else if (e.target.closest('.j-card-delete'))
      {
        window.calendarEditor.remove(ev);
      }
      else if (e.target.closest('.j-open-event-editor-btn'))
      {
        window.calendarEditor.open(null);
      }
      else if (card)
      {
        openDaySchedule();
      }
    });

    // Close "View all" first, then the editor takes over
    document.getElementById('j-day-schedule-list').addEventListener('click', (e) =>
    {
      const item = e.target.closest('[data-event-id]');
      const ev = item ? state.events.find(entry => String(entry.id) === item.dataset.eventId) : null;
      const edit = e.target.closest('.j-schedule-edit');
      if (!ev || !(edit || e.target.closest('.j-schedule-delete'))) return;

      window.closePopUp('j-day-schedule');
      if (edit)
      {
        window.calendarEditor.open(ev);
      }
      else
      {
        window.calendarEditor.remove(ev);
      }
    });

    window.calendarApi = {
      selectedDate: () => state.selectedDate,
      formatIsoDate: formatIsoDate,
      formatDate: formatDate,

      // After a save or delete, show the event's day
      setEvents: function (list, dateText)
      {
        setEvents(list);
        state.selectedDate = parseDate(dateText);
        state.viewDate = new Date(state.selectedDate.getFullYear(), state.selectedDate.getMonth(), 1);
        refresh();
      }
    };

    setEvents(JSON.parse(calendarEl.dataset.events));
    chooseDayWithEvents();
    refresh();
  });
})();
