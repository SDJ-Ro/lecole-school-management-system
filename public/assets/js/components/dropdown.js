// Every change fires a dropdown:change event that bubbles up
// Inside a form with data-submit-on-change, a choice also sends the form
(function ()
{
  'use strict';

  const byIdOrElement = (target) => typeof target === 'string' ? document.getElementById(target) : target;
  const isMulti = (root) => root.dataset.multi === 'true';
  const optionsOf = (root) => [...root.querySelectorAll('.c-dropdown__option')];
  const labelOf = (option) => option.dataset.label ?? option.textContent.trim();   // Leaves out the option's small second line
  const TICK = '<svg class="c-icon c-dropdown__tick" width="14" height="14" aria-hidden="true"><use href="#icon-check"/></svg>';

  // Stays right of the sidebar and 12px from every window edge
  function getSafeViewportBounds()
  {
    const sidebar = document.querySelector('.c-sidebar');
    const sidebarRight = sidebar && getComputedStyle(sidebar).display !== 'none' ? sidebar.getBoundingClientRect().right : 0;

    return {
      minLeft: Math.max(sidebarRight + 12, 12),
      maxRight: window.innerWidth - 12,
      minTop: 12,
      maxBottom: window.innerHeight - 12
    };
  }

  function clearMenuPosition(menu)
  {
    menu.style.left = '';
    menu.style.right = '';
    menu.classList.remove('c-dropdown__menu--end', 'c-dropdown__menu--up');
  }

  // Opens upwards when there is no room below
  function placeMenu(menu, trigger)
  {
    const bounds = getSafeViewportBounds();
    const menuBox = menu.getBoundingClientRect();
    const triggerBox = trigger.getBoundingClientRect();

    if (menuBox.left < bounds.minLeft)
    {
      menu.style.left = `${Math.max(0, bounds.minLeft - triggerBox.left)}px`;   // Worked out while running, so a CSS class can't hold it
      menu.style.right = 'auto';
    }
    else if (menuBox.right > bounds.maxRight)
    {
      menu.classList.add('c-dropdown__menu--end');
    }

    const menuHeight = menuBox.height || 85;

    if (bounds.maxBottom - triggerBox.bottom < menuHeight && triggerBox.top - bounds.minTop >= menuHeight)
    {
      menu.classList.add('c-dropdown__menu--up');
    }
  }

  function closeAllDropdowns()
  {
    document.querySelectorAll('.c-dropdown.c-is-open').forEach(root =>
    {
      root.classList.remove('c-is-open');
      root.querySelector('.c-dropdown__trigger').setAttribute('aria-expanded', 'false');
      clearMenuPosition(root.querySelector('.c-dropdown__menu'));
    });
  }

  function openDropdown(root)
  {
    const trigger = root.querySelector('.c-dropdown__trigger');
    const menu = root.querySelector('.c-dropdown__menu');

    closeAllDropdowns();
    root.classList.add('c-is-open');
    trigger.setAttribute('aria-expanded', 'true');

    placeMenu(menu, trigger);
  }

  function showSingleValue(root, option)
  {
    const value = root.querySelector('.c-dropdown__value');
    const input = root.querySelector('input[type="hidden"]');

    optionsOf(root).forEach(opt =>
    {
      opt.classList.toggle('c-is-selected', opt === option);
      opt.setAttribute('aria-selected', opt === option ? 'true' : 'false');
    });

    value.textContent = labelOf(option);
    value.classList.remove('c-dropdown__placeholder');

    if (input)
    {
      input.value = option.dataset.value;
    }
  }

  function optionLabel(root, value)
  {
    const option = optionsOf(root).find(opt => opt.dataset.value === value);
    return option ? labelOf(option) : value;
  }

  // Built as elements, so names can't add HTML
  function chip(root, value)
  {
    const label = optionLabel(root, value);
    const chipEl = document.createElement('span');
    const text = document.createElement('span');
    const remove = document.createElement('span');

    chipEl.className = 'c-chip';
    text.textContent = label;
    remove.className = 'c-chip__remove j-chip-remove';
    remove.setAttribute('role', 'button');
    remove.setAttribute('aria-label', `Remove ${label}`);
    remove.tabIndex = 0;
    remove.dataset.val = value;
    remove.innerHTML = '<svg class="c-icon" width="10" height="10" aria-hidden="true"><use href="#icon-close"/></svg>';
    chipEl.append(text, remove);
    return chipEl;
  }
