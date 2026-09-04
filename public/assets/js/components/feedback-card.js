// An unread card holds a hidden "mark read" form, sent the first time it is opened
// If that send fails, the card just shows as unread again next time
(function ()
{
  'use strict';

  function openInFull(card)
  {
    const read = card.querySelector('.j-feedback-read');

    if (read)
    {
      fetch(read.action, { method: 'POST', body: new FormData(read), headers: { Accept: 'application/json' } })
        .catch(() => {});
      read.remove();
      card.classList.remove('c-feedback-card--unread');
    }

    const copy = card.cloneNode(true);

    copy.classList.add('c-feedback-card--full');
    copy.classList.remove('j-feedback-card');
    copy.removeAttribute('tabindex');
    copy.removeAttribute('role');
    copy.removeAttribute('aria-label');
    copy.querySelector('h2').id = 'j-feedback-detail-title';   // The pop-up's aria-labelledby points at this id
    document.getElementById('j-feedback-detail-card').replaceChildren(copy);
    window.openPopUp('j-feedback-detail');
  }

  document.addEventListener('click', (event) =>
  {
    const card = event.target.closest('.j-feedback-card');
    if (card) openInFull(card);
  });

  document.addEventListener('keydown', (event) =>
  {
    const card = event.target.closest('.j-feedback-card');
    if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;

    event.preventDefault();
    openInFull(card);
  });
})();
