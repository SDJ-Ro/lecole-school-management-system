// Turns off a form's buttons once it is really sent, so a double click can't send it twice
// setTimeout lets other submit handlers cancel the send first
// A form that opens a new tab leaves this page usable
(function ()
{
  'use strict';

  document.addEventListener('submit', (event) =>
  {
    const form = event.target;

    setTimeout(() =>
    {
      if (event.defaultPrevented || form.getAttribute('target') === '_blank')
      {
        return;
      }

      // Uses getAttribute because form.id and form.target return a field with that name if there is one
      const formId  = form.getAttribute('id');
      const outside = formId ? [...document.querySelectorAll(`button[type="submit"][form="${formId}"]`)] : [];
      [...form.querySelectorAll('button[type="submit"], input[type="submit"]'), ...outside].forEach((button) => button.disabled = true);
    });
  });
})();
