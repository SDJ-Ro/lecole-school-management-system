(function ()
{
  'use strict';

  const sidebar = document.getElementById('j-sidebar');
  if (!sidebar) return;

  // The choice is kept in a cookie so the server draws the next page the same way, with no jump on load
  const toggle = document.getElementById('j-sidebar-toggle');
  const phone  = window.matchMedia('(max-width: 767px)');
  let chosen   = sidebar.classList.contains('c-is-collapsed');

  function show(collapsed)
  {
    sidebar.classList.toggle('c-is-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  toggle.addEventListener('click', () =>
  {
    const collapsed = !sidebar.classList.contains('c-is-collapsed');

    show(collapsed);

    if (!phone.matches)
    {
      chosen = collapsed;
      document.cookie = `sidebar_${sidebar.dataset.role}=${collapsed ? 'collapsed' : 'open'}; path=/; max-age=31536000; SameSite=Lax`;
    }
  });

  // Phones start collapsed and don't overwrite the choice made on a wider window
  const fitScreen = () => show(phone.matches || chosen);
  phone.addEventListener('change', fitScreen);
  fitScreen();

  function askToLogOut()
  {
    window.askQuestion({
      title: 'Leave Your Workspace?',
      text: `Would you like to sign out of your ${sidebar.dataset.roleLabel} account, or stay in your workspace?`,
      button: 'Sign Out & Exit',
      buttonIcon: 'logOut',
      cancel: 'Stay Signed In',
      icon: 'logOut',
      tone: 'warning',
      wide: true,
      onConfirm: () => document.querySelector('.j-logout-form').submit()   // Signing out is a POST with the CSRF token
    });
  }

  document.getElementById('j-logout-btn').addEventListener('click', (e) =>
  {
    e.preventDefault();
    askToLogOut();
  });

  // The Back button asks to log out instead. A new history entry catches the next Back.
  window.history.pushState({ portalGuard: true }, document.title, window.location.href);
  window.addEventListener('popstate', () =>
  {
    window.history.pushState({ portalGuard: true }, document.title, window.location.href);
    askToLogOut();
  });
})();
