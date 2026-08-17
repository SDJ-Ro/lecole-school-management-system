/* =========================================================================
   L'ÉCOLE ADMIN — APPROVALS & VERIFICATIONS — SEED & MOCK DATA MODEL
   -------------------------------------------------------------------------
   This file isolates all mock dataset models for Approvals & Verifications.
   When linking a backend database later, fetch('/api/approvals/...') calls
   will easily replace this file without altering any UI or rendering logic.
   ========================================================================= */

window.VERIFY_MOCK_DATA = (function () {
  'use strict';

  const EMPTY_STATE_NOUN = {
    Teachers: 'teacher accounts',
    Extracurriculars: 'extracurricular cards',
    Notices: 'notices'
  };

  const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];

  return {
    EMPTY_STATE_NOUN,
    STATUS_OPTIONS
  };
})();
