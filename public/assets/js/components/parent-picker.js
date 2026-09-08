// The server does the search and draws the rows. This file only asks and picks one.
(function ()
{
  'use strict';

  const timers = new WeakMap();   // Each picker's waiting search

  function search(picker)
  {
    const query = picker.querySelector('.j-parent-query').value.trim();

    fetch(`${picker.dataset.url}?q=${encodeURIComponent(query)}`, { headers: { Accept: 'application/json' } })
      .then((response) => response.json())
      .then((answer) =>
      {
        picker.querySelector('.j-parent-count').textContent = answer.message;
        if (answer.ok) picker.querySelector('.j-parent-results').innerHTML = answer.html;   // The server already escaped this HTML
      })
      .catch(() => window.location.reload());   // Not JSON usually means signed out, so reload to show the sign-in page
  }

  // A picker that already has its parent searches only on Change Parent
  function start(root)
  {
    root.querySelectorAll('.j-parent-picker').forEach((picker) =>
    {
      if (!picker.querySelector('.j-parent-search').hidden) search(picker);
    });
  }

  document.addEventListener('input', (event) =>
  {
    const picker = event.target.closest('.j-parent-picker');
    if (!picker || !event.target.matches('.j-parent-query')) return;

    clearTimeout(timers.get(picker));
    timers.set(picker, setTimeout(() => search(picker), 250));
  });

  document.addEventListener('click', (event) =>
  {
    const row = event.target.closest('.j-parent-pick');
    const change = event.target.closest('.j-parent-change');
    const picker = event.target.closest('.j-parent-picker');

    if (row && picker && !row.closest('.j-parent-chosen'))
    {
      const chosen = picker.querySelector('.j-parent-chosen');

      chosen.querySelector('.j-parent-pick')?.remove();
      chosen.prepend(row.cloneNode(true));
      picker.querySelector('.j-parent-id').value = row.dataset.id;
      chosen.hidden = false;
      picker.querySelector('.j-parent-search').hidden = true;
    }

    if (change && picker)
    {
      picker.querySelector('.j-parent-search').hidden = false;
      picker.querySelector('.j-parent-query').focus();
      search(picker);
    }
  });

  document.addEventListener('content:added', (event) => start(event.detail));
  document.addEventListener('DOMContentLoaded', () => start(document));
})();
