/* =========================================================================
   L'ÉCOLE — NOTICE BOARD MODULE — APPLICATION SCRIPT
   -------------------------------------------------------------------------
   DESIGN PRINCIPLE: HTML/CSS do all of the visual work; this file only
   contains things that genuinely need to run in the browser — in-memory
   notice data (create/edit/delete/pin), search + filter state, the custom
   select dropdowns, the tag-chip audience picker, and the one shared
   modal that is reused for viewing / editing / deleting a notice.

   Sections in this file:
     1. Notice data + shared option lists
     2. Small formatting helpers (dates, initials, escaping)
     3. Inline icon snippets (kept here, not in HTML, because several are
        chosen dynamically per-notice, e.g. the pin icon toggles between
        "pin" and "pin-off")
     4. Application state (source of truth for everything rendered)
     5. Sidebar + view-switch behaviour (Notice Board <-> Post Notice)
     6. Generic custom-select component (used by every dropdown)
     7. Audience tag-field component (chips + "add audience" select)
     8. Notice Board view: filtering, sorting, rendering, card actions
     9. Notice modal: view / edit / delete modes
    10. Post Notice view: form state, validation, submit
    11. Generic modal open/close plumbing
    12. App bootstrap
   Naming reminder: elements this script queries are marked with the j-*
   class or id prefix (see the header comment in styles.css for the full
   c-* / j-* / c-is-* convention this project follows).
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. NOTICE DATA + SHARED OPTION LISTS
     ======================================================================= */

  const mockData = window.NOTICE_MOCK_DATA || {};
  const AUDIENCE_OPTIONS = mockData.AUDIENCE_OPTIONS || [];
  const CATEGORY_OPTIONS = mockData.CATEGORY_OPTIONS || [];
  const initialNotices = mockData.initialNotices || [];

  /* =======================================================================
     2. FORMATTING HELPERS
     ======================================================================= */

  function getInitials(name) {
    return name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  }

  function formatTodayDate() {
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  }

  /** Prevents notice content typed by a user from being parsed as markup. */
  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function nextNoticeId() {
    return state.notices.reduce((max, notice) => Math.max(max, notice.id), 0) + 1;
  }

  /* =======================================================================
     3. INLINE ICON SNIPPETS
     ------------------------------------------------------------------------
     Kept as small template strings (not full <svg> elements in the HTML)
     because which icon shows (pin vs. pin-off, etc.) depends on live data.
     ======================================================================= */

  function icon(pathMarkup, size) {
    return `<svg class="c-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pathMarkup}</svg>`;
  }

  const ICON_PIN = (size, filled) =>
    `<svg class="c-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`;

  const ICON_PIN_OFF = (size) =>
    `<svg class="c-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h3.5"/><path d="M17.5 17H18a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7"/><path d="M9 4h6a2 2 0 0 1 1.5 3.32"/><path d="m2 2 20 20"/></svg>`;

  const ICON_PENCIL = (size) =>
    `<svg class="c-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;

  const ICON_TRASH = (size) =>
    `<svg class="c-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

  const ICON_X = (size) =>
    `<svg class="c-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

  const ICON_CHECK = (size) =>
    `<svg class="c-icon c-select__option-check" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

  /* =======================================================================
     4. APPLICATION STATE
     ======================================================================= */

  const state = {
    activeView: 'notices',           // 'notices' | 'post-notice'
    notices: initialNotices.map((n) => ({ ...n, audience: [...n.audience] })),
    filters: { search: '', audience: 'All', category: 'All' },
    modal: {
      noticeId: null,
      mode: null                     // 'view' | 'edit' | 'delete'
    },
    postForm: {
      title: '',
      category: '',
      body: '',
      audiences: [],
      pinned: false,
      attachmentName: ''
    }
  };



  function switchView(viewName) {
    state.activeView = viewName;
    document.querySelectorAll('.c-view').forEach((section) => {
      section.classList.toggle('c-is-active', section.dataset.view === viewName);
    });
    closeAllSelects();
    document.getElementById('j-main').scrollTo({ top: 0 });
  }

  function initViewNavigation() {
    document.querySelector('.j-go-post-notice').addEventListener('click', () => switchView('post-notice'));
    document.querySelector('.j-go-notice-board').addEventListener('click', () => switchView('notices'));
  }

  /* =======================================================================
     6. GENERIC CUSTOM SELECT COMPONENT
     ------------------------------------------------------------------------
     One factory builds every dropdown in this module (audience filter,
     category filter, category field, and both "add audience" pickers).
     Each instance is registered so any open menu closes when another one
     opens, when the user clicks outside, or presses Escape — exactly like
     the calendar month/year selects elsewhere in the admin dashboard.
     ======================================================================= */

  const selectRegistry = [];

  function closeAllSelects(exceptRoot) {
    // drop any instances whose root was removed from the DOM (e.g. a modal
    // that got re-rendered) so the registry never grows unbounded
    for (let i = selectRegistry.length - 1; i >= 0; i -= 1) {
      if (!selectRegistry[i].root.isConnected) selectRegistry.splice(i, 1);
    }
    selectRegistry.forEach((instance) => {
      if (instance.root !== exceptRoot) instance.close();
    });
  }

  /**
   * @param {Object} config
   * @param {HTMLElement} config.root        - the `.c-select` wrapper element
   * @param {() => {label:string, value:string}[]} config.getOptions
   * @param {() => string} config.getValue
   * @param {string} config.placeholder
   * @param {(value: string) => void} config.onChoose
   */
  function createSelect(config) {
    const { root, getOptions, getValue, placeholder, onChoose } = config;
    const trigger = root.querySelector('.c-select__trigger');
    const valueLabel = trigger.querySelector('.j-select-value');
    const menu = root.querySelector('.c-select__menu');
    let isOpen = false;

    function refreshTriggerLabel() {
      const options = getOptions();
      const value = getValue();
      const selected = options.find((option) => option.value === value);
      valueLabel.textContent = selected ? selected.label : placeholder;
      trigger.classList.toggle('c-has-value', Boolean(selected));
      const isDisabled = options.length === 0;
      root.classList.toggle('c-is-disabled', isDisabled);
      trigger.disabled = isDisabled;
    }

    function renderMenu() {
      const options = getOptions();
      const value = getValue();
      if (!options.length) {
        menu.innerHTML = '<p class="c-select__empty">No options available</p>';
        return;
      }
      menu.innerHTML = options.map((option) => {
        const isSelected = option.value === value;
        return `
          <button type="button" class="c-select__option ${isSelected ? 'c-is-selected' : ''}" data-value="${escapeHtml(option.value)}" role="option" aria-selected="${isSelected}">
            <span>${escapeHtml(option.label)}</span>
            ${isSelected ? ICON_CHECK(15) : ''}
          </button>`;
      }).join('');
      menu.querySelectorAll('.c-select__option').forEach((optionBtn) => {
        optionBtn.addEventListener('click', () => {
          onChoose(optionBtn.dataset.value);
          refreshTriggerLabel();
          closeMenu();
        });
      });
    }

    function positionMenu() {
      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 12;
      const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
      const availableAbove = rect.top - viewportPadding;
      const openAbove = availableBelow < 176 && availableAbove > availableBelow;
      const maxHeight = Math.max(96, Math.min(240, (openAbove ? availableAbove : availableBelow) - 6));
      const menuWidth = Math.min(Math.max(rect.width, 176), window.innerWidth - viewportPadding * 2);
      menu.classList.toggle('c-placement-above', openAbove);
      menu.style.maxHeight = `${maxHeight}px`;
      menu.style.width = `${menuWidth}px`;
      menu.style.left = `${Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - menuWidth - viewportPadding))}px`;
      if (openAbove) {
        menu.style.bottom = `${window.innerHeight - rect.top + 6}px`;
        menu.style.top = '';
      } else {
        menu.style.top = `${rect.bottom + 6}px`;
        menu.style.bottom = '';
      }
    }

    function openMenu() {
      if (root.classList.contains('c-is-disabled')) return;
      closeAllSelects(root);
      renderMenu();
      isOpen = true;
      root.classList.add('c-is-open');
      trigger.setAttribute('aria-expanded', 'true');
      positionMenu();
      requestAnimationFrame(() => root.classList.add('c-is-menu-visible'));
      window.addEventListener('resize', positionMenu);
      window.addEventListener('scroll', positionMenu, true);
    }

    function closeMenu() {
      isOpen = false;
      root.classList.remove('c-is-open', 'c-is-menu-visible');
      trigger.setAttribute('aria-expanded', 'false');
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    }

    trigger.addEventListener('click', () => (isOpen ? closeMenu() : openMenu()));

    const instance = { root, close: closeMenu, refresh: refreshTriggerLabel };
    selectRegistry.push(instance);
    refreshTriggerLabel();
    return instance;
  }

  /* =======================================================================
     7. AUDIENCE TAG-FIELD COMPONENT (chips + "add audience" select)
     ------------------------------------------------------------------------
     Reused by both the Post Notice form and the notice edit form — each
     just supplies where the chips render, where the picker select lives,
     and get/set functions for its own copy of the audience list.
     ======================================================================= */

  function createAudienceField({ chipsEl, selectRoot, getAudiences, setAudiences, emptyText }) {
    const select = createSelect({
      root: selectRoot,
      getOptions: () => AUDIENCE_OPTIONS.filter((option) => !getAudiences().includes(option)).map((v) => ({ label: v, value: v })),
      getValue: () => '',
      placeholder: 'Add audience…',
      onChoose: (value) => {
        setAudiences([...getAudiences(), value]);
        renderChips();
      }
    });

    function renderChips() {
      const audiences = getAudiences();
      chipsEl.innerHTML = audiences.length
        ? audiences.map((audience) => `
            <span class="c-chip">
              ${escapeHtml(audience)}
              <button type="button" class="c-chip__remove j-chip-remove" data-value="${escapeHtml(audience)}" aria-label="Remove ${escapeHtml(audience)}">${ICON_X(11)}</button>
            </span>`).join('')
        : (emptyText ? `<span class="c-tag-field__placeholder">${escapeHtml(emptyText)}</span>` : '');
      chipsEl.querySelectorAll('.j-chip-remove').forEach((btn) => {
        btn.addEventListener('click', () => {
          setAudiences(getAudiences().filter((item) => item !== btn.dataset.value));
          renderChips();
          select.refresh();
        });
      });
      select.refresh();
    }

    renderChips();
    return { renderChips };
  }

  /* =======================================================================
     8. NOTICE BOARD VIEW — filtering, sorting, rendering, card actions
     ======================================================================= */

  function getFilteredNotices() {
    const query = state.filters.search.trim().toLowerCase();
    return state.notices
      .filter((notice) => {
        const matchesSearch =
          !query ||
          notice.title.toLowerCase().includes(query) ||
          notice.body.toLowerCase().includes(query);
        const matchesAudience =
          state.filters.audience === 'All users' ||
          notice.audience.includes(state.filters.audience);
        const matchesCategory =
          state.filters.category === 'All' || notice.category === state.filters.category;
        return matchesSearch && matchesAudience && matchesCategory;
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }

  function getThemeClass(label) {
    const l = label.toLowerCase();
    if (l.includes('student')) return 'c-theme-student';
    if (l.includes('teacher') || l.includes('staff')) return 'c-theme-teacher';
    if (l.includes('parent')) return 'c-theme-parent';
    if (l.includes('management')) return 'c-theme-management';
    if (l.includes('all user')) return 'c-theme-system';
    return '';
  }

  function noticeTagsMarkup(notice) {
    return `
      <span class="c-tag c-tag--category">${escapeHtml(notice.category)}</span>
      ${notice.audience.map((audience) => `<span class="c-tag c-tag--audience">${escapeHtml(audience)}</span>`).join('')}`;
  }

  function noticeCardTemplate(notice, index) {
    return `
      <article class="c-notice-card" data-category="${escapeHtml(notice.category)}" data-notice-id="${notice.id}" style="animation-delay:${index * 40}ms" tabindex="0">
        ${notice.pinned ? `<span class="c-notice-card__pin" aria-label="Pinned notice" title="Pinned notice">${ICON_PIN(18, true)}</span>` : ''}
        <div class="c-notice-card__tags">${noticeTagsMarkup(notice)}</div>
        <h2 class="c-notice-card__title">${escapeHtml(notice.title)}</h2>
        <p class="c-notice-card__body">${escapeHtml(notice.body)}</p>
        <footer class="c-notice-card__footer">
          <div class="c-notice-card__author">
            <span class="c-avatar">${escapeHtml(getInitials(notice.author))}</span>
            <div>
              <p class="c-notice-card__author-name">${escapeHtml(notice.author)}</p>
              <p class="c-notice-card__date">${escapeHtml((notice.date || '').toUpperCase())}</p>
            </div>
          </div>
          <div class="c-notice-card__actions">
            <button type="button" class="c-icon-btn j-notice-pin" data-notice-id="${notice.id}" aria-label="${notice.pinned ? 'Unpin notice' : 'Pin notice'}">${notice.pinned ? ICON_PIN_OFF(16) : ICON_PIN(16, false)}</button>
            <button type="button" class="c-icon-btn j-notice-edit" data-notice-id="${notice.id}" aria-label="Edit notice">${ICON_PENCIL(16)}</button>
            <button type="button" class="c-icon-btn c-icon-btn--danger j-notice-delete" data-notice-id="${notice.id}" aria-label="Delete notice">${ICON_TRASH(16)}</button>
          </div>
        </footer>
      </article>`;
  }

  function renderNoticeGrid() {
    const gridEl = document.getElementById('j-notice-grid');
    const emptyEl = document.getElementById('j-empty-state');
    const filtered = getFilteredNotices();

    if (!filtered.length) {
      gridEl.innerHTML = '';
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    gridEl.innerHTML = filtered.map((notice, index) => noticeCardTemplate(notice, index)).join('');
  }

  function findNotice(noticeId) {
    return state.notices.find((notice) => notice.id === noticeId);
  }

  function toggleNoticePin(noticeId) {
    const notice = findNotice(noticeId);
    if (notice) notice.pinned = !notice.pinned;
    renderNoticeGrid();
  }

  function deleteNotice(noticeId) {
    state.notices = state.notices.filter((notice) => notice.id !== noticeId);
    renderNoticeGrid();
  }

  function updateNotice(updatedNotice) {
    state.notices = state.notices.map((notice) => (notice.id === updatedNotice.id ? updatedNotice : notice));
    renderNoticeGrid();
  }

  function createNotice(draft) {
    const notice = {
      ...draft,
      id: nextNoticeId(),
      author: 'Alex Thompson',
      date: formatTodayDate()
    };
    state.notices = [notice, ...state.notices];
    renderNoticeGrid();
  }

  function initNoticeGrid() {
    document.getElementById('j-notice-grid').addEventListener('click', (event) => {
      const pinBtn = event.target.closest('.j-notice-pin');
      const editBtn = event.target.closest('.j-notice-edit');
      const deleteBtn = event.target.closest('.j-notice-delete');
      const card = event.target.closest('.c-notice-card');
      if (!card) return;
      const noticeId = Number(card.dataset.noticeId);

      if (pinBtn) { event.stopPropagation(); toggleNoticePin(noticeId); return; }
      if (editBtn) { event.stopPropagation(); openNoticeModal(noticeId, 'edit'); return; }
      if (deleteBtn) { event.stopPropagation(); openNoticeModal(noticeId, 'delete'); return; }
      openNoticeModal(noticeId, 'view');
    });
  }

  function initFilterBar() {
    const searchInput = document.querySelector('.j-search-input');

    searchInput.addEventListener('input', (event) => {
      state.filters.search = event.target.value;
      renderNoticeGrid();
    });

    createSelect({
      root: document.getElementById('j-select-audience-filter'),
      getOptions: () => AUDIENCE_OPTIONS.map((v) => ({ label: v, value: v })),
      getValue: () => state.filters.audience,
      placeholder: 'Audience',
      onChoose: (value) => { state.filters.audience = value; renderNoticeGrid(); }
    });

    createSelect({
      root: document.getElementById('j-select-category-filter'),
      getOptions: () => ['All', ...CATEGORY_OPTIONS].map((v) => ({ label: v, value: v })),
      getValue: () => state.filters.category,
      placeholder: 'Category',
      onChoose: (value) => { state.filters.category = value; renderNoticeGrid(); }
    });

    document.querySelector('.j-clear-filters').addEventListener('click', () => {
      state.filters = { search: '', audience: 'All', category: 'All' };
      searchInput.value = '';
      closeAllSelects();
      selectRegistry.forEach((instance) => instance.refresh());
      renderNoticeGrid();
    });
  }

  /* =======================================================================
     9. NOTICE MODAL — view / edit / delete
     ======================================================================= */

  function noticeModalViewTemplate(notice) {
    return `
      <div class="c-modal__accent-bar" data-category="${escapeHtml(notice.category)}"></div>
      <div class="c-modal__scroll">
        <div class="c-modal__view-body">
          <div class="c-modal__view-top">
            <div class="c-notice-card__tags" style="padding-right:0;margin-bottom:0;">${noticeTagsMarkup(notice)}</div>
            <div class="c-modal__view-actions">
              ${notice.pinned ? `<span class="c-modal__view-pin" aria-label="Pinned notice">${ICON_PIN(18, true)}</span>` : ''}
              <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close notice">${ICON_X(20)}</button>
            </div>
          </div>
          <h2 class="c-modal__title c-font-display">${escapeHtml(notice.title)}</h2>
          <p class="c-modal__body-text">${escapeHtml(notice.body)}</p>
          <footer class="c-modal__view-footer">
            <div class="c-modal__view-author">
              <span class="c-avatar c-modal__author-avatar">${escapeHtml(getInitials(notice.author))}</span>
              <div>
                <p class="c-modal__author-name">${escapeHtml(notice.author)}</p>
                <p class="c-modal__author-date">${escapeHtml(notice.date)}</p>
              </div>
            </div>
            <button type="button" class="c-btn c-btn--sky j-modal-edit-trigger">${ICON_PENCIL(14)} Edit notice</button>
          </footer>
        </div>
      </div>`;
  }

  function noticeModalDeleteTemplate() {
    return `
      <div class="c-modal__delete-body">
        <span class="c-modal__delete-icon">${ICON_TRASH(30)}</span>
        <h2 class="c-modal__delete-title c-font-display">Delete notice?</h2>
        <p class="c-modal__delete-text">This will remove the notice from the central Notice Board.</p>
        <div class="c-modal__delete-actions">
          <button type="button" class="c-btn c-btn--outline j-modal-cancel-delete">Cancel</button>
          <button type="button" class="c-btn c-btn--danger j-modal-confirm-delete">Delete notice</button>
        </div>
      </div>`;
  }

  function noticeModalEditTemplate(notice) {
    return `
      <form class="c-modal__edit-form" id="j-edit-notice-form" novalidate>
        <header class="c-modal__edit-header">
          <div>
            <h2 class="c-modal__edit-title c-font-display">Edit notice</h2>
            <p class="c-modal__edit-subtitle">Update this announcement for the central Notice Board.</p>
          </div>
          <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Cancel editing">${ICON_X(20)}</button>
        </header>
        <div class="c-modal__edit-body">
          <div class="c-form-field">
            <label class="c-form-field__label" for="j-edit-title">Notice title</label>
            <input type="text" id="j-edit-title" class="c-text-input" value="${escapeHtml(notice.title)}" required />
          </div>
          <div class="c-form-field">
            <span class="c-form-field__label">Category</span>
            <div class="c-select" id="j-select-edit-category" aria-label="Category">
              <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                <span class="c-select__value j-select-value">${escapeHtml(notice.category)}</span>
                <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div class="c-select__menu" role="listbox" aria-label="Category"></div>
            </div>
          </div>
          <div class="c-form-field">
            <span class="c-form-field__label">Target audience</span>
            <div class="c-tag-field" id="j-edit-audience-field">
              <div class="c-tag-field__chips j-tag-chips"></div>
              <div class="c-select" id="j-select-edit-audience" aria-label="Add audience">
                <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
                  <span class="c-select__value j-select-value">Add audience…</span>
                  <svg class="c-icon c-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="c-select__menu" role="listbox" aria-label="Add audience"></div>
              </div>
            </div>
          </div>
          <div class="c-form-field">
            <label class="c-form-field__label" for="j-edit-body">Message body</label>
            <textarea id="j-edit-body" class="c-textarea c-textarea--edit" rows="6" required>${escapeHtml(notice.body)}</textarea>
          </div>
          <div class="c-checkbox j-checkbox" id="j-edit-pin-checkbox">
            <button type="button" class="c-checkbox__box" role="checkbox" aria-checked="${notice.pinned}" id="j-edit-pin-box">${ICON_CHECK(14)}</button>
            <label class="c-checkbox__label" for="j-edit-pin-box">Pin this notice to the top</label>
          </div>
        </div>
        <footer class="c-modal__edit-footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--sky">Save changes</button>
        </footer>
      </form>`;
  }

  /** Wires a generic pin/tick checkbox. Shared by the post form and the edit form. */
  function wireCheckbox(rootEl, initialChecked, onChange) {
    const boxEl = rootEl.querySelector('.c-checkbox__box');
    let checked = initialChecked;

    function applyState() {
      rootEl.classList.toggle('c-is-checked', checked);
      boxEl.setAttribute('aria-checked', String(checked));
    }

    function setChecked(value) {
      checked = value;
      applyState();
      onChange(checked);
    }

    boxEl.addEventListener('click', () => setChecked(!checked));
    applyState();
    return { setChecked };
  }

  function openNoticeModal(noticeId, mode) {
    state.modal = { noticeId, mode };
    renderNoticeModal();
    const layer = document.getElementById('j-modal-notice');
    layer.classList.add('c-is-open');
  }

  function closeNoticeModal() {
    document.getElementById('j-modal-notice').classList.remove('c-is-open');
    state.modal = { noticeId: null, mode: null };
  }

  function renderNoticeModal() {
    const panel = document.getElementById('j-modal-notice-panel');
    const notice = findNotice(state.modal.noticeId);
    if (!notice) { closeNoticeModal(); return; }

    if (state.modal.mode === 'delete') {
      panel.innerHTML = noticeModalDeleteTemplate();
      panel.querySelector('.j-modal-cancel-delete').addEventListener('click', closeNoticeModal);
      panel.querySelector('.j-modal-confirm-delete').addEventListener('click', () => {
        deleteNotice(notice.id);
        closeNoticeModal();
      });
      return;
    }

    if (state.modal.mode === 'edit') {
      panel.innerHTML = noticeModalEditTemplate(notice);
      const editState = { title: notice.title, category: notice.category, audience: [...notice.audience], body: notice.body, pinned: notice.pinned };

      createSelect({
        root: document.getElementById('j-select-edit-category'),
        getOptions: () => CATEGORY_OPTIONS.map((v) => ({ label: v, value: v })),
        getValue: () => editState.category,
        placeholder: 'Category',
        onChoose: (value) => { editState.category = value; }
      });

      createAudienceField({
        chipsEl: panel.querySelector('#j-edit-audience-field .j-tag-chips'),
        selectRoot: document.getElementById('j-select-edit-audience'),
        getAudiences: () => editState.audience,
        setAudiences: (next) => { editState.audience = next; }
      });

      wireCheckbox(document.getElementById('j-edit-pin-checkbox'), notice.pinned, (checked) => { editState.pinned = checked; });

      panel.querySelectorAll('.j-modal-close').forEach((btn) => btn.addEventListener('click', closeNoticeModal));
      document.getElementById('j-edit-title').addEventListener('input', (e) => { editState.title = e.target.value; });
      document.getElementById('j-edit-body').addEventListener('input', (e) => { editState.body = e.target.value; });

      document.getElementById('j-edit-notice-form').addEventListener('submit', (event) => {
        event.preventDefault();
        if (!editState.title.trim() || !editState.body.trim()) return;
        const updated = { ...notice, title: editState.title.trim(), category: editState.category, audience: editState.audience, body: editState.body.trim(), pinned: editState.pinned };
        updateNotice(updated);
        state.modal.mode = 'view';
        renderNoticeModal();
      });
      return;
    }

    // default: view mode
    panel.innerHTML = noticeModalViewTemplate(notice);
    panel.querySelectorAll('.j-modal-close').forEach((btn) => btn.addEventListener('click', closeNoticeModal));
    panel.querySelector('.j-modal-edit-trigger').addEventListener('click', () => {
      state.modal.mode = 'edit';
      renderNoticeModal();
    });
  }

  /* =======================================================================
     10. POST NOTICE VIEW — form state, validation, submit
     ======================================================================= */

  function resetPostForm() {
    state.postForm = { title: '', category: '', body: '', audiences: [], pinned: false, attachmentName: '' };
    document.getElementById('j-post-title').value = '';
    document.getElementById('j-post-body').value = '';
    document.getElementById('j-post-attachment-input').value = '';
    document.querySelector('.j-attachment-name').textContent = 'Click to upload a file';
    postCategorySelect.refresh();
    postAudienceField.renderChips();
    postPinCheckbox.setChecked(false);
    setPostFormMessage('');
  }

  function setPostFormMessage(message, tone) {
    const messageEl = document.querySelector('.j-post-form-message');
    messageEl.textContent = message;
    messageEl.classList.toggle('c-is-visible', Boolean(message));
    messageEl.classList.toggle('c-is-error', tone === 'error');
    messageEl.classList.toggle('c-is-success', tone === 'success');
  }

  let postCategorySelect;
  let postAudienceField;
  let postPinCheckbox;

  function initPostNoticeForm() {
    document.getElementById('j-post-title').addEventListener('input', (event) => {
      state.postForm.title = event.target.value;
      setPostFormMessage('');
    });

    document.getElementById('j-post-body').addEventListener('input', (event) => {
      state.postForm.body = event.target.value;
      setPostFormMessage('');
    });

    postCategorySelect = createSelect({
      root: document.getElementById('j-select-post-category'),
      getOptions: () => CATEGORY_OPTIONS.map((v) => ({ label: v, value: v })),
      getValue: () => state.postForm.category,
      placeholder: 'Select category',
      onChoose: (value) => { state.postForm.category = value; setPostFormMessage(''); }
    });

    postAudienceField = createAudienceField({
      chipsEl: document.querySelector('#j-post-audience-field .j-tag-chips'),
      selectRoot: document.getElementById('j-select-post-audience'),
      getAudiences: () => state.postForm.audiences,
      setAudiences: (next) => { state.postForm.audiences = next; setPostFormMessage(''); },
      emptyText: 'No audience selected'
    });

    postPinCheckbox = wireCheckbox(document.getElementById('j-post-pin-checkbox'), false, (checked) => {
      state.postForm.pinned = checked;
    });

    const attachmentInput = document.getElementById('j-post-attachment-input');
    document.querySelector('.j-attachment-trigger').addEventListener('click', () => attachmentInput.click());
    attachmentInput.addEventListener('change', (event) => {
      const fileName = event.target.files && event.target.files[0] ? event.target.files[0].name : '';
      state.postForm.attachmentName = fileName;
      document.querySelector('.j-attachment-name').textContent = fileName || 'Click to upload a file';
      setPostFormMessage('');
    });

    document.getElementById('j-post-notice-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const { title, category, body, audiences, pinned } = state.postForm;

      if (!title.trim() || !category || !body.trim() || audiences.length === 0) {
        setPostFormMessage('Add a title, category, message, and at least one target audience before publishing.', 'error');
        return;
      }

      createNotice({ title: title.trim(), category, body: body.trim(), audience: audiences, pinned });
      setPostFormMessage(`“${title.trim()}” was published to the central Notice Board${pinned ? ' and pinned' : ''}.`, 'success');
      window.setTimeout(() => {
        switchView('notices');
        resetPostForm();
      }, 1000);
    });
  }

  /* =======================================================================
     11. GENERIC MODAL DISMISS HANDLERS (backdrop click + Escape key)
     ======================================================================= */

  function initModalDismissHandlers() {
    document.querySelector('.j-modal-backdrop').addEventListener('click', closeNoticeModal);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (document.getElementById('j-modal-notice').classList.contains('c-is-open')) {
        closeNoticeModal();
      } else {
        closeAllSelects();
      }
    });
    document.addEventListener('mousedown', (event) => {
      selectRegistry.forEach((instance) => {
        if (instance.root.isConnected && !instance.root.contains(event.target)) instance.close();
      });
    });
  }

  /* =======================================================================
     12. APP BOOTSTRAP
     ======================================================================= */

  function init() {
    initViewNavigation();
    initFilterBar();
    initNoticeGrid();
    initPostNoticeForm();
    initModalDismissHandlers();
    renderNoticeGrid();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
