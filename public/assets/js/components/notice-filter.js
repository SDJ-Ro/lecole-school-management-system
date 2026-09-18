// Filtering happens in the browser. The server sets each card's data flags and this file compares them.
(function ()
{
  'use strict';

  const board = document.getElementById('j-notice-board');

  if (!board) return;

  const search = board.querySelector('.j-notice-search');
  const audienceFilter = board.querySelector('.j-notice-audience-filter');
  const filters = { text: '', category: 'all', audience: 'all', tab: board.dataset.tab };   // An empty tab means the board has no tabs

  function matches(card)
  {
    const data = card.dataset;
    const inTab = filters.tab === 'my-notices' ? data.forMe === 'true' && data.mine === 'false'
      : filters.tab === 'my-posts' ? data.mine === 'true'
      : filters.tab === 'waiting' ? data.review === 'pending'
      : true;
    const forAudience = filters.audience === 'all' || data.audience === 'all' || data.audience.split(',').includes(filters.audience);

    return inTab && forAudience
      && (filters.category === 'all' || data.category === filters.category)
      && card.textContent.toLowerCase().includes(filters.text);
  }

  function apply()
  {
    let shown = 0;

    board.querySelectorAll('.c-notice-card').forEach((card) =>
    {
      card.hidden = !matches(card);
      shown += card.hidden ? 0 : 1;
    });
    document.getElementById('j-notice-empty').hidden = shown > 0;
  }

  search.addEventListener('input', () =>
  {
    filters.text = search.value.trim().toLowerCase();
    apply();
  });

  board.addEventListener('dropdown:change', (event) =>
  {
    if (event.target.id === 'j-notice-filter-category') filters.category = event.detail.value;
    if (event.target.id === 'j-notice-filter-audience') filters.audience = event.detail.value;
    apply();
  });

  board.querySelectorAll('.j-notice-tab').forEach((tab) => tab.addEventListener('click', () =>
  {
    filters.tab = tab.dataset.tab;
    board.querySelectorAll('.j-notice-tab').forEach((each) => each.setAttribute('aria-selected', String(each === tab)));

    // Everything in "My Notices" is already for me, so the audience filter is pointless there
    audienceFilter.hidden = filters.tab === 'my-notices';
    if (filters.tab === 'my-notices')
    {
      filters.audience = 'all';
      window.setDropdownValue('j-notice-filter-audience', 'all');
    }
    apply();
  }));

  board.querySelector('.j-notice-clear').addEventListener('click', () =>
  {
    search.value = '';
    Object.assign(filters, { text: '', category: 'all', audience: 'all' });
    window.setDropdownValue('j-notice-filter-category', 'all');
    if (audienceFilter) window.setDropdownValue('j-notice-filter-audience', 'all');
    apply();
  });

  apply();
})();
