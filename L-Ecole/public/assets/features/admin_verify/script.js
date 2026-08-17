/* =========================================================================
   L'ÉCOLE ADMIN — APPROVALS & VERIFICATIONS — APPLICATION SCRIPT
   ========================================================================= */

(function () {
  'use strict';

  const mockData = window.VERIFY_MOCK_DATA || {};
  const EMPTY_STATE_NOUN = mockData.EMPTY_STATE_NOUN || {
    Teachers: 'teacher accounts',
    Extracurriculars: 'extracurricular cards',
    Notices: 'notices'
  };

  const state = {
    activeTab: 'Teachers',
    statusFilter: 'Pending'
  };

  function singularize(pluralType) {
    return pluralType.slice(0, -1);
  }

  // Tab switching
  function initTabs() {
    const tabCards = document.querySelectorAll('.j-tab-card');
    const tabPanels = document.querySelectorAll('.j-tab-panel');

    function applyActiveTab() {
      tabCards.forEach((card) => {
        const isActive = card.dataset.tabName === state.activeTab;
        card.classList.toggle('c-is-active', isActive);
        card.setAttribute('aria-pressed', String(isActive));
      });
      tabPanels.forEach((panel) => {
        const isActive = panel.dataset.tabPanel === state.activeTab;
        panel.classList.toggle('c-is-active', isActive);
        panel.hidden = !isActive;
      });
    }

    tabCards.forEach((card) => {
      card.addEventListener('click', () => {
        state.activeTab = card.dataset.tabName;
        applyActiveTab();
      });
    });

    applyActiveTab();
  }

  // Status Filter Dropdown
  function initStatusFilter() {
    const dropdownEl = document.querySelector('.j-filter-dropdown');
    const toggleBtn = document.querySelector('.j-filter-toggle');
    const chevronIcon = document.querySelector('.j-filter-chevron');
    const menuEl = document.querySelector('.j-filter-menu');
    const currentLabelEl = document.querySelector('.j-filter-current-label');
    const filterLabelEl = document.querySelector('.j-filter-label');
    const filterOptions = document.querySelectorAll('.j-filter-option');

    function setMenuOpen(open) {
      menuEl.classList.toggle('c-is-open', open);
      chevronIcon.classList.toggle('c-is-open', open);
      toggleBtn.setAttribute('aria-expanded', String(open));
    }

    function applyStatusFilter() {
      currentLabelEl.textContent = state.statusFilter;
      filterLabelEl.textContent = `${state.statusFilter === 'All' ? 'All' : state.statusFilter} submissions`;
      toggleBtn.classList.toggle('c-is-modified', state.statusFilter !== 'Pending');

      filterOptions.forEach((option) => {
        const isSelected = option.dataset.filterValue === state.statusFilter;
        option.classList.toggle('c-is-selected', isSelected);
        option.setAttribute('aria-checked', String(isSelected));
      });

      applyCardVisibility();
    }

    toggleBtn.addEventListener('click', () => setMenuOpen(!menuEl.classList.contains('c-is-open')));

    filterOptions.forEach((option) => {
      option.addEventListener('click', () => {
        state.statusFilter = option.dataset.filterValue;
        applyStatusFilter();
        setMenuOpen(false);
      });
    });

    document.addEventListener('click', (event) => {
      if (dropdownEl && !dropdownEl.contains(event.target)) setMenuOpen(false);
    });

    applyStatusFilter();
  }

  // Card Visibility & Status Mutations
  function cardMatchesFilter(cardEl) {
    return state.statusFilter === 'All' || cardEl.dataset.itemStatus === state.statusFilter;
  }

  function applyCardVisibility() {
    document.querySelectorAll('.j-tab-panel').forEach((panel) => {
      const cards = panel.querySelectorAll('.j-approval-card');
      let visibleCount = 0;
      cards.forEach((cardEl) => {
        const matches = cardMatchesFilter(cardEl);
        cardEl.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      updateEmptyState(panel, visibleCount);
    });
  }

  function updateEmptyState(panelEl, visibleCount) {
    const emptyStateEl = panelEl.querySelector('.j-empty-state');
    const emptyStateTextEl = panelEl.querySelector('.j-empty-state-text');
    if (emptyStateEl) emptyStateEl.hidden = visibleCount !== 0;
    if (visibleCount === 0 && emptyStateTextEl) {
      const noun = EMPTY_STATE_NOUN[panelEl.dataset.tabPanel] || 'items';
      const filterWord = state.statusFilter !== 'All' ? `${state.statusFilter.toLowerCase()} ` : '';
      emptyStateTextEl.textContent = `No ${filterWord}${noun} to show.`;
    }
  }

  function updateTabCount(itemType) {
    const countEl = document.querySelector(`.j-tab-count[data-count-for="${itemType}"]`);
    if (!countEl) return;
    const panel = document.querySelector(`.j-tab-panel[data-tab-panel="${itemType}"]`);
    const pendingCount = panel.querySelectorAll('.j-approval-card[data-item-status="Pending"]').length;
    countEl.textContent = String(pendingCount);
  }

  function setCardStatus(cardEl, status) {
    cardEl.dataset.itemStatus = status;

    const badgeEl = cardEl.querySelector('.j-status-badge');
    if (badgeEl) {
      badgeEl.textContent = status;
      badgeEl.className = `c-status-badge j-status-badge c-status-badge--${status.toLowerCase()}`;
    }

    const actionsEl = cardEl.querySelector('.j-approval-actions');
    if (actionsEl) actionsEl.hidden = status !== 'Pending';

    updateTabCount(cardEl.dataset.itemType);
    applyCardVisibility();
  }

  function showFeedbackNote(cardEl, feedbackText) {
    const noteEl = cardEl.querySelector('.j-feedback-note');
    if (noteEl) {
      noteEl.querySelector('.j-feedback-text').textContent = feedbackText;
      noteEl.hidden = false;
    }
  }

  function initApprovalActions() {
    document.querySelectorAll('.j-approval-card').forEach((cardEl) => {
      const approveBtn = cardEl.querySelector('.j-approve-btn');
      const rejectBtn = cardEl.querySelector('.j-reject-btn');
      if (approveBtn) approveBtn.addEventListener('click', () => setCardStatus(cardEl, 'Approved'));
      if (rejectBtn) rejectBtn.addEventListener('click', () => openRejectModal(cardEl));
    });
  }

  // Reject Confirmation Modal
  let cardPendingRejection = null;

  function openRejectModal(cardEl) {
    cardPendingRejection = cardEl;

    const modalEl = document.getElementById('j-modal-reject');
    const typeLabelEl = modalEl.querySelector('.j-reject-modal-type');
    const itemNameEl = modalEl.querySelector('.j-reject-modal-item-name');
    const feedbackInput = document.getElementById('j-reject-feedback-input');
    const confirmBtn = document.getElementById('j-reject-confirm-btn');

    typeLabelEl.textContent = singularize(cardEl.dataset.itemType);
    itemNameEl.textContent = cardEl.dataset.itemTitle;
    feedbackInput.value = '';
    confirmBtn.disabled = true;

    modalEl.classList.add('c-is-open');
    feedbackInput.focus();
  }

  function closeRejectModal() {
    document.getElementById('j-modal-reject').classList.remove('c-is-open');
    cardPendingRejection = null;
  }

  function confirmReject() {
    if (!cardPendingRejection) return;
    const feedbackInput = document.getElementById('j-reject-feedback-input');
    const feedbackText = feedbackInput.value.trim();
    if (!feedbackText) return;

    setCardStatus(cardPendingRejection, 'Rejected');
    showFeedbackNote(cardPendingRejection, feedbackText);
    closeRejectModal();
  }

  function initRejectModal() {
    const modalEl = document.getElementById('j-modal-reject');
    const feedbackInput = document.getElementById('j-reject-feedback-input');
    const confirmBtn = document.getElementById('j-reject-confirm-btn');

    feedbackInput.addEventListener('input', () => {
      confirmBtn.disabled = feedbackInput.value.trim().length === 0;
    });

    confirmBtn.addEventListener('click', confirmReject);

    modalEl.querySelectorAll('.j-modal-close, .j-modal-backdrop').forEach((el) => {
      el.addEventListener('click', closeRejectModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalEl.classList.contains('c-is-open')) closeRejectModal();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initStatusFilter();
    initApprovalActions();
    initRejectModal();
  });
})();
