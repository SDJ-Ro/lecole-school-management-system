/* =========================================================================
   L'ÉCOLE — NOTICE BOARD MODULE — APPLICATION SCRIPT
   ========================================================================= */

(function () {
  'use strict';

  const mockData = window.NOTICE_MOCK_DATA || {};
  const initialNotices = mockData.initialNotices || [];

  function getInitials(name) { return name.split(' ').map((p) => p[0]).join('').slice(0, 2); }
  function formatTodayDate() { return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()); }
  function escapeHtml(v) { const d = document.createElement('div'); d.textContent = v == null ? '' : String(v); return d.innerHTML; }

  const ICON_PIN = (s, f) => `<svg class="c-icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="${f ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`;
  const ICON_PIN_OFF = (s) => `<svg class="c-icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h3.5"/><path d="M17.5 17H18a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7"/><path d="M9 4h6a2 2 0 0 1 1.5 3.32"/><path d="m2 2 20 20"/></svg>`;
  const ICON_PENCIL = (s) => `<svg class="c-icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
  const ICON_TRASH = (s) => `<svg class="c-icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  const ICON_X = (s) => `<svg class="c-icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

  const state = {
    notices: initialNotices.map((n) => ({ ...n, audience: [...n.audience] })),
    filters: { search: '', audience: 'All users', category: 'All' },
    modal: { noticeId: null, mode: null }
  };

  function switchView(viewName) {
    document.querySelectorAll('.c-view').forEach((sec) => sec.classList.toggle('c-is-active', sec.dataset.view === viewName));
    document.querySelectorAll('.c-select').forEach((el) => el.classList.remove('c-is-open'));
  }

  function initCustomSelect(root, onChoose) {
    if (!root) return;
    const trigger = root.querySelector('.c-select__trigger');
    const valueLabel = root.querySelector('.j-select-value');
    const options = root.querySelectorAll('.c-select__option');

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = root.classList.contains('c-is-open');
        document.querySelectorAll('.c-select').forEach((el) => el.classList.remove('c-is-open'));
        if (!isOpen) root.classList.add('c-is-open');
      });
    }

    options.forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        options.forEach((o) => o.classList.remove('c-is-selected'));
        opt.classList.add('c-is-selected');
        if (valueLabel) valueLabel.textContent = opt.dataset.value;
        if (onChoose) onChoose(opt.dataset.value);
        root.classList.remove('c-is-open');
      });
    });
  }

  function initTagChips(chipsEl, selectRoot, getAudiences, setAudiences) {
    if (!chipsEl || !selectRoot) return;
    function renderChips() {
      chipsEl.innerHTML = getAudiences().map((aud) => `
        <span class="c-chip">${escapeHtml(aud)}<button type="button" class="c-chip__remove j-chip-remove" data-value="${escapeHtml(aud)}">${ICON_X(11)}</button></span>`).join('');
      chipsEl.querySelectorAll('.j-chip-remove').forEach((btn) => {
        btn.addEventListener('click', () => { setAudiences(getAudiences().filter((a) => a !== btn.dataset.value)); renderChips(); });
      });
    }
    initCustomSelect(selectRoot, (val) => { if (!getAudiences().includes(val)) { setAudiences([...getAudiences(), val]); renderChips(); } });
    renderChips();
  }

  function getFilteredNotices() {
    const q = state.filters.search.trim().toLowerCase();
    return state.notices.filter((n) => {
      const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
      const matchesAudience = state.filters.audience === 'All users' || n.audience.includes(state.filters.audience);
      const matchesCategory = state.filters.category === 'All' || n.category === state.filters.category;
      return matchesSearch && matchesAudience && matchesCategory;
    }).sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }

  function renderNoticeGrid() {
    const gridEl = document.getElementById('j-notice-grid');
    const emptyEl = document.getElementById('j-empty-state');
    if (!gridEl || !emptyEl) return;
    const list = getFilteredNotices();
    emptyEl.hidden = list.length > 0;
    if (!list.length) { gridEl.innerHTML = ''; return; }

    gridEl.innerHTML = list.map((n, idx) => `
      <article class="c-notice-card" data-category="${escapeHtml(n.category)}" data-notice-id="${n.id}" style="animation-delay:${idx * 40}ms" tabindex="0">
        ${n.pinned ? `<span class="c-notice-card__pin">${ICON_PIN(18, true)}</span>` : ''}
        <div class="c-notice-card__tags"><span class="c-tag c-tag--category">${escapeHtml(n.category)}</span>${n.audience.map((a) => `<span class="c-tag c-tag--audience">${escapeHtml(a)}</span>`).join('')}</div>
        <h2 class="c-notice-card__title">${escapeHtml(n.title)}</h2>
        <p class="c-notice-card__body">${escapeHtml(n.body)}</p>
        <footer class="c-notice-card__footer">
          <div class="c-notice-card__author"><span class="c-avatar">${escapeHtml(getInitials(n.author))}</span><div><p class="c-notice-card__author-name">${escapeHtml(n.author)}</p><p class="c-notice-card__date">${escapeHtml((n.date || '').toUpperCase())}</p></div></div>
          <div class="c-notice-card__actions">
            <button type="button" class="c-icon-btn j-notice-pin" data-notice-id="${n.id}">${n.pinned ? ICON_PIN_OFF(16) : ICON_PIN(16, false)}</button>
            <button type="button" class="c-icon-btn j-notice-edit" data-notice-id="${n.id}">${ICON_PENCIL(16)}</button>
            <button type="button" class="c-icon-btn c-icon-btn--danger j-notice-delete" data-notice-id="${n.id}">${ICON_TRASH(16)}</button>
          </div>
        </footer>
      </article>`).join('');
  }

  function openModal(id, mode) {
    state.modal = { noticeId: id, mode };
    const notice = state.notices.find((n) => n.id === id);
    if (!notice) return;

    const layer = document.getElementById('j-modal-notice');
    const viewMode = document.getElementById('j-modal-view-mode');
    const deleteMode = document.getElementById('j-modal-delete-mode');
    const editForm = document.getElementById('j-edit-notice-form');

    viewMode.style.display = mode === 'view' ? 'block' : 'none';
    deleteMode.style.display = mode === 'delete' ? 'block' : 'none';
    editForm.style.display = mode === 'edit' ? 'block' : 'none';

    if (mode === 'edit') {
      document.getElementById('j-edit-title').value = notice.title;
      document.getElementById('j-edit-body').value = notice.body;
    } else if (mode === 'view') {
      document.getElementById('j-modal-view-title').textContent = notice.title;
      document.getElementById('j-modal-view-body').textContent = notice.body;
      document.getElementById('j-modal-view-tags').innerHTML = `<span class="c-tag c-tag--category">${escapeHtml(notice.category)}</span>${notice.audience.map((a) => `<span class="c-tag c-tag--audience">${escapeHtml(a)}</span>`).join('')}`;
      document.getElementById('j-modal-view-author-initials').textContent = getInitials(notice.author);
      document.getElementById('j-modal-view-author-name').textContent = notice.author;
      document.getElementById('j-modal-view-author-date').textContent = notice.date;
      document.getElementById('j-modal-view-pin').style.display = notice.pinned ? 'inline-flex' : 'none';
    }

    layer.classList.add('c-is-open');
  }

  function closeModal() {
    const layer = document.getElementById('j-modal-notice');
    if (layer) layer.classList.remove('c-is-open');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.j-go-post-notice')?.addEventListener('click', () => switchView('post-notice'));
    document.querySelector('.j-go-notice-board')?.addEventListener('click', () => switchView('notices'));

    const searchInput = document.querySelector('.j-search-input');
    if (searchInput) searchInput.addEventListener('input', (e) => { state.filters.search = e.target.value; renderNoticeGrid(); });

    initCustomSelect(document.getElementById('j-select-audience-filter'), (val) => { state.filters.audience = val; renderNoticeGrid(); });
    initCustomSelect(document.getElementById('j-select-category-filter'), (val) => { state.filters.category = val; renderNoticeGrid(); });
    document.querySelector('.j-clear-filters')?.addEventListener('click', () => { state.filters = { search: '', audience: 'All', category: 'All' }; if (searchInput) searchInput.value = ''; renderNoticeGrid(); });

    const gridEl = document.getElementById('j-notice-grid');
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const card = e.target.closest('.c-notice-card');
        if (!card) return;
        const id = Number(card.dataset.noticeId);
        if (e.target.closest('.j-notice-pin')) { e.stopPropagation(); const n = state.notices.find((i) => i.id === id); if (n) n.pinned = !n.pinned; renderNoticeGrid(); return; }
        if (e.target.closest('.j-notice-edit')) { e.stopPropagation(); openModal(id, 'edit'); return; }
        if (e.target.closest('.j-notice-delete')) { e.stopPropagation(); openModal(id, 'delete'); return; }
        openModal(id, 'view');
      });
    }

    document.querySelectorAll('.j-modal-close').forEach((b) => b.addEventListener('click', closeModal));
    document.querySelector('.j-modal-confirm-delete')?.addEventListener('click', () => { state.notices = state.notices.filter((n) => n.id !== state.modal.noticeId); renderNoticeGrid(); closeModal(); });
    document.querySelector('.j-modal-cancel-delete')?.addEventListener('click', closeModal);
    document.querySelector('.j-modal-edit-trigger')?.addEventListener('click', () => openModal(state.modal.noticeId, 'edit'));

    let editCategory = 'General';
    initCustomSelect(document.getElementById('j-select-edit-category'), (val) => { editCategory = val; });

    document.getElementById('j-edit-notice-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = state.notices.find((item) => item.id === state.modal.noticeId);
      if (n) {
        n.title = document.getElementById('j-edit-title').value.trim();
        n.body = document.getElementById('j-edit-body').value.trim();
        if (editCategory) n.category = editCategory;
        renderNoticeGrid();
        openModal(n.id, 'view');
      }
    });

    let postAudiences = [];
    initTagChips(document.querySelector('#j-post-audience-field .j-tag-chips'), document.getElementById('j-select-post-audience'), () => postAudiences, (next) => { postAudiences = next; });

    let postCategory = 'General';
    initCustomSelect(document.getElementById('j-select-post-category'), (val) => { postCategory = val; });

    document.getElementById('j-post-notice-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('j-post-title').value.trim();
      const body = document.getElementById('j-post-body').value.trim();
      if (!title || !body) return;
      const nextId = state.notices.reduce((max, n) => Math.max(max, n.id), 0) + 1;
      state.notices.unshift({ id: nextId, title, body, category: postCategory || 'General', audience: postAudiences.length ? postAudiences : ['All users'], author: 'Alex Thompson', date: formatTodayDate(), pinned: false });
      renderNoticeGrid();
      switchView('notices');
    });

    document.addEventListener('click', (e) => { if (!e.target.closest('.c-select')) document.querySelectorAll('.c-select').forEach((el) => el.classList.remove('c-is-open')); });
    renderNoticeGrid();
  });
})();
