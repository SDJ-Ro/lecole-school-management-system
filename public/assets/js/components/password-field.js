// One listener on the document, so fields inside pop-ups work too.
(function ()
{
  'use strict';

  document.addEventListener('click', (event) =>
  {
    const eye = event.target.closest('.c-password-field__eye');

    if (!eye) return;

    const input     = eye.parentElement.querySelector('input');
    const isShowing = input.type === 'text';

    input.type = isShowing ? 'password' : 'text';
    eye.querySelector('use').setAttribute('href', isShowing ? '#icon-eye' : '#icon-eyeOff');
    eye.setAttribute('aria-label', isShowing ? 'Show password' : 'Hide password');
  });
})();
