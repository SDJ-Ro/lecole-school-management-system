// A form with data-background is sent with fetch, for changes the screen already shows
// If the server refuses, the form's dropdowns go back to their last saved values
(function ()
{
  'use strict';

  const dropdownsOf = (form) => [...form.querySelectorAll('.c-dropdown')];
  const saved = new WeakMap();   // Each form's last saved dropdown values

  function remember(form)
  {
    saved.set(form, dropdownsOf(form).map(dropdown => window.getDropdownValue(dropdown.id)));
  }

  function goBack(form)
  {
    const values = saved.get(form) || [];
    dropdownsOf(form).forEach((dropdown, i) => window.setDropdownValue(dropdown.id, values[i] ?? ''));
  }

  document.addEventListener('submit', (event) =>
  {
    const form = event.target;

    if (!form.matches('form[data-background]')) return;

    event.preventDefault();
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then(answer =>
      {
        window.showFeedbackBanner(answer.message, answer.ok ? 'success' : 'error');
        answer.ok ? remember(form) : goBack(form);
        form.dispatchEvent(new CustomEvent('background:answer', { bubbles: true, detail: answer }));      })
      .catch(() => window.location.reload());   // Not JSON usually means signed out, so reload to show the sign-in page
  });

  document.addEventListener('dropdown:change', (event) =>
  {
    const form = event.target.closest('form[data-background]');
    if (form) form.requestSubmit();
  });

  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('form[data-background]').forEach(remember));
})();
