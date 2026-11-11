// The calendar is a native popover. This file fills it in and places it.
// Listeners are on the document, so pickers added later in a pop-up need no setup.
// Today comes from the school's settings, never the computer's clock.
(function ()
{
  'use strict';

  const FIRST_YEAR = 1940;   // The first year in the list when there are no limits
  const YEARS_AHEAD = 5;

  // Local time, so a day never shifts by the time zone
  const toIso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const fromIso = (iso) => new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));


  // An empty first or last date means no limit
  // An age range is turned into dates unless it was unlocked
  function limitsOf(root)
  {
    const data = root.dataset;
    const locked = data.unlocked !== 'true';
    const thisYear = Number(window.schoolToday.slice(0, 4));
    const minAge = locked && data.minAge ? Number(data.minAge) : null;
    const maxAge = locked && data.maxAge ? Number(data.maxAge) : null;

    return {
      today: window.schoolToday,
      first: data.minDate || (maxAge !== null ? `${thisYear - maxAge}-01-01` : ''),
      last: data.maxDate || (minAge !== null ? `${thisYear - minAge}-12-31` : ''),
      hint: minAge !== null || maxAge !== null ? `Restricted to ${minAge ?? 0}–${maxAge} yrs` : 'Select a date'
    };
  }

  function yearRange(limits)
  {
    return [
      limits.first ? Number(limits.first.slice(0, 4)) : FIRST_YEAR,
      limits.last ? Number(limits.last.slice(0, 4)) : Number(limits.today.slice(0, 4)) + YEARS_AHEAD
    ];
  }

  const isAllowed = (iso, limits) => (!limits.first || iso >= limits.first) && (!limits.last || iso <= limits.last);

  // data-shown holds the first day of the shown month, kept inside the allowed years
  function showMonth(root, year, month)
  {
    const [lowest, highest] = yearRange(limitsOf(root));

    root.querySelector('.c-datepicker__calendar').dataset.shown = toIso(new Date(Math.min(Math.max(year, lowest), highest), month, 1));
    draw(root);
  }

  function draw(root)
  {
    const shown = fromIso(root.querySelector('.c-datepicker__calendar').dataset.shown);
    const limits = limitsOf(root);
    const chosen = root.querySelector('.j-datepicker-input').value;
    const today = limits.today;

    root.querySelectorAll('.j-datepicker-month-menu [data-month]').forEach((item) =>
    {
      const isShown = Number(item.dataset.month) === shown.getMonth();

      item.classList.toggle('c-datepicker__menu-item--selected', isShown);
      if (isShown) root.querySelector('.j-datepicker-month').textContent = item.textContent;
    });
    root.querySelector('.j-datepicker-year').textContent = shown.getFullYear();
    fillYears(root, shown.getFullYear(), limits);
    root.querySelectorAll('.c-datepicker__menu').forEach((menu) => menu.hidden = true);

    // The 42 days, starting on the Monday on or before the 1st
    const start = new Date(shown.getFullYear(), shown.getMonth(), 1 - (shown.getDay() + 6) % 7);

    root.querySelectorAll('.j-datepicker-days > button').forEach((button, i) =>
    {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = toIso(day);

      button.textContent = day.getDate();
      button.dataset.iso = iso;
      button.disabled = !isAllowed(iso, limits);
      button.classList.toggle('c-datepicker__day--outside', day.getMonth() !== shown.getMonth());
      button.classList.toggle('c-datepicker__day--today', iso === today);
      button.classList.toggle('c-datepicker__day--selected', iso === chosen);
    });

    root.querySelector('.j-datepicker-hint').textContent = limits.hint;
    root.querySelector('.j-datepicker-today').disabled = !isAllowed(today, limits);
  }

  function fillYears(root, shownYear, limits)
  {
    const [lowest, highest] = yearRange(limits);
    const years = Array.from({ length: Math.max(1, highest - lowest + 1) }, (_, i) => highest - i);

    root.querySelector('.j-datepicker-year-menu').replaceChildren(...years.map((year) =>
    {
      const item = document.createElement('button');

      item.type = 'button';
      item.className = 'c-datepicker__menu-item';
      item.classList.toggle('c-datepicker__menu-item--selected', year === shownYear);
      item.dataset.year = year;
      item.textContent = year;
      return item;
    }));
  }

  // Opens above the button when there is no room below, and never covers the sidebar
  function place(root)
  {
    const calendar = root.querySelector('.c-datepicker__calendar');
    const button = root.querySelector('.c-datepicker__trigger').getBoundingClientRect();
    const bounds = window.getSafeViewportBounds();
    const left = button.left + calendar.offsetWidth > bounds.maxRight ? button.right - calendar.offsetWidth : button.left;
    const below = button.bottom + 6;

    calendar.style.left = `${Math.max(bounds.minLeft, left)}px`;
    calendar.style.top = `${below + calendar.offsetHeight > bounds.maxBottom ? button.top - 6 - calendar.offsetHeight : below}px`;
  }

  // Empty when nothing is chosen
  function showValue(root, iso)
  {
    const label = root.querySelector('.j-datepicker-label');

    root.querySelector('.j-datepicker-input').value = iso;
    label.textContent = iso ? window.formatSchoolDate(iso, 'date') : root.querySelector('.c-datepicker__trigger').dataset.placeholder;
    label.classList.toggle('c-datepicker__label--empty', !iso);
  }

  function choose(root, iso)
  {
    showValue(root, iso);
    root.querySelector('.c-datepicker__calendar').hidePopover();   // The browser gives the focus back to the button
    root.dispatchEvent(new CustomEvent('datepicker:change', { bubbles: true, detail: { value: iso } }));
  }

  function toggleMenu(root, menu)
  {
    const wasOpen = !menu.hidden;

    root.querySelectorAll('.c-datepicker__menu').forEach((each) => each.hidden = true);
    menu.hidden = wasOpen;

    // Uses scrollTop instead of scrollIntoView, so only the list scrolls and not the page
    const selected = menu.querySelector('.c-datepicker__menu-item--selected');

    if (!wasOpen && selected) menu.scrollTop = selected.offsetTop - (menu.clientHeight - selected.offsetHeight) / 2;
  }

  // 'toggle' doesn't bubble, so it is caught in the capture phase
  document.addEventListener('toggle', (event) =>
  {
    if (!event.target.matches?.('.c-datepicker__calendar') || event.newState !== 'open') return;

    const root = event.target.closest('.c-datepicker');
    const start = fromIso(root.querySelector('.j-datepicker-input').value || window.schoolToday);

    showMonth(root, start.getFullYear(), start.getMonth());
    place(root);
  }, true);

  // Scrolling the page closes the calendar, so it never drifts away from its button. Scrolling the year list doesn't count.
  document.addEventListener('scroll', (event) =>
  {
    if (event.target.closest?.('.c-datepicker__calendar')) return;

    document.querySelectorAll('.c-datepicker__calendar:popover-open').forEach((calendar) => calendar.hidePopover());
  }, true);

  document.addEventListener('click', (event) =>
  {
    const button = event.target.closest('.c-datepicker__calendar button');

    if (!button) return;

    const root = button.closest('.c-datepicker');
    const shown = fromIso(root.querySelector('.c-datepicker__calendar').dataset.shown);

    if (button.dataset.iso) choose(root, button.dataset.iso);
    else if (button.matches('.j-datepicker-today')) choose(root, window.schoolToday);
    else if (button.matches('.j-datepicker-prev')) showMonth(root, shown.getFullYear(), shown.getMonth() - 1);
    else if (button.matches('.j-datepicker-next')) showMonth(root, shown.getFullYear(), shown.getMonth() + 1);
    else if (button.dataset.month !== undefined) showMonth(root, shown.getFullYear(), Number(button.dataset.month));
    else if (button.dataset.year !== undefined) showMonth(root, Number(button.dataset.year), shown.getMonth());
    else if (button.matches('.j-datepicker-month-btn')) toggleMenu(root, root.querySelector('.j-datepicker-month-menu'));
    else if (button.matches('.j-datepicker-year-btn')) toggleMenu(root, root.querySelector('.j-datepicker-year-menu'));
  });

  // While "Unlock age range" is ticked, its picker drops the age limits
  document.addEventListener('change', (event) =>
  {
    const id = event.target.dataset.unlockAges;

    if (!id) return;

    document.getElementById(id).dataset.unlocked = String(event.target.checked);
    refreshDatepicker(id);
  });

  function setDatepickerValue(id, iso)
  {
    const root = document.getElementById(id);

    showValue(root, iso || '');
    refreshDatepicker(id);
  }

  function refreshDatepicker(id)
  {
    const root = document.getElementById(id);
    const calendar = root.querySelector('.c-datepicker__calendar');

    if (!calendar.matches(':popover-open')) return;

    const shown = fromIso(calendar.dataset.shown);

    showMonth(root, shown.getFullYear(), shown.getMonth());
  }

  window.setDatepickerValue = setDatepickerValue;
  window.refreshDatepicker = refreshDatepicker;
})();
