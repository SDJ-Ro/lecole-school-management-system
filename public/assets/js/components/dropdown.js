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

 function showMultiValues(root, values)
  {
    optionsOf(root).forEach(opt =>
    {
      const chosen = values.includes(opt.dataset.value);
      opt.classList.toggle('c-is-selected', chosen);
      opt.setAttribute('aria-selected', chosen ? 'true' : 'false');
    });

    root.querySelector('.j-dropdown-chips').replaceChildren(...values.map(value => chip(root, value)));
    root.querySelector('.j-dropdown-placeholder').hidden = values.length > 0;
    root.querySelector('.j-dropdown-hidden-inputs').replaceChildren(...values.map(value =>
    {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = root.dataset.name;
      input.value = value;
      return input;
    }));

    root.dispatchEvent(new CustomEvent('dropdown:change', { detail: { value: values.join(','), values }, bubbles: true }));
  }

  // "All" can't be mixed with other choices, and choosing nothing means "All"
  function allValueOf(root)
  {
    return root.querySelector('[data-value="all"], [data-value="All"]')?.dataset.value;
  }

  function toggleMultiValue(root, value, choose)
  {
    const allValue = allValueOf(root);
    let values = optionsOf(root).filter(opt => opt.classList.contains('c-is-selected')).map(opt => opt.dataset.value);
    choose = typeof choose === 'boolean' ? choose : !values.includes(value);

    if (value === allValue)
    {
      values = choose ? [allValue] : values;
    }
    else
    {
      values = values.filter(v => v !== allValue && v !== value);
      if (choose) values.push(value);
      if (allValue && values.length === 0) values = [allValue];
    }

    showMultiValues(root, values);
  }

  document.addEventListener('click', function (e)
  {
    const remove = e.target.closest('.j-chip-remove');
    const trigger = e.target.closest('.c-dropdown__trigger');
    const option = e.target.closest('.c-dropdown__option');

    // A chip's remove button sits inside the trigger, so it is checked first
    if (remove)
    {
      e.preventDefault();
      e.stopPropagation();
      toggleMultiValue(remove.closest('.c-dropdown'), remove.dataset.val, false);
      return;
    }

    if (trigger)
    {
      e.preventDefault();
      e.stopPropagation();
      const root = trigger.closest('.c-dropdown');

      if (root.classList.contains('c-is-open'))
      {
        closeAllDropdowns();
      }
      else
      {
        openDropdown(root);
      }
      return;
    }

    if (option)
    {
      e.preventDefault();
      e.stopPropagation();
      const root = option.closest('.c-dropdown');

      if (isMulti(root))
      {
        toggleMultiValue(root, option.dataset.value);   // The menu stays open so more can be picked
        return;
      }

      showSingleValue(root, option);
      closeAllDropdowns();
      root.querySelector('.c-dropdown__trigger').focus();
      root.dispatchEvent(new CustomEvent('dropdown:change', { detail: { value: option.dataset.value, label: labelOf(option), id: root.id }, bubbles: true }));

      root.closest('form[data-submit-on-change]')?.submit();
      return;
    }

    closeAllDropdowns();
  });

  // On a closed menu the arrow keys open it on the chosen option
  function moveThroughOptions(root, step)
  {
    const options = optionsOf(root);

    if (!root.classList.contains('c-is-open'))
    {
      openDropdown(root);
      (options.find(opt => opt.classList.contains('c-is-selected')) || options[0])?.focus();
      return;
    }

    const current = options.indexOf(document.activeElement);
    const next = current === -1 ? 0 : Math.min(options.length - 1, Math.max(0, current + step));
    options[next]?.focus();
  }

  document.addEventListener('keydown', function (e)
  {
    const root = e.target.closest('.c-dropdown');
 
    if (e.key === 'Escape')
    {
      closeAllDropdowns();
      root?.querySelector('.c-dropdown__trigger').focus();
      return;
    }

    if (root && (e.key === 'ArrowDown' || e.key === 'ArrowUp'))
    {
      e.preventDefault();
      moveThroughOptions(root, e.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    // The multi-select trigger and the chip remove buttons are not real buttons, so Enter and Space are handled here
    const fakeButton = e.target.closest('.j-chip-remove, div.c-dropdown__trigger');

    if (fakeButton && (e.key === 'Enter' || e.key === ' '))
    {
      e.preventDefault();
      fakeButton.click();
    }
  });

  // Uses the capture phase on window, so other submit handlers never see a send stopped by an empty required dropdown
  window.addEventListener('submit', function (e)
  {
    const empty = [...e.target.querySelectorAll('.c-dropdown[data-required]')].filter(root => getDropdownValue(root) === '');

    if (empty.length === 0)
    {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    empty.forEach(root => root.querySelector('.j-dropdown-error').hidden = false);
    empty[0].querySelector('.c-dropdown__trigger').focus();
  }, true);

  document.addEventListener('dropdown:change', function (e)
  {
    const error = e.target.querySelector(':scope > .j-dropdown-error');

    if (error)
    {
      error.hidden = true;
    }
  });

  // reset() can't restore a hidden input, because setting its value also changes its default. So the first values are kept here.
  const startValues = new Map([...document.querySelectorAll('.c-dropdown:not([data-multi]) > input[type="hidden"]')]
    .map(input => [input, input.value]));

  document.addEventListener('reset', function (e)
  {
    e.target.querySelectorAll('.c-dropdown:not([data-multi])').forEach(root =>
    {
      const input = root.querySelector(':scope > input[type="hidden"]');
      const error = root.querySelector(':scope > .j-dropdown-error');

      if (input && startValues.has(input))   // A dropdown without a name isn't sent, so it keeps its choice
      {
        startValues.get(input) === '' ? resetDropdown(root) : setDropdownValue(root, startValues.get(input));
      }

      if (error)
      {
        error.hidden = true;
      }
    });
  });

  function setDropdownMultiValues(dropdownId, values)
  {
    const root = byIdOrElement(dropdownId);
    if (!root) return;

    let list = [].concat(values ?? []).map(String);
    if (list.length === 0 && allValueOf(root)) list = [allValueOf(root)];
    showMultiValues(root, list);
  }

  function setDropdownValue(dropdownId, value)
  {
    const root = byIdOrElement(dropdownId);
    if (!root) return;

    if (isMulti(root))
    {
      setDropdownMultiValues(root, value);
      return;
    }

    const option = optionsOf(root).find(opt => opt.dataset.value === String(value ?? ''));
    if (option) showSingleValue(root, option);
  }

  function getDropdownValue(dropdownId)
  {
    const root = byIdOrElement(dropdownId);
    if (!root) return '';

    const chosen = optionsOf(root).filter(opt => opt.classList.contains('c-is-selected')).map(opt => opt.dataset.value);
    return isMulti(root) ? chosen : (chosen[0] ?? '');
  }

  function resetDropdown(dropdownId)
  {
    const root = byIdOrElement(dropdownId);
    if (!root) return;

    if (isMulti(root))
    {
      showMultiValues(root, []);
      return;
    }

    const value = root.querySelector('.c-dropdown__value');
    const input = root.querySelector('input[type="hidden"]');

    optionsOf(root).forEach(opt =>
    {
      opt.classList.remove('c-is-selected');
      opt.setAttribute('aria-selected', 'false');
    });
    value.textContent = root.dataset.placeholder;
    value.classList.add('c-dropdown__placeholder');

    if (input)
    {
      input.value = '';
    }
  }

  // Must match the option HTML the server draws. Names are set as text, so they can't add HTML.
  function setDropdownOptions(dropdownId, options, chosen)
  {
    const root = byIdOrElement(dropdownId);
    if (!root) return;

    root.querySelector('.c-dropdown__menu').replaceChildren(...options.map(opt =>
    {
      const value = String(typeof opt === 'object' ? (opt.value ?? opt.label) : opt);
      const option = document.createElement('button');
      const label = document.createElement('span');
      const text = document.createElement('span');

      option.type = 'button';
      option.className = 'c-dropdown__option';
      option.dataset.value = value;
      option.dataset.label = typeof opt === 'object' ? (opt.label ?? value) : value;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      label.className = 'c-dropdown__label';
      text.textContent = option.dataset.label;
      label.append(text);
      option.append(label);
      option.insertAdjacentHTML('beforeend', TICK);
      return option;
    }));

    resetDropdown(root);
    if (chosen !== undefined) setDropdownValue(root, chosen);
  }

  window.setDropdownValue = setDropdownValue;
  window.getDropdownValue = getDropdownValue;
  window.setDropdownMultiValues = setDropdownMultiValues;
  window.setDropdownOptions = setDropdownOptions;
  window.resetDropdown = resetDropdown;
  window.getSafeViewportBounds = getSafeViewportBounds;
})();