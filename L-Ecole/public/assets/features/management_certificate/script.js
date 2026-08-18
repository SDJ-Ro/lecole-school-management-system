(function () {
  'use strict';

  /* ============================= ICONS ============================= */
  const ICONS = {
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    fileCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>',
    grad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 3 3 6 3s6-1.34 6-3v-5"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    printer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    xCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    helpCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    fileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    alertCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  /* ============================= DATA ============================= */
  const mockData = window.CHARACTER_CERTIFICATE_MOCK_DATA || {};
  let certificates = (mockData.CERTIFICATES || []).slice();

  const certificatePortraits = {};

  function portraitFor(id) {
    return certificatePortraits[id] || 'https://placehold.co/200x200/EFE8DF/0F414A?text=' + encodeURIComponent(initialsFor(certificates.find(c => c.id === id) ? certificates.find(c => c.id === id).name : '?'));
  }

  function initialsFor(name) {
    return name.split(' ').map((p) => p[0]).join('').slice(0, 2);
  }

  function certificatePoints(value) {
    if (!value) return [];
    const parts = value.split(/\r?\n| · /).map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts;
    return [value.trim()].filter(Boolean);
  }

  function formatForEditing(value) {
    if (!value) return '';
    return certificatePoints(value).join('\n');
  }

  /* ============================= STATE ============================= */
  const state = {
    query: '',
    queue: 'Pending review', // 'All' | 'Pending review' | 'Issued' | 'Student requests'
    requestFilter: 'All',
    reasonFilter: 'All students',
    selectedId: null,
    isEditing: false,
    isRequestsPanelOpen: false,
    certificatePage: 1,
    totalPages: 1,
    collapsedIssuedYears: {},
    notice: '',
    previewFile: null
  };

  const REQUEST_FILTER_OPTIONS = mockData.REQUEST_FILTER_OPTIONS || ['All', 'Pending Requests', 'Approved', 'Rejected'];

  const app = document.getElementById('app');
  let resizeObserver = null;

  function getSelected() {
    return certificates.find((c) => c.id === state.selectedId) || null;
  }

  /* ============================= DERIVED ============================= */
  function getVisibleCertificates() {
    return certificates.filter((certificate) => {
      if (state.queue === 'Student requests') {
        const hasCertRequests = certificate.certificateRequests && certificate.certificateRequests.length > 0;
        const hasMissingRecords = certificate.missingRecordRequests && certificate.missingRecordRequests.length > 0;
        if (!hasCertRequests && !hasMissingRecords) return false;

        let matchesFilter = true;
        if (state.requestFilter === 'Pending Requests') {
          matchesFilter = !!((certificate.certificateRequests || []).some((r) => r.status === 'Pending') || (certificate.missingRecordRequests || []).some((r) => r.status === 'Pending'));
        } else if (state.requestFilter === 'Approved') {
          matchesFilter = !!((certificate.certificateRequests || []).some((r) => r.status === 'Resolved') || (certificate.missingRecordRequests || []).some((r) => r.status === 'Resolved'));
        } else if (state.requestFilter === 'Rejected') {
          matchesFilter = !!((certificate.certificateRequests || []).some((r) => r.status === 'Rejected') || (certificate.missingRecordRequests || []).some((r) => r.status === 'Rejected'));
        }
        if (!matchesFilter) return false;

        if (state.query.trim()) {
          const q = state.query.toLowerCase();
          const matchesNameOrId = `${certificate.name} ${certificate.id}`.toLowerCase().includes(q);
          const matchesCertReq = (certificate.certificateRequests || []).some((r) => r.id.toLowerCase().includes(q));
          const matchesMissingReq = (certificate.missingRecordRequests || []).some((r) =>
            r.id.toLowerCase().includes(q) || (r.assignedTeacher || '').toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
          );
          if (!matchesNameOrId && !matchesCertReq && !matchesMissingReq) return false;
        }
        return true;
      }
      const matchesQueue = (state.queue === 'All' || state.queue === 'Pending review') ? true : certificate.status === state.queue;
      let matchesReason = true;
      if (state.reasonFilter && state.reasonFilter !== 'All' && state.reasonFilter !== 'All Certificates' && state.reasonFilter !== 'All students') {
        if (state.reasonFilter === 'Graduating Students' || state.reasonFilter === 'Graduating student') {
          matchesReason = (certificate.reason || '').toLowerCase().includes('graduat');
        } else if (state.reasonFilter === 'Leaving Students' || state.reasonFilter === 'Leaving student') {
          matchesReason = (certificate.reason || '').toLowerCase().includes('leav');
        } else if (state.reasonFilter === 'Junior Section (Grades 1-5)') {
          matchesReason = !!(certificate.cohort || '').match(/Grade [1-5]/i);
        } else if (state.reasonFilter === 'Middle Section (Grades 6-8)') {
          matchesReason = !!(certificate.cohort || '').match(/Grade [6-8]/i);
        } else if (state.reasonFilter === 'Senior Section (Grades 9-11)') {
          matchesReason = !!(certificate.cohort || '').match(/Grade (9|10|11)/i);
        } else if (state.reasonFilter === 'A-Levels Section (Grades 12-13)') {
          matchesReason = !!(certificate.cohort || '').match(/Grade (12|13)|A-Level/i);
        } else {
          matchesReason = certificate.reason === state.reasonFilter || (certificate.cohort || '').includes(state.reasonFilter);
        }
      }
      const matchesQuery = `${certificate.name} ${certificate.id} ${certificate.cohort}`.toLowerCase().includes(state.query.trim().toLowerCase());
      return matchesQueue && matchesReason && matchesQuery;
    });
  }

  function groupCertificatesByIssueYear(list) {
    const byYear = list.filter((c) => c.status === 'Issued').reduce((groups, c) => {
      const year = c.requestedOn.split(' ').pop() || 'Unknown year';
      groups[year] = groups[year] || [];
      groups[year].push(c);
      return groups;
    }, {});
    return Object.entries(byYear).sort((a, b) => Number(b[0]) - Number(a[0]));
  }

  /* ============================= MUTATIONS ============================= */
  function updateCertificateInState(field, value) {
    const selected = getSelected();
    if (!selected) return;
    certificates = certificates.map((c) => c.id === selected.id ? { ...c, [field]: value } : c);
    if (field === 'id') state.selectedId = value;
  }

  function updateCertificate(field, value) {
    updateCertificateInState(field, value);
    render();
  }

  function nowTimestamp() {
    return new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function updateMissingRecordRequest(certificateId, requestId, updates) {
    certificates = certificates.map((cert) => {
      if (cert.id !== certificateId) return cert;
      const req = (cert.missingRecordRequests || []).find((r) => r.id === requestId);
      const newActivity = {
        id: `ACT-${Date.now()}`,
        timestamp: nowTimestamp(),
        action: `Management updated request status to ${updates.status || updates.managementStatus || 'modified'}`,
        user: 'Management Panel'
      };
      let updatedCert = { ...cert };
      if (updates.status === 'Resolved' && updates.managementStatus === 'Approved' && req) {
        if (req.category === 'Academic') {
          updatedCert.academic = updatedCert.academic ? `${updatedCert.academic} · ${req.title}` : req.title;
        } else if (req.category === 'Sports' || req.category === 'Club' || req.category === 'Other') {
          updatedCert.activities = updatedCert.activities ? `${updatedCert.activities} · ${req.title}` : req.title;
        } else if (req.category === 'Attendance') {
          updatedCert.conduct = updatedCert.conduct ? `${updatedCert.conduct} · ${req.title}` : req.title;
        }
      }
      return {
        ...updatedCert,
        missingRecordRequests: (updatedCert.missingRecordRequests || []).map((r) => r.id === requestId ? { ...r, ...updates, activityLog: [...(r.activityLog || []), newActivity] } : r),
        activityLog: [...(updatedCert.activityLog || []), newActivity]
      };
    });
    render();
  }

  function updateCertificateRequest(certificateId, requestId, updates) {
    certificates = certificates.map((cert) => {
      if (cert.id !== certificateId) return cert;
      const newActivity = {
        id: `ACT-${Date.now()}`,
        timestamp: nowTimestamp(),
        action: `Management updated request status to ${updates.status || 'modified'}`,
        user: 'Management Panel'
      };
      return {
        ...cert,
        certificateRequests: (cert.certificateRequests || []).map((r) => r.id === requestId ? { ...r, ...updates, activityLog: [...(r.activityLog || []), newActivity] } : r),
        activityLog: [...(cert.activityLog || []), newActivity]
      };
    });
    render();
  }

  function finalizeCertificate() {
    const selected = getSelected();
    if (!selected) return;
    certificates = certificates.map((c) => c.id === selected.id ? { ...c, status: 'Issued' } : c);
    state.queue = 'Issued';
    state.isEditing = false;
    render();
  }

  function printCertificate() {
    window.print();
  }

  /* ============================= GENERIC SELECT ============================= */
  let selectSeq = 0;
  function renderSelect(id, options, currentValue, placeholder) {
    const selected = options.find((o) => (typeof o === 'string' ? o : o.value) === currentValue);
    const label = selected ? (typeof selected === 'string' ? selected : selected.label) : (placeholder || 'Select...');
    const optsHtml = options.map((o) => {
      const val = typeof o === 'string' ? o : o.value;
      const lbl = typeof o === 'string' ? o : o.label;
      const isSel = val === currentValue;
      return `<button type="button" class="select-option ${isSel ? 'selected' : ''}" data-select="${id}" data-value="${escapeHtml(val)}"><span>${escapeHtml(lbl)}</span>${isSel ? ICONS.check : ''}</button>`;
    }).join('');
    return `
      <div class="select-wrap" data-select-wrap="${id}">
        <button type="button" class="select-trigger" data-select-trigger="${id}">
          <span>${escapeHtml(label)}</span>
          ${ICONS.chevronDown.replace('<svg', '<svg class="chevron"')}
        </button>
        <div class="select-menu">${optsHtml}</div>
      </div>`;
  }

  function wireSelects(root, handlers) {
    root.querySelectorAll('[data-select-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrap = trigger.closest('[data-select-wrap]');
        const wasOpen = wrap.classList.contains('open');
        root.querySelectorAll('[data-select-wrap]').forEach((w) => w.classList.remove('open'));
        if (!wasOpen) wrap.classList.add('open');
      });
    });
    root.querySelectorAll('[data-select] .select-option, [data-select]').forEach(() => {});
    root.querySelectorAll('.select-option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = opt.dataset.select;
        const value = opt.dataset.value;
        if (handlers[id]) handlers[id](value);
        root.querySelectorAll('[data-select-wrap]').forEach((w) => w.classList.remove('open'));
      });
    });
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('[data-select-wrap].open').forEach((w) => w.classList.remove('open'));
  });

  /* ============================= RENDER: CERT CARD ============================= */
  function renderCertCard(cert) {
    const pendingCount = ((cert.certificateRequests || []).filter((r) => r.status === 'Pending').length) + ((cert.missingRecordRequests || []).filter((r) => r.status === 'Pending').length);
    return `
      <button type="button" class="cert-card ${cert.gender}" data-open-cert="${escapeHtml(cert.id)}" aria-label="Open ${escapeHtml(cert.name)}'s character certificate">
        <span class="cert-avatar-wrap ${pendingCount > 0 ? 'has-pending' : ''}">
          <img alt="Portrait of ${escapeHtml(cert.name)}" src="${portraitFor(cert.id)}" />
          ${pendingCount > 0 ? '<span class="cert-pending-dot" title="Pending student request"></span>' : ''}
        </span>
        <h3>${escapeHtml(cert.name)}</h3>
        <p>${escapeHtml(cert.id)}</p>
        <p>${escapeHtml(cert.cohort.split(' · ')[0])}</p>
      </button>`;
  }

  /* ============================= RENDER: LIST VIEW ============================= */
  function renderListView() {
    const visible = getVisibleCertificates();
    const pendingCount = certificates.filter((c) => c.status === 'Pending review').length;
    const issuedCount = certificates.filter((c) => c.status === 'Issued').length;
    const pendingCertRequestsCount = certificates.reduce((acc, c) => acc + ((c.certificateRequests || []).filter((r) => r.status === 'Pending').length), 0);
    const pendingMissingRecordsCount = certificates.reduce((acc, c) => acc + ((c.missingRecordRequests || []).filter((r) => r.status === 'Pending').length), 0);
    const requestsCount = pendingCertRequestsCount + pendingMissingRecordsCount;


    const queueTitle = state.queue === 'Issued' ? 'Issued certificates' : state.queue === 'Student requests' ? 'Student Requests' : 'Awaiting review';

    const queueHeaderHtml = `
      <div class="queue-header">
        <h2>Overview & Certificates</h2>
        <div class="queue-tabs">
          <button type="button" class="queue-tab ${state.queue === 'Pending review' ? 'active' : ''}" data-queue="Pending review">All Certificates <span class="count">${certificates.length}</span></button>
          <button type="button" class="queue-tab ${state.queue === 'Issued' ? 'active' : ''}" data-queue="Issued">Issued <span class="count">${issuedCount}</span></button>
        </div>
      </div>`;

    const pathwayOptions = ['All students', 'Leaving student', 'Graduating student'];
    const filterRowHtml = `
      <div class="filter-row">
        <div class="search-box">${ICONS.search}<input type="search" id="queryInput" placeholder="Search name, ID, or cohort..." value="${escapeHtml(state.query)}" /></div>
        <div class="pathway-filter" role="group" aria-label="Student pathway filter">
          ${pathwayOptions.map((o) => `<button type="button" class="pathway-btn ${state.reasonFilter === o ? 'active' : ''}" data-reason="${escapeHtml(o)}">${o === 'All students' ? 'All' : o.replace(' student', '')}</button>`).join('')}
        </div>
      </div>`;

    let gridHtml;
    if (state.queue === 'Issued') {
      const grouped = groupCertificatesByIssueYear(visible);
      if (!grouped.length) {
        gridHtml = `<div class="empty-cert">No certificates match these filters.</div>`;
      } else {
        gridHtml = `<div class="stack" style="gap:32px;">` + grouped.map(([year, list]) => {
          const collapsed = !!state.collapsedIssuedYears[year];
          return `
            <section class="year-section">
              <button type="button" class="year-toggle" data-toggle-year="${escapeHtml(year)}" aria-expanded="${!collapsed}">
                <span class="left"><span class="year-label">${escapeHtml(year)}</span><span class="year-count">${list.length} issued</span></span>
                ${collapsed ? ICONS.chevronDown : ICONS.chevronUp}
              </button>
              ${!collapsed ? `<div class="cert-grid">${list.map(renderCertCard).join('')}</div>` : ''}
            </section>`;
        }).join('') + `</div>`;
      }
    } else {
      if (!visible.length) {
        gridHtml = `<div class="empty-cert">No certificates match these filters.</div>`;
      } else {
        const withIssues = visible.filter((c) => {
          const pendingReqs = ((c.certificateRequests || []).filter((r) => r.status === 'Pending').length) + ((c.missingRecordRequests || []).filter((r) => r.status === 'Pending').length);
          return pendingReqs > 0 || c.status === 'Pending review';
        });
        const normalCerts = visible.filter((c) => {
          const pendingReqs = ((c.certificateRequests || []).filter((r) => r.status === 'Pending').length) + ((c.missingRecordRequests || []).filter((r) => r.status === 'Pending').length);
          return pendingReqs === 0 && c.status !== 'Pending review';
        });

        let issuesSectionHtml = '';
        if (withIssues.length) {
          issuesSectionHtml = `
            <section class="cert-group-section">
              <div class="cert-group-header">
                <h3 class="cert-group-title">${ICONS.alertCircle} Certificates needing review</h3>
                <span class="cert-group-badge">${withIssues.length} Pending Review</span>
              </div>
              <div class="cert-grid">${withIssues.map(renderCertCard).join('')}</div>
            </section>`;
        }

        let normalSectionHtml = '';
        if (normalCerts.length) {
          normalSectionHtml = `
            <section class="cert-group-section">
              <div class="cert-group-header">
                <h3 class="cert-group-title">${ICONS.fileCheck} Verified Certificates</h3>
                <span class="cert-group-badge normal">${normalCerts.length} Verified</span>
              </div>
              <div class="cert-grid">${normalCerts.map(renderCertCard).join('')}</div>
            </section>`;
        }

        gridHtml = `<div class="stack" style="gap:24px;">${issuesSectionHtml}${normalSectionHtml}</div>`;
      }
    }

    return `
      <div class="stack">
        ${queueHeaderHtml}
        ${filterRowHtml}
        ${gridHtml}
      </div>
    `;
  }

  /* ============================= RENDER: CERTIFICATE FACT / SECTION ============================= */
  function renderFact(label, value, editable, field) {
    if (editable) {
      return `
        <label class="fact-row">
          <span class="fact-label">${escapeHtml(label)}</span>
          <input aria-label="${escapeHtml(label)}" data-particular="${field}" value="${escapeHtml(value)}" />
        </label>`;
    }
    return `
      <div class="fact-row">
        <span class="fact-label">${escapeHtml(label)}</span>
        <span class="fact-value">${escapeHtml(value)}</span>
      </div>`;
  }

  function renderCertSection(icon, label, value, editable, field, pendingAnnotations) {
    pendingAnnotations = pendingAnnotations || [];
    let body;
    const val = value || '';
    if (editable) {
      const editVal = formatForEditing(val);
      body = `<textarea class="cert-textarea" aria-label="${escapeHtml(label)}" data-section="${field}">${escapeHtml(editVal)}</textarea>`;
    } else {
      const points = certificatePoints(val);
      const pointsHtml = points.length
        ? points.map((p) => `<li><span class="dot"></span>${escapeHtml(p)}</li>`).join('')
        : (val ? `<li><span class="dot"></span>${escapeHtml(val)}</li>` : '');
      const annotations = pendingAnnotations.map((a) => `<li class="pending"><span class="dot"></span><span>${escapeHtml(a)}</span><span class="pending-badge">Pending Review</span></li>`).join('');
      body = `<ul class="cert-points">${pointsHtml}${annotations}</ul>`;
    }
    return `
      <section class="cert-section-block">
        <div class="cert-section-heading">
          <h4>${icon}${escapeHtml(label)}</h4>
          ${editable ? '<span class="detail">Editable (Press Enter for new point)</span>' : ''}
        </div>
        ${body}
      </section>`;
  }

  /* ============================= RENDER: DETAIL VIEW ============================= */
  function renderDetailView() {
    const selected = getSelected();
    if (!selected) return '';
    const classLabel = selected.cohort.split(' · ')[0];
    const studyPeriod = selected.reason === 'Graduating student' ? `${classLabel.replace(/-[A-Z]$/, '')} completion` : `${classLabel} record`;

    const pendingReqCount = ((selected.certificateRequests || []).filter((r) => r.status === 'Pending').length) + ((selected.missingRecordRequests || []).filter((r) => r.status === 'Pending').length);

    const particularsHtml = `
      <section aria-labelledby="student-particulars-heading">
        <div class="cert-section-heading">
          <h4 id="student-particulars-heading">Student particulars</h4>
          <span class="detail">${state.isEditing ? 'Editable' : 'Verified student record'}</span>
        </div>
        <div class="particulars-grid">
          ${renderFact('Full name', selected.name, state.isEditing, 'name')}
          ${renderFact('Name with initials', initialsFor(selected.name), false)}
          ${renderFact('Student index no.', selected.id, state.isEditing, 'id')}
          ${renderFact('Current class', selected.cohort, state.isEditing, 'cohort')}
          ${renderFact('Period of study', studyPeriod, false)}
        </div>
      </section>`;

    const academicSection = renderCertSection(ICONS.grad, 'Special recognition', selected.academic, state.isEditing, 'academic',
      (selected.missingRecordRequests || []).filter((r) => r.status === 'Pending' && r.category === 'Academic').map((r) => r.title));
    const activitiesSection = renderCertSection(ICONS.fileCheck, 'Extracurricular achievements', selected.activities, state.isEditing, 'activities',
      (selected.missingRecordRequests || []).filter((r) => r.status === 'Pending' && (r.category === 'Sports' || r.category === 'Club' || r.category === 'Other')).map((r) => r.title));
    const conductSection = renderCertSection(ICONS.user, 'Conduct & character', selected.conduct, state.isEditing, 'conduct',
      (selected.missingRecordRequests || []).filter((r) => r.status === 'Pending' && r.category === 'Attendance').map((r) => r.title));

    const timelineHtml = (selected.activityLog && selected.activityLog.length) ? `
      <section class="timeline-section">
        <h3>Certificate Activity</h3>
        <div>
          ${selected.activityLog.map((activity, i) => `
            <div class="timeline-item">
              <div class="timeline-dot-col">
                <div class="timeline-dot"></div>
                ${i !== selected.activityLog.length - 1 ? '<div class="timeline-line"></div>' : ''}
              </div>
              <div class="timeline-content">
                <p>${escapeHtml(activity.action)}</p>
                <p>${escapeHtml(activity.timestamp)} · ${escapeHtml(activity.user)}</p>
              </div>
            </div>`).join('')}
        </div>
      </section>` : '';

    return `
      <div class="stack" style="gap:16px;">
        <button type="button" class="back-btn no-print" id="backToListBtn">${ICONS.arrowLeft} Back to list</button>

        <section class="cert-detail-panel">
          <header class="cert-detail-header no-print">
            <div class="left">
              <span class="avatar-circle">${escapeHtml(initialsFor(selected.name))}</span>
              <div>
                <div class="name-row">
                  <h2>${escapeHtml(selected.name)}</h2>
                  <span class="status-pill ${selected.status === 'Pending review' ? 'pending' : 'issued'}">${escapeHtml(selected.status)}</span>
                </div>
                <p class="sub-line">${escapeHtml(selected.id)} · ${escapeHtml(selected.cohort)}</p>
              </div>
            </div>
            <div class="header-actions">
              <div class="btn-badge-wrap">
                <button type="button" class="btn btn-sand" id="openRequestsPanelBtn">${ICONS.message} Student Requests</button>
                ${pendingReqCount > 0 ? `<span class="badge-count">${pendingReqCount}</span>` : ''}
              </div>
              <button type="button" class="btn btn-sand" id="toggleEditBtn">${ICONS.pencil}${state.isEditing ? 'Done editing' : 'Edit wording'}</button>
              ${selected.status === 'Pending review' ? `<button type="button" class="btn btn-maroon" id="finalizeBtn">${ICONS.send} Finalise</button>` : ''}
            </div>
          </header>

          <div class="cert-doc-area">
            <!-- Hidden measurement container -->
            <div id="certMeasure" style="position:absolute;left:-9999px;top:0;width:684px;visibility:hidden;">
              <div id="certContentRef">
                <div class="cert-doc-header">
                  <p class="school-name">L\u2019\u00c9COLE</p>
                  <p class="tagline">Institutional excellence since 1994</p>
                  <div class="rule"></div>
                  <h3>Character Certificate</h3>
                  <p class="awarded">Awarded to <b>${escapeHtml(selected.name)}</b></p>
                </div>
                <div class="cert-doc-body">
                  ${particularsHtml}
                  ${academicSection}
                  ${activitiesSection}
                  ${conductSection}
                </div>
                <footer class="cert-doc-footer">
                  <div>
                    <p class="issued-bold">Issued on ${escapeHtml(selected.requestedOn)}</p>
                    <p>Student pathway: ${escapeHtml(selected.reason)}</p>
                  </div>
                  <div class="signature-line">Principal signature</div>
                </footer>
              </div>
            </div>

            <!-- Visible A4 page -->
            <article class="certificate-a4-page" id="certVisiblePage"></article>

            <div class="pagination-row no-print" id="certPaginationRow" style="display:none;">
              <button type="button" class="btn btn-light" id="prevPageBtn">${ICONS.chevronLeft} Previous page</button>
              <span id="certPageLabel"></span>
              <button type="button" class="btn btn-dark" id="nextPageBtn">Next page ${ICONS.chevronRight}</button>
            </div>
          </div>
        </section>

        ${timelineHtml}
      </div>`;
  }

  /* ============================= RENDER: REQUESTS MODAL ============================= */
  function statusBadgeClass(s) { return (s || '').replace(/\s+/g, '-'); }

  function renderActivityTimeline(activityLog) {
    if (!activityLog || !activityLog.length) return '';
    return `
      <div class="req-timeline">
        <p class="lbl">Timeline</p>
        ${activityLog.map((activity, i) => `
          <div class="timeline-item">
            <div class="timeline-dot-col">
              <div class="timeline-dot small"></div>
              ${i !== activityLog.length - 1 ? '<div class="timeline-line"></div>' : ''}
            </div>
            <div class="timeline-content small">
              <p>${escapeHtml(activity.action)}</p>
              <p>${escapeHtml(activity.timestamp)} · ${escapeHtml(activity.user)}</p>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function renderCertRequestCard(selected, request) {
    let actionsHtml;
    if (request.status === 'Pending') {
      actionsHtml = `
        <div class="req-actions-row">
          <button type="button" class="btn btn-moss flex1" data-approve-cert="${escapeHtml(request.id)}">${ICONS.check} Approve</button>
          <button type="button" class="btn btn-maroon-ghost flex1" data-reject-cert="${escapeHtml(request.id)}">${ICONS.xCircle} Reject</button>
        </div>`;
    } else {
      actionsHtml = '';
    }

    return `
      <div class="req-card">
        <div class="req-card-top">
          <span class="req-id">${escapeHtml(request.id)}</span>
          <span class="req-status-badge ${statusBadgeClass(request.status)}">${escapeHtml(request.status)}</span>
        </div>
        <div class="req-fields">
          <div class="req-field-row"><span class="k">Purpose:</span><span class="v">${escapeHtml(request.purpose)}</span></div>
          <div class="req-field-row"><span class="k">Copies:</span><span class="v">${escapeHtml(request.copies)}</span></div>
          <div class="req-field-row"><span class="k">Delivery:</span><span class="v">${escapeHtml(request.deliveryMethod)}</span></div>
          <div class="req-field-row"><span class="k">Submitted:</span><span class="v">${escapeHtml(request.submittedAt)}</span></div>
        </div>
        ${request.managementNotes ? `<div class="mgmt-note"><p>Management Note</p><p>${escapeHtml(request.managementNotes)}</p></div>` : ''}
        ${renderActivityTimeline(request.activityLog)}
        <div class="req-actions">${actionsHtml}</div>
      </div>`;
  }

  function renderMissingRecordCard(selected, request) {
    let actionsHtml;
    if (request.status === 'Pending') {
      actionsHtml = `
        <div class="req-actions-row">
          <button type="button" class="btn btn-moss flex1" data-approve-missing="${escapeHtml(request.id)}">${ICONS.check} Approve</button>
          <button type="button" class="btn btn-maroon-ghost flex1" data-reject-missing="${escapeHtml(request.id)}">${ICONS.xCircle} Reject</button>
        </div>`;
    } else {
      actionsHtml = '';
    }

    const evidenceHtml = (request.evidenceFiles && request.evidenceFiles.length) ? `
      <div class="evidence-list">
        <p class="evidence-label">Attached Evidence</p>
        ${request.evidenceFiles.map((file, i) => `
          <div class="evidence-item">
            <div class="left">
              <div class="icon-box">${file.type === 'image' ? ICONS.eye : ICONS.fileCheck}</div>
              <div class="info">
                <span class="fname">${escapeHtml(file.name)}</span>
                ${file.size ? `<span class="fsize">${escapeHtml(file.size)}</span>` : ''}
              </div>
            </div>
            <div class="actions">
              <button type="button" data-preview-file="${escapeHtml(request.id)}::${i}">${ICONS.eye}</button>
              <button type="button">${ICONS.download}</button>
            </div>
          </div>`).join('')}
      </div>` : '';

    return `
      <div class="req-card">
        <div class="req-card-top">
          <span class="req-id">${escapeHtml(request.id)}</span>
          <span class="req-status-badge ${statusBadgeClass(request.status)}">${escapeHtml(request.status)}</span>
        </div>
        <h4 class="req-title">${escapeHtml(request.title)}</h4>
        <p class="req-desc">${escapeHtml(request.description)}</p>
        <div class="assigned-row">
          ${ICONS.user}
          <span class="txt">Assigned to: <b>${escapeHtml(request.assignedTeacher || 'Unassigned')}</b></span>
          ${request.teacherStatus ? `<span class="teacher-status ${escapeHtml(request.teacherStatus)}">${escapeHtml(request.teacherStatus)}</span>` : ''}
        </div>
        ${request.managementNotes ? `<div class="mgmt-note"><p>Management Note</p><p>${escapeHtml(request.managementNotes)}</p></div>` : ''}
        ${evidenceHtml}
        ${renderActivityTimeline(request.activityLog)}
        <div class="req-actions">${actionsHtml}</div>
      </div>`;
  }

  function renderRequestsModal() {
    const selected = getSelected();
    if (!state.isRequestsPanelOpen || !selected) return '';
    const certReqs = selected.certificateRequests || [];
    const missingReqs = selected.missingRecordRequests || [];
    const empty = !certReqs.length && !missingReqs.length;

    return `
      <div class="modal-overlay" id="requestsModalOverlay">
        <div class="modal-backdrop" id="requestsModalBackdrop"></div>
        <div class="modal-panel">
          <header class="modal-header">
            <h2>Student Requests</h2>
            <button type="button" class="modal-close" id="closeRequestsModalBtn">${ICONS.x}</button>
          </header>
          <div class="modal-body">
            ${certReqs.length ? `
              <section class="req-section">
                <h3>Certificate Requests</h3>
                <div class="req-cards">${certReqs.map((r) => renderCertRequestCard(selected, r)).join('')}</div>
              </section>` : ''}
            ${missingReqs.length ? `
              <section class="req-section">
                <h3>Missing Records</h3>
                <div class="req-cards">${missingReqs.map((r) => renderMissingRecordCard(selected, r)).join('')}</div>
              </section>` : ''}
            ${empty ? `<div class="empty-requests">${ICONS.message}<p>No requests submitted.</p></div>` : ''}
          </div>
        </div>
      </div>`;
  }

  function renderPreviewModal() {
    if (!state.previewFile) return '';
    const file = state.previewFile;
    return `
      <div class="modal-overlay" id="previewModalOverlay">
        <div class="modal-backdrop dark" id="previewModalBackdrop"></div>
        <div class="modal-panel preview">
          <header class="preview-header">
            <div class="left">
              <div class="icon-box">${ICONS.fileCheck}</div>
              <div>
                <h2>${escapeHtml(file.name)}</h2>
                ${file.size ? `<p class="fsize">${escapeHtml(file.size)}</p>` : ''}
              </div>
            </div>
            <div class="actions">
              <button type="button" class="btn btn-white-outline">${ICONS.download} Download</button>
              <button type="button" class="modal-close" id="closePreviewBtn">${ICONS.x}</button>
            </div>
          </header>
          <div class="preview-body">
            ${file.type === 'image' ?
              `<img src="${escapeHtml(file.url)}" alt="${escapeHtml(file.name)}" />` :
              `<div class="preview-placeholder">${ICONS.fileText}<p>PDF Preview</p><p>In a real app, a PDF viewer would render here.</p></div>`}
          </div>
        </div>
      </div>`;
  }

  /* ============================= FOCUS PRESERVATION ============================= */
  function captureFocus() {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const id = el.id || null;
    const dataAttr = el.dataset ? (el.dataset.particular ? `particular:${el.dataset.particular}` : el.dataset.section ? `section:${el.dataset.section}` : el.hasAttribute('data-action-note') ? 'action-note' : null) : null;
    if (!id && !dataAttr) return null;
    return { id, dataAttr, selectionStart: el.selectionStart, selectionEnd: el.selectionEnd };
  }

  function restoreFocus(captured) {
    if (!captured) return;
    let el = null;
    if (captured.id) el = document.getElementById(captured.id);
    else if (captured.dataAttr) {
      if (captured.dataAttr.startsWith('particular:')) el = app.querySelector(`[data-particular="${captured.dataAttr.slice(11)}"]`);
      else if (captured.dataAttr.startsWith('section:')) el = app.querySelector(`[data-section="${captured.dataAttr.slice(8)}"]`);
      else if (captured.dataAttr === 'action-note') el = app.querySelector('[data-action-note]');
    }
    if (el) {
      el.focus();
      if (typeof captured.selectionStart === 'number' && el.setSelectionRange) {
        try { el.setSelectionRange(captured.selectionStart, captured.selectionEnd); } catch (e) {}
      }
    }
  }

  /* ============================= MAIN RENDER ============================= */
  function render() {
    const focusCapture = captureFocus();
    const selected = getSelected();

    const headerHtml = `
      <header class="top-header">
        <div>
          <h1>Character Certificates</h1>
          <p>Review, refine, and issue official character certificates for students who are leaving or graduating.</p>
        </div>
        ${selected ? `<button type="button" class="btn btn-outline no-print" id="printCertBtn">${ICONS.printer} Print certificate</button>` : ''}
      </header>`;

    const noticeHtml = state.notice ? `<div class="notice" aria-live="polite">${ICONS.checkCircle}${escapeHtml(state.notice)}</div>` : '';

    const bodyHtml = selected ? renderDetailView() : renderListView();

    app.innerHTML = `
      ${headerHtml}
      ${noticeHtml}
      ${bodyHtml}
      ${renderRequestsModal()}
      ${renderPreviewModal()}
    `;

    wireEvents();
    setupPagination();
    restoreFocus(focusCapture);
  }

  /* ============================= PAGE LAYOUT ENGINE ============================= */
  const PAGE_INNER_HEIGHT = 915; // 1011px - 48px top - 48px bottom padding
  const SECTION_GAP = 28;       // gap between top-level blocks (from cert-doc-inner gap)
  const ITEM_GAP = 8;           // gap between items inside cert-points

  function autoExpandTextarea(ta) {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.max(96, ta.scrollHeight) + 'px';
  }

  /**
   * Flatten certificate content into atomic blocks for pagination.
   * Each block: { kind, node, sectionIdx?, listType?, height }
   */
  function buildBlocks() {
    const contentRef = document.getElementById('certContentRef');
    if (!contentRef) return [];

    contentRef.querySelectorAll('.cert-textarea').forEach(autoExpandTextarea);

    const blocks = [];
    const header = contentRef.querySelector('.cert-doc-header');
    if (header) blocks.push({ kind: 'header', node: header, height: header.offsetHeight });

    const body = contentRef.querySelector('.cert-doc-body');
    if (body) {
      Array.from(body.children).forEach((sec, sIdx) => {
        if (!sec.classList.contains('cert-section-block')) {
          blocks.push({ kind: 'other', node: sec, height: sec.offsetHeight });
          return;
        }
        const heading = sec.querySelector('.cert-section-heading');
        if (heading) blocks.push({ kind: 'heading', node: heading, sIdx, height: heading.offsetHeight });

        const textarea = sec.querySelector('.cert-textarea');
        if (textarea) {
          blocks.push({ kind: 'textarea', node: textarea, sIdx, height: textarea.offsetHeight });
          return;
        }
        const pointsList = sec.querySelector('.cert-points');
        if (pointsList) {
          Array.from(pointsList.querySelectorAll(':scope > li')).forEach(li => {
            blocks.push({ kind: 'item', node: li, sIdx, listType: 'points', height: li.offsetHeight });
          });
          return;
        }
        const grid = sec.querySelector('.particulars-grid');
        if (grid) {
          Array.from(grid.querySelectorAll(':scope > .fact-row')).forEach(row => {
            blocks.push({ kind: 'item', node: row, sIdx, listType: 'grid', height: row.offsetHeight });
          });
        }
      });
    }

    const footer = contentRef.querySelector('.cert-doc-footer');
    if (footer) blocks.push({ kind: 'footer', node: footer, height: footer.offsetHeight });

    return blocks;
  }

  /**
   * Distribute blocks across pages.
   * Rule: if heading + 3 items can fit on current page, keep what fits, send rest to next page.
   *       if heading + 3 items can NOT fit, bump entire section to next page.
   */
  function paginateContent() {
    const blocks = buildBlocks();
    if (!blocks.length) return [[]];

    const pages = [[]];
    let curH = 0;

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];

      if (b.kind === 'heading') {
        // Look ahead: count items in the same section
        const sectionItems = [];
        for (let j = i + 1; j < blocks.length && blocks[j].sIdx === b.sIdx; j++) {
          sectionItems.push(blocks[j]);
        }

        // Calculate height of heading + 3 items (or fewer if section has less)
        const headingCost = b.height + 16; // heading + spacing before items
        let min3H = headingCost;
        for (let k = 0; k < Math.min(3, sectionItems.length); k++) {
          min3H += sectionItems[k].height + ITEM_GAP;
        }

        // Can heading + 3 items fit on current page?
        if (curH + min3H + SECTION_GAP > PAGE_INNER_HEIGHT && curH > 0) {
          // No → bump to next page
          pages.push([]);
          curH = 0;
        }

        // Place heading
        pages[pages.length - 1].push(b);
        curH += headingCost;
      } else if (b.kind === 'item') {
        const cost = b.height + ITEM_GAP;
        if (curH + cost > PAGE_INNER_HEIGHT && curH > 0) {
          pages.push([]);
          curH = 0;
        }
        pages[pages.length - 1].push(b);
        curH += cost;
      } else if (b.kind === 'textarea') {
        const cost = b.height + ITEM_GAP;
        if (curH + cost > PAGE_INNER_HEIGHT && curH > 0) {
          pages.push([]);
          curH = 0;
        }
        pages[pages.length - 1].push(b);
        curH += cost;
      } else {
        // header, footer, other
        const cost = b.height + SECTION_GAP;
        if (curH + cost > PAGE_INNER_HEIGHT && curH > 0) {
          pages.push([]);
          curH = 0;
        }
        pages[pages.length - 1].push(b);
        curH += cost;
      }
    }

    state.totalPages = pages.length;
    if (state.certificatePage > state.totalPages) state.certificatePage = state.totalPages;
    return pages;
  }

  /**
   * Reconstruct proper DOM for the current page from its blocks.
   */
  function renderCurrentPage() {
    const pages = paginateContent();
    const visiblePage = document.getElementById('certVisiblePage');
    if (!visiblePage) return;

    const pageIdx = state.certificatePage - 1;
    const pageBlocks = pages[pageIdx] || pages[0] || [];

    visiblePage.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'cert-doc-inner';

    let openSection = null;   // current section-block div being built
    let openList = null;      // current <ul class="cert-points"> or <div class="particulars-grid">
    let openSIdx = -1;        // section index of the open section

    function flushSection() {
      if (openSection) { inner.appendChild(openSection); openSection = null; openList = null; openSIdx = -1; }
    }

    for (const b of pageBlocks) {
      if (b.kind === 'header' || b.kind === 'footer' || b.kind === 'other') {
        flushSection();
        inner.appendChild(b.node.cloneNode(true));
      } else if (b.kind === 'heading') {
        flushSection();
        openSection = document.createElement('div');
        openSection.className = 'cert-section-block';
        openSIdx = b.sIdx;
        openSection.appendChild(b.node.cloneNode(true));
      } else if (b.kind === 'item') {
        // If continuing a section from a previous page (no heading on this page)
        if (!openSection || openSIdx !== b.sIdx) {
          flushSection();
          openSection = document.createElement('div');
          openSection.className = 'cert-section-block';
          openSIdx = b.sIdx;
        }
        if (!openList) {
          if (b.listType === 'grid') {
            openList = document.createElement('div');
            openList.className = 'particulars-grid';
          } else {
            openList = document.createElement('ul');
            openList.className = 'cert-points';
          }
          openSection.appendChild(openList);
        }
        openList.appendChild(b.node.cloneNode(true));
      } else if (b.kind === 'textarea') {
        if (!openSection || openSIdx !== b.sIdx) {
          flushSection();
          openSection = document.createElement('div');
          openSection.className = 'cert-section-block';
          openSIdx = b.sIdx;
        }
        openSection.appendChild(b.node.cloneNode(true));
      }
    }
    flushSection();

    // Page number overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-footer-overlay no-print';
    overlay.innerHTML = `<p>Page ${state.certificatePage} of ${state.totalPages}</p>`;

    visiblePage.appendChild(inner);
    visiblePage.appendChild(overlay);

    visiblePage.querySelectorAll('.cert-textarea').forEach(autoExpandTextarea);

    // Pagination controls
    const paginationRow = document.getElementById('certPaginationRow');
    const pageLabel = document.getElementById('certPageLabel');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (paginationRow) {
      if (state.totalPages > 1) {
        paginationRow.style.display = '';
        if (pageLabel) pageLabel.textContent = `Page ${state.certificatePage} of ${state.totalPages}`;
        if (prevBtn) { prevBtn.disabled = state.certificatePage === 1; prevBtn.onclick = () => { state.certificatePage = Math.max(1, state.certificatePage - 1); renderCurrentPage(); wireVisiblePageEvents(); }; }
        if (nextBtn) { nextBtn.disabled = state.certificatePage === state.totalPages; nextBtn.onclick = () => { state.certificatePage = Math.min(state.totalPages, state.certificatePage + 1); renderCurrentPage(); wireVisiblePageEvents(); }; }
      } else {
        paginationRow.style.display = 'none';
      }
    }
  }

  function wireVisiblePageEvents() {
    const visiblePage = document.getElementById('certVisiblePage');
    if (!visiblePage) return;

    visiblePage.querySelectorAll('[data-particular]').forEach((input) => {
      input.oninput = (e) => { updateCertificateInState(input.dataset.particular, e.target.value); };
    });
    visiblePage.querySelectorAll('[data-section]').forEach((textarea) => {
      textarea.oninput = (e) => {
        autoExpandTextarea(e.target);
        updateCertificateInState(textarea.dataset.section, e.target.value);
        const hiddenTextarea = document.querySelector(`#certContentRef [data-section="${textarea.dataset.section}"]`);
        if (hiddenTextarea) {
          hiddenTextarea.value = e.target.value;
          autoExpandTextarea(hiddenTextarea);
        }
      };
    });
  }

  function setupPagination() {
    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
    renderCurrentPage();
    wireVisiblePageEvents();
  }

  /* ============================= EVENT WIRING ============================= */
  function wireEvents() {
    const selected = getSelected();

    // Auto-expand all section textareas
    app.querySelectorAll('.cert-textarea').forEach(autoExpandTextarea);

    // Print
    const printBtn = document.getElementById('printCertBtn');
    if (printBtn) printBtn.onclick = printCertificate;

    // Generic selects
    wireSelects(app, {
      requestFilter: (val) => { state.requestFilter = val; render(); },
      reasonFilter: (val) => { state.reasonFilter = val; render(); }
    });

    if (!selected) {
      // Queue tabs
      app.querySelectorAll('[data-queue]').forEach((btn) => {
        btn.onclick = () => { state.queue = btn.dataset.queue; render(); };
      });
      // Reason filter
      app.querySelectorAll('[data-reason]').forEach((btn) => {
        btn.onclick = () => { state.reasonFilter = btn.dataset.reason; render(); };
      });
      // Search
      const queryInput = document.getElementById('queryInput');
      if (queryInput) {
        queryInput.oninput = (e) => { state.query = e.target.value; render(); };
      }
      // Year collapse toggles
      app.querySelectorAll('[data-toggle-year]').forEach((btn) => {
        btn.onclick = () => {
          const year = btn.dataset.toggleYear;
          state.collapsedIssuedYears = { ...state.collapsedIssuedYears, [year]: !state.collapsedIssuedYears[year] };
          render();
        };
      });
      // Open certificate
      app.querySelectorAll('[data-open-cert]').forEach((btn) => {
        btn.onclick = () => {
          state.selectedId = btn.dataset.openCert;
          state.isEditing = false;
          state.certificatePage = 1;
          state.totalPages = 1;
          render();
        };
      });
    } else {
      // Back to list
      const backBtn = document.getElementById('backToListBtn');
      if (backBtn) backBtn.onclick = () => { state.selectedId = null; state.certificatePage = 1; render(); };

      // Open requests panel
      const openReqBtn = document.getElementById('openRequestsPanelBtn');
      if (openReqBtn) openReqBtn.onclick = () => { state.isRequestsPanelOpen = true; render(); };

      // Toggle editing — flush visible page values first
      const editBtn = document.getElementById('toggleEditBtn');
      if (editBtn) {
        editBtn.onclick = () => {
          const visiblePage = document.getElementById('certVisiblePage');
          if (visiblePage) {
            visiblePage.querySelectorAll('[data-particular]').forEach((input) => {
              updateCertificateInState(input.dataset.particular, input.value);
            });
            visiblePage.querySelectorAll('[data-section]').forEach((textarea) => {
              updateCertificateInState(textarea.dataset.section, textarea.value);
            });
          }
          state.isEditing = !state.isEditing;
          render();
        };
      }

      // Finalize
      const finalizeBtn = document.getElementById('finalizeBtn');
      if (finalizeBtn) finalizeBtn.onclick = finalizeCertificate;
    }

    /* -------- Requests modal -------- */
    const reqOverlay = document.getElementById('requestsModalOverlay');
    if (reqOverlay) {
      const backdrop = document.getElementById('requestsModalBackdrop');
      if (backdrop) backdrop.onclick = () => { state.isRequestsPanelOpen = false; render(); };
      const closeBtn = document.getElementById('closeRequestsModalBtn');
      if (closeBtn) closeBtn.onclick = () => { state.isRequestsPanelOpen = false; render(); };

      // Certificate request actions
      app.querySelectorAll('[data-approve-cert]').forEach((btn) => {
        btn.onclick = () => updateCertificateRequest(selected.id, btn.dataset.approveCert, { status: 'Resolved' });
      });
      app.querySelectorAll('[data-reject-cert]').forEach((btn) => {
        btn.onclick = () => updateCertificateRequest(selected.id, btn.dataset.rejectCert, { status: 'Rejected' });
      });

      // Missing record request actions
      app.querySelectorAll('[data-approve-missing]').forEach((btn) => {
        btn.onclick = () => updateMissingRecordRequest(selected.id, btn.dataset.approveMissing, { status: 'Resolved', managementStatus: 'Approved' });
      });
      app.querySelectorAll('[data-reject-missing]').forEach((btn) => {
        btn.onclick = () => updateMissingRecordRequest(selected.id, btn.dataset.rejectMissing, { status: 'Rejected', managementStatus: 'Rejected' });
      });

      // Evidence preview
      app.querySelectorAll('[data-preview-file]').forEach((btn) => {
        btn.onclick = () => {
          const [reqId, idx] = btn.dataset.previewFile.split('::');
          const req = (selected.missingRecordRequests || []).find((r) => r.id === reqId);
          if (req) { state.previewFile = req.evidenceFiles[Number(idx)]; render(); }
        };
      });
    }

    /* -------- Preview modal -------- */
    const previewOverlay = document.getElementById('previewModalOverlay');
    if (previewOverlay) {
      const backdrop = document.getElementById('previewModalBackdrop');
      if (backdrop) backdrop.onclick = () => { state.previewFile = null; render(); };
      const closeBtn = document.getElementById('closePreviewBtn');
      if (closeBtn) closeBtn.onclick = () => { state.previewFile = null; render(); };
    }
  }

  render();

  window.__certApp = { updateCertificate, updateMissingRecordRequest, updateCertificateRequest, finalizeCertificate, printCertificate };
})();
