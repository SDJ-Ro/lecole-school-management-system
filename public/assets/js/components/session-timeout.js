// The server ends idle sessions. This warns a minute before.
// Staying sends a HEAD request, which counts as activity.
// At the end the page reloads, so the server shows the sign-in page.
(function ()
{
  'use strict';

  const seconds = Number(document.body.dataset.sessionTimeout);
  let warnTimer = null;
  let endTimer  = null;

  function startCounting()
  {
    clearTimeout(warnTimer);
    clearTimeout(endTimer);
    warnTimer = setTimeout(warn, Math.max(0, seconds - 60) * 1000);
    endTimer  = setTimeout(() => location.reload(), (seconds + 1) * 1000);
  }

  function warn()
  {
    window.askQuestion({
      title: 'Still There?',
      text: "You'll be signed out in a minute because nothing has happened for a while.",
      button: 'Stay Signed In',
      cancel: 'Close',
      icon: 'clock',
      tone: 'success',
      onConfirm: () => fetch(location.href, { method: 'HEAD', credentials: 'same-origin' }).finally(startCounting)
    });
  }

  if (seconds > 0)
  {
    startCounting();
    document.addEventListener('submit', startCounting);
  }
})();
