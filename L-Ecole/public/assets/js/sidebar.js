/* =========================================================================
   L'ÉCOLE — SIDEBAR INTERACTION SCRIPT (NON-IFRAME DIRECT DOM MODES)
   ========================================================================= */

(function () {
  'use strict';

  function initSidebar() {
    const sidebarEl = document.getElementById('j-sidebar') || document.querySelector('.c-sidebar');
    const mainEl = document.getElementById('j-main') || document.querySelector('.c-main');
    const toggleBtn = document.getElementById('j-sidebar-toggle') || document.querySelector('.c-sidebar__collapse-btn');

    if (!sidebarEl) return;

    let isCollapsed = localStorage.getItem('lecole_sidebar_collapsed') === 'true';

    function applyCollapsedState() {
      sidebarEl.classList.toggle('c-is-collapsed', isCollapsed);
      document.body.classList.toggle('c-is-sidebar-collapsed', isCollapsed);
      if (mainEl) {
        mainEl.classList.toggle('c-is-sidebar-collapsed', isCollapsed);
        mainEl.classList.toggle('is-shifted', isCollapsed);
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', isCollapsed ? 'Expand navigation' : 'Collapse navigation');
        const collapseIcon = toggleBtn.querySelector('.j-collapse-icon');
        if (collapseIcon) {
          collapseIcon.innerHTML = isCollapsed
            ? '<path d="m9 18 6-6-6-6"/>'
            : '<path d="m15 18-6-6 6-6"/>';
        }
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isCollapsed = !isCollapsed;
        localStorage.setItem('lecole_sidebar_collapsed', isCollapsed ? 'true' : 'false');
        applyCollapsedState();
      });
    }

    // Active navigation highlighting based on current path
    const currentPath = window.location.pathname.toLowerCase();
    const navItems = sidebarEl.querySelectorAll('.j-nav-item');
    navItems.forEach((n) => {
      const href = (n.getAttribute('href') || '').toLowerCase();
      if (href && currentPath.startsWith(href)) {
        n.classList.add('c-is-selected');
        n.setAttribute('aria-pressed', 'true');
      }
    });

    applyCollapsedState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
