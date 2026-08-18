(function () {
  'use strict';

  const ICONS = {
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
  };

  const mockData = window.COMPLAINTS_MOCK_DATA || {};
  let complaints = (mockData.COMPLAINTS || []).slice();
  const CATEGORY_OPTIONS = mockData.CATEGORY_OPTIONS || [];
  const STATUS_OPTIONS = mockData.STATUS_OPTIONS || [];

  const state = {
    searchQuery: '',
    filterCategory: 'All',
    filterStatus: 'All',
    resolvingId: null,
    resolutionNote: ''
  };

  const listEl = document.getElementById('complaintsList');
  const emptyEl = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildSelect(wrapId, triggerId, labelId, menuId, options, currentValue, onChange) {
    const wrap = document.getElementById(wrapId);
    const trigger = document.getElementById(triggerId);
    const labelEl = document.getElementById(labelId);
    const menu = document.getElementById(menuId);

    const selected = options.find((o) => o.value === currentValue);
    labelEl.textContent = selected ? selected.label : 'Select...';

    menu.innerHTML = options.map((o) => `
      <button type="button" class="select-option ${o.value === currentValue ? 'selected' : ''}" data-value="${escapeHtml(o.value)}">
        <span>${escapeHtml(o.label)}</span>
        ${o.value === currentValue ? ICONS.check : ''}
      </button>
    `).join('');

    trigger.onclick = (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('open');
      closeAllSelects();
      if (!isOpen) wrap.classList.add('open');
    };

    menu.querySelectorAll('.select-option').forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        onChange(btn.dataset.value);
        wrap.classList.remove('open');
      };
    });
  }

  function closeAllSelects() {
    document.querySelectorAll('.select-wrap').forEach((w) => w.classList.remove('open'));
  }

  document.addEventListener('click', closeAllSelects);

  function renderSelects() {
    buildSelect('categorySelectWrap', 'categoryTrigger', 'categoryTriggerLabel', 'categoryMenu', CATEGORY_OPTIONS, state.filterCategory, (v) => {
      state.filterCategory = v;
      render();
    });
    buildSelect('statusSelectWrap', 'statusTrigger', 'statusTriggerLabel', 'statusMenu', STATUS_OPTIONS, state.filterStatus, (v) => {
      state.filterStatus = v;
      render();
    });
  }

  function getFiltered() {
    const q = state.searchQuery.toLowerCase();
    return complaints.filter((c) => {
      const matchesSearch = c.subject.toLowerCase().includes(q) || c.parentName.toLowerCase().includes(q);
      const matchesCategory = state.filterCategory === 'All' || c.category === state.filterCategory;
      const matchesStatus = state.filterStatus === 'All' || c.status === state.filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  function handleResolve(id) {
    if (!state.resolutionNote.trim()) return;
    complaints = complaints.map((c) => c.id === id ? { ...c, status: 'Resolved', resolutionNote: state.resolutionNote } : c);
    state.resolvingId = null;
    state.resolutionNote = '';
    render();
  }

  function renderCard(complaint) {
    const isResolved = complaint.status === 'Resolved';
    const statusBadge = `
      <span class="status-badge ${isResolved ? 'resolved' : 'in-progress'}">
        ${isResolved ? ICONS.checkCircle : ICONS.clock}
        ${complaint.status}
      </span>`;

    const resolveButton = (!isResolved && state.resolvingId !== complaint.id) ? `
      <button class="resolve-btn" data-action="start-resolve" data-id="${complaint.id}">Mark as Resolved</button>
    ` : '';

    const resolutionFooter = complaint.resolutionNote ? `
      <div class="resolution-footer">
        <p>Message to Parent:</p>
        <p>${escapeHtml(complaint.resolutionNote)}</p>
      </div>
    ` : '';

    const resolveBar = state.resolvingId === complaint.id ? `
      <div class="resolve-bar">
        <input type="text" id="resolveInput-${complaint.id}" placeholder="Write a message to the parent explaining the resolution..." value="${escapeHtml(state.resolutionNote)}" autofocus />
        <button class="icon-btn" data-action="cancel-resolve" aria-label="Cancel resolution">${ICONS.x}</button>
        <button class="send-btn" data-action="send-resolve" data-id="${complaint.id}" ${!state.resolutionNote.trim() ? 'disabled' : ''}>${ICONS.send} Resolve</button>
      </div>
    ` : '';

    return `
      <div class="complaint-card cat-${complaint.category}">
        <div class="complaint-body">
          <div class="complaint-main">
            <div class="complaint-meta">
              ${statusBadge}
              <span class="category-badge">${complaint.category}</span>
              <span class="dot-sep">&bull;</span>
              <span class="complaint-date">${complaint.date}</span>
            </div>
            <h3 class="complaint-subject">${escapeHtml(complaint.subject)}</h3>
            <p class="complaint-message">${escapeHtml(complaint.message)}</p>
            <div class="complaint-parent">
              <span class="name">${escapeHtml(complaint.parentName)}</span>
              <span>(${escapeHtml(complaint.childClass)})</span>
            </div>
          </div>
          ${resolveButton}
        </div>
        ${resolutionFooter}
        ${resolveBar}
      </div>
    `;
  }

  function render() {
    renderSelects();
    const filtered = getFiltered();
    listEl.innerHTML = filtered.map(renderCard).join('');
    emptyEl.hidden = filtered.length !== 0;

    listEl.querySelectorAll('[data-action="start-resolve"]').forEach((btn) => {
      btn.onclick = () => {
        state.resolvingId = btn.dataset.id;
        state.resolutionNote = '';
        render();
        const input = document.getElementById(`resolveInput-${btn.dataset.id}`);
        if (input) input.focus();
      };
    });

    listEl.querySelectorAll('[data-action="cancel-resolve"]').forEach((btn) => {
      btn.onclick = () => {
        state.resolvingId = null;
        state.resolutionNote = '';
        render();
      };
    });

    listEl.querySelectorAll('[data-action="send-resolve"]').forEach((btn) => {
      btn.onclick = () => handleResolve(btn.dataset.id);
    });

    if (state.resolvingId) {
      const input = document.getElementById(`resolveInput-${state.resolvingId}`);
      if (input) {
        input.oninput = (e) => {
          state.resolutionNote = e.target.value;
          const sendBtn = listEl.querySelector(`[data-action="send-resolve"][data-id="${state.resolvingId}"]`);
          if (sendBtn) sendBtn.disabled = !state.resolutionNote.trim();
        };
        input.onkeydown = (e) => {
          if (e.key === 'Enter') handleResolve(state.resolvingId);
          if (e.key === 'Escape') { state.resolvingId = null; state.resolutionNote = ''; render(); }
        };
      }
    }
  }

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    render();
  });

  render();
})();
