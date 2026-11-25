(function ()
{
  'use strict';

  function showForm(card, open)
  {
    card.querySelector('.j-resolve-form').hidden = !open;
    card.querySelector('.j-resolve-open').hidden = open;
    if (open) card.querySelector('.j-resolve-form input[name="response"]').focus();
  }

  document.addEventListener('click', (event) =>
  {
    const opener = event.target.closest('.j-resolve-open');
    const cancel = event.target.closest('.j-resolve-cancel');

    if (opener) showForm(opener.closest('.j-complaint-card'), true);
    if (cancel) showForm(cancel.closest('.j-complaint-card'), false);
  });
})();
