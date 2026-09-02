// Pop-ups are native dialogs, so the browser handles the backdrop, Esc and focus
// Closing first sends a pop-up:close event that can be cancelled, so unsaved changes can stop it
(function ()
{
  'use strict';

  const byIdOrElement = (target) => typeof target === 'string' ? document.getElementById(target) : target;

  function openPopUp(target)
  {
    const popUp = byIdOrElement(target);
    if (popUp && !popUp.open) popUp.showModal();
  }

  function closePopUp(target)
  {
    byIdOrElement(target)?.close();
  }

  function askToClose(popUp)
  {
    if (popUp.dispatchEvent(new CustomEvent('pop-up:close', { cancelable: true, bubbles: true })))
    {
      popUp.close();
    }
  }

  document.addEventListener('click', function (e)
  {
    const opener = e.target.closest('[data-pop-up-open]');
    const closer = e.target.closest('.j-pop-up-close');

    if (opener)
    {
      openPopUp(opener.dataset.popUpOpen);
    }
    else if (closer)
    {
      askToClose(closer.closest('dialog'));
    }
    else if (e.target instanceof HTMLDialogElement && isOutside(e.target, e))
    {
      askToClose(e.target);
    }
  });

  // Clicks on the backdrop and on the dialog's own padding both target the <dialog>, so check the position
  function isOutside(popUp, click)
  {
    const box = popUp.getBoundingClientRect();
    return click.clientX < box.left || click.clientX > box.right || click.clientY < box.top || click.clientY > box.bottom;
  }

  document.addEventListener('DOMContentLoaded', function ()
  {
    document.querySelectorAll('dialog[data-open-on-load]').forEach(popUp => popUp.showModal());
  });

  window.openPopUp = openPopUp;
  window.closePopUp = closePopUp;
})();
