// An error stays until it is closed, so a problem is always read.
(function ()
{
  'use strict';

  const ICONS = { success: 'check', error: 'alertCircle', info: 'info' };

  function showFeedbackBanner(message, type = 'success', duration = 3500)
  {
    const banner = document.getElementById('j-feedback-banner').content.firstElementChild.cloneNode(true);
    const kind   = ICONS[type] ? type : 'info';
    let timer    = null;

    const leave = () =>
    {
      clearTimeout(timer);
      banner.classList.replace('c-is-visible', 'c-is-leaving');
      setTimeout(() => banner.remove(), 300);
    };
    const wait = () =>
    {
      if (kind !== 'error')
      {
        timer = setTimeout(leave, duration);
      }
    };

    banner.classList.add(`c-feedback-banner--${kind}`);
    banner.querySelector('use').setAttribute('href', `#icon-${ICONS[kind]}`);
    banner.querySelector('.c-feedback-banner__text').textContent = message;
    banner.querySelector('.j-feedback-close').addEventListener('click', leave);
    banner.addEventListener('mouseenter', () => clearTimeout(timer));
    banner.addEventListener('mouseleave', wait);

    document.getElementById('j-feedback-banners').append(banner);
    requestAnimationFrame(() => banner.classList.add('c-is-visible'));
    wait();
  }

  window.showFeedbackBanner = showFeedbackBanner;

  const stack = document.getElementById('j-feedback-banners');
  if (stack.dataset.message)
  {
    showFeedbackBanner(stack.dataset.message, stack.dataset.type);
  }
})();
