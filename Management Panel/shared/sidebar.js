(function() {
  'use strict';

  const isInIframe = window !== window.top;
  if (isInIframe) {
    document.documentElement.classList.add('is-iframe');
    // We don't render the sidebar if we are inside the iframe (it's handled by the parent)
    const sidebarEl = document.getElementById('j-sidebar');
    if (sidebarEl) sidebarEl.style.display = 'none';
    
    // Listen for toggle messages from the parent window (useful for file:// where direct DOM access is blocked)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'toggleSidebar') {
        document.documentElement.classList.toggle('c-is-sidebar-collapsed', event.data.isCollapsed);
      }
    });
    
    return;
  }



  const logoSrc = document.getElementById('main-frame') ? 'shared/logo.jpg' : '../shared/logo.jpg';
  const SIDEBAR_HTML = `
    <div class="c-sidebar__brand">
      <a href="../Admin/landing_page/landing/index.html" id="j-brand-home-link" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: inherit; cursor: pointer;">
        <div class="c-sidebar__brand-mark" aria-hidden="true">
          <img src="${logoSrc}" alt="L'École Logo" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div class="c-sidebar__brand-text j-collapsible-text">
          <h1 class="c-sidebar__brand-title">L'École</h1>
          <p class="c-sidebar__brand-subtitle">Management Panel</p>
        </div>
      </a>
      <button type="button" id="j-sidebar-toggle" class="c-sidebar__collapse-btn" aria-label="Collapse navigation">
        <svg class="c-icon j-collapse-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    </div>

    <nav class="c-sidebar__nav" aria-label="Main menu">
      <p class="c-sidebar__nav-label j-collapsible-text">Main Menu</p>
      <ul class="c-sidebar__nav-list j-nav-list">
        <li>
          <a href="../dashboard/index.html" class="c-nav-item j-nav-item" data-nav-name="Dashboard">
            <span class="c-nav-item__pill" aria-hidden="true"></span>
            <span class="c-nav-item__icon" aria-hidden="true"><svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg></span>
            <span class="c-nav-item__label j-collapsible-text">Dashboard</span>
          </a>
        </li>
        <li>
          <a href="../people/index.html" class="c-nav-item j-nav-item" data-nav-name="Users">
            <span class="c-nav-item__pill" aria-hidden="true"></span>
            <span class="c-nav-item__icon" aria-hidden="true"><svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg></span>
            <span class="c-nav-item__label j-collapsible-text">Users</span>
          </a>
        </li>
        <li>
          <a href="../extracurricular/index.html" class="c-nav-item j-nav-item" data-nav-name="Extracurricular">
            <span class="c-nav-item__pill" aria-hidden="true"></span>
            <span class="c-nav-item__icon" aria-hidden="true"><svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg></span>
            <span class="c-nav-item__label j-collapsible-text">Extracurricular</span>
          </a>
        </li>
        <li>
          <a href="../academic/index.html" class="c-nav-item j-nav-item" data-nav-name="Academic">
            <span class="c-nav-item__pill" aria-hidden="true"></span>
            <span class="c-nav-item__icon" aria-hidden="true"><svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg></span>
            <span class="c-nav-item__label j-collapsible-text">Academic</span>
          </a>
        </li>
        <li>
          <a href="../Notice/index.html" class="c-nav-item j-nav-item" data-nav-name="Notice Board">
            <span class="c-nav-item__pill" aria-hidden="true"></span>
            <span class="c-nav-item__icon" aria-hidden="true"><svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg></span>
            <span class="c-nav-item__label j-collapsible-text">Notice Board</span>
          </a>
        </li>
        <li>
          <a href="../character-certificate/index.html" class="c-nav-item j-nav-item" data-nav-name="Character Certificate">
            <span class="c-nav-item__pill" aria-hidden="true"></span>
            <span class="c-nav-item__icon" aria-hidden="true"><svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="m9 15 2 2 4-4"/></svg></span>
            <span class="c-nav-item__label j-collapsible-text">Character Certificate</span>
          </a>
        </li>
        <li>
          <a href="../complaints/index.html" class="c-nav-item j-nav-item" data-nav-name="Complaints">
            <span class="c-nav-item__pill" aria-hidden="true"></span>
            <span class="c-nav-item__icon" aria-hidden="true"><svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></span>
            <span class="c-nav-item__label j-collapsible-text">Complaints</span>
          </a>
        </li>
      </ul>
    </nav>

    <div class="c-sidebar__profile-wrap">
      <a href="../profile/index.html" class="c-profile-btn j-nav-item" data-nav-name="Profile">
        <img class="c-profile-btn__avatar" alt="Alex Thompson" src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=faces" />
        <div class="c-profile-btn__meta j-collapsible-text" style="display: flex; align-items: center; justify-content: flex-start; height: 100%;">
          <p class="c-profile-btn__name" style="margin: 0; line-height: 1;">Alex Thompson</p>
        </div>
        <span class="c-profile-btn__status-dot j-collapsible-text" aria-label="Account active"></span>
      </a>
    </div>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    const sidebarEl = document.getElementById('j-sidebar');
    if (!sidebarEl) return;

    // Inject the HTML
    sidebarEl.innerHTML = SIDEBAR_HTML;

    const mainFrame = document.getElementById('main-frame');
    const path = window.location.pathname;
    const navItems = sidebarEl.querySelectorAll('.j-nav-item');
    
    navItems.forEach(item => {
      // Add click listener for SPA navigation
      item.addEventListener('click', (e) => {
        if (!mainFrame) return; // Fallback to default link behavior if not in SPA mode
        
        e.preventDefault();
        const href = item.getAttribute('href');
        if (href) {
          const folder = href.startsWith('../') ? href.split('/')[1] : href;
          window.location.hash = folder;
        }
      });
    });

    if (mainFrame) {
      function syncSidebarToHash() {
        const rawHash = (window.location.hash || '').replace(/^#\/?/, '');
        if (!rawHash) {
          // Parent window address bar has no hash; do not reload or change mainFrame src
          return;
        }
        const section = (rawHash.split('/')[0] || '').toLowerCase();
        if (!section) return;
        
        navItems.forEach(n => {
          const href = (n.getAttribute('href') || '').toLowerCase();
          const matches = href.includes('/' + section + '/') || href.includes(section + '/');
          n.classList.toggle('c-is-selected', matches);
          n.setAttribute('aria-pressed', matches ? 'true' : 'false');
        });
        
        const currentUrl = (mainFrame.src || mainFrame.getAttribute('src') || '').toLowerCase();
        const alreadyInSection = currentUrl.includes('/' + section + '/') || currentUrl.endsWith(section + '/index.html');
        
        if (!alreadyInSection) {
          const targetSrc = section + '/index.html';
          mainFrame.src = targetSrc;
          mainFrame.setAttribute('src', targetSrc);
        }
      }

      window.addEventListener('hashchange', syncSidebarToHash);
      
      // Initialize on load
      if (window.location.hash) {
        syncSidebarToHash();
      } else {
        // Default to dashboard
        navItems[0].classList.add('c-is-selected');
        navItems[0].setAttribute('aria-pressed', 'true');
      }
    } else {
      // Standalone mode (direct page access): highlight active nav item based on current location
      const currentPath = window.location.pathname.toLowerCase();
      navItems.forEach(n => {
        const href = (n.getAttribute('href') || '').toLowerCase();
        const folder = href.split('/')[1] || href;
        if (folder && currentPath.includes('/' + folder.toLowerCase() + '/')) {
          n.classList.add('c-is-selected');
          n.setAttribute('aria-pressed', 'true');
        } else {
          n.classList.remove('c-is-selected');
          n.setAttribute('aria-pressed', 'false');
        }
      });
    }

    const brandLink = document.getElementById('j-brand-home-link');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '../Admin/landing_page/landing/index.html';
      });
    }

    // Handle toggle functionality
    let isCollapsed = false;
    const mainEl = document.getElementById('j-main');
    const toggleBtn = document.getElementById('j-sidebar-toggle');
    const collapseIcon = toggleBtn.querySelector('.j-collapse-icon');

    function applyCollapsedState() {
      sidebarEl.classList.toggle('c-is-collapsed', isCollapsed);
      document.body.classList.toggle('c-is-sidebar-collapsed', isCollapsed);
      if (mainEl) {
        mainEl.classList.toggle('c-is-sidebar-collapsed', isCollapsed);
        mainEl.classList.toggle('is-shifted', isCollapsed); // fallback for people app which uses 'is-shifted'
      }
      toggleBtn.setAttribute('aria-label', isCollapsed ? 'Expand navigation' : 'Collapse navigation');
      
      if (collapseIcon) {
        collapseIcon.innerHTML = isCollapsed
          ? '<path d="m9 18 6-6-6-6"/>'
          : '<path d="m15 18-6-6 6-6"/>';
      }

      // Propagate collapsed state to the iframe content
      if (mainFrame && mainFrame.contentWindow) {
        try {
          mainFrame.contentWindow.document.documentElement.classList.toggle('c-is-sidebar-collapsed', isCollapsed);
        } catch (e) {
          // Ignore cross-origin errors if any
        }
        // Always try postMessage as a reliable fallback for file:// protocol
        mainFrame.contentWindow.postMessage({ type: 'toggleSidebar', isCollapsed: isCollapsed }, '*');
      }
    }

    if (mainFrame) {
      mainFrame.addEventListener('load', () => {
        applyCollapsedState();
      });
    }

    toggleBtn.addEventListener('click', () => {
      isCollapsed = !isCollapsed;
      applyCollapsedState();
    });

  });
})();
