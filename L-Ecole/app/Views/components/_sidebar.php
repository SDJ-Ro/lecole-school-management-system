<?php
// app/Views/components/_sidebar.php
// Dumb presentation view component matching Admin/shared/sidebar.js HTML contract.
// Expects: $roleConfig (array), $currentRoute (string)

$svgIcons = [
    'dashboard' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    'users' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>',
    'extracurricular' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
    'academic' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
    'notice' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>',
    'verify' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>',
    'audit' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    'certificate' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="m9 15 2 2 4-4"/></svg>',
    'complaints' => '<svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
];
?>
<aside class="c-sidebar" id="j-sidebar" aria-label="Primary">
  <div class="c-sidebar__brand">
    <a href="<?= htmlspecialchars($roleConfig['homeHref'] ?? '/') ?>" id="j-brand-home-link" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: inherit; cursor: pointer;">
      <div class="c-sidebar__brand-mark" aria-hidden="true">
        <img src="<?= htmlspecialchars($roleConfig['logoSrc'] ?? '/assets/images/logo.jpg') ?>" alt="L'École Logo" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div class="c-sidebar__brand-text j-collapsible-text">
        <h1 class="c-sidebar__brand-title"><?= htmlspecialchars($roleConfig['title'] ?? "L'École") ?></h1>
        <p class="c-sidebar__brand-subtitle"><?= htmlspecialchars($roleConfig['subtitle'] ?? '') ?></p>
      </div>
    </a>
    <button type="button" id="j-sidebar-toggle" class="c-sidebar__collapse-btn" aria-label="Collapse navigation">
      <svg class="c-icon j-collapse-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
  </div>

  <nav class="c-sidebar__nav" aria-label="Main menu">
    <p class="c-sidebar__nav-label j-collapsible-text">Main Menu</p>
    <ul class="c-sidebar__nav-list j-nav-list">
      <?php if (!empty($roleConfig['nav'])): ?>
        <?php foreach ($roleConfig['nav'] as $item): 
          $isSelected = ($item['href'] === $currentRoute);
        ?>
          <li>
            <a href="<?= htmlspecialchars($item['href']) ?>" class="c-nav-item j-nav-item <?= $isSelected ? 'c-is-selected' : '' ?>" data-nav-name="<?= htmlspecialchars($item['dataNavName']) ?>" <?= $isSelected ? 'aria-pressed="true"' : 'aria-pressed="false"' ?>>
              <span class="c-nav-item__pill" aria-hidden="true"></span>
              <span class="c-nav-item__icon" aria-hidden="true"><?= $svgIcons[$item['icon']] ?? '' ?></span>
              <span class="c-nav-item__label j-collapsible-text"><?= htmlspecialchars($item['label']) ?></span>
            </a>
          </li>
        <?php endforeach; ?>
      <?php endif; ?>
    </ul>
  </nav>

  <?php if (!empty($roleConfig['profile'])): 
    $isProfileSelected = ($roleConfig['profile']['href'] === $currentRoute);
  ?>
    <div class="c-sidebar__profile-wrap">
      <a href="<?= htmlspecialchars($roleConfig['profile']['href']) ?>" class="c-profile-btn j-nav-item <?= $isProfileSelected ? 'c-is-selected' : '' ?>" data-nav-name="Profile" <?= $isProfileSelected ? 'aria-pressed="true"' : 'aria-pressed="false"' ?>>
        <img class="c-profile-btn__avatar" alt="<?= htmlspecialchars($roleConfig['profile']['label']) ?>" src="<?= htmlspecialchars($roleConfig['profile']['avatar']) ?>" />
        <div class="c-profile-btn__meta j-collapsible-text" style="display: flex; align-items: center; justify-content: flex-start; height: 100%;">
          <p class="c-profile-btn__name" style="margin: 0; line-height: 1;"><?= htmlspecialchars($roleConfig['profile']['label']) ?></p>
        </div>
        <span class="c-profile-btn__status-dot j-collapsible-text" aria-label="Account active"></span>
      </a>
    </div>
  <?php endif; ?>
</aside>
