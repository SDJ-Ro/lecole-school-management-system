// A button with data-repeat-add copies the template named after the list plus "-row" into that list
// With data-repeat-from it adds the chosen dropdown option instead, and skips empty or repeated choices
(function ()
{
  'use strict';

  function addRow(button)
  {
    const list = document.getElementById(button.dataset.repeatAdd);
    const from = button.dataset.repeatFrom ? document.getElementById(button.dataset.repeatFrom) : null;
    const choice = from?.querySelector('.c-dropdown__option[aria-selected="true"]');   // Read from the page, because this dropdown has no form name
    const value = choice ? choice.dataset.value : '';

    if (from && (value === '' || [...list.querySelectorAll('[data-repeat-value]')].some((input) => input.value === value)))
    {
      return;
    }

    const row = document.getElementById(`${button.dataset.repeatAdd}-row`).content.firstElementChild.cloneNode(true);

    // Ids must stay unique, and the copies don't need the template's
    row.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));

    if (from)
    {
      row.querySelector('[data-repeat-text]').textContent = choice.dataset.label;
      row.querySelector('[data-repeat-value]').value = value;
      list.append(row);
      return;
    }

    list.append(row);
    row.querySelector('input:not([type="hidden"]), .c-dropdown__trigger')?.focus();
  }

  document.addEventListener('click', (event) =>
  {
    const add    = event.target.closest('[data-repeat-add]');
    const remove = event.target.closest('[data-repeat-remove]');

    if (add)
    {
      addRow(add);
    }

    if (remove)
    {
      remove.closest('[data-repeat-row]').remove();
    }
  });
})();
