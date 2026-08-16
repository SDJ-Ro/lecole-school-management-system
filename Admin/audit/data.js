/* =========================================================================
   L'ÉCOLE ADMIN — AUDIT LOGS — SEED & MOCK DATA MODEL
   -------------------------------------------------------------------------
   This file isolates all mock dataset models for the Audit Logs tab.
   When linking a backend database later, fetch('/api/audit/...') calls
   will easily replace this file without altering any UI or rendering logic.
   ========================================================================= */

window.AUDIT_MOCK_DATA = (function () {
  'use strict';

  const ACTIVITY_TYPES = [
    'All activities',
    'Mark Edit',
    'Notice Posted',
    'Logout',
    'Cert. Authorised',
    'Login',
    'Account Activation'
  ];

  const ACTOR_TYPES = [
    'All actors',
    'Teachers',
    'Management Panel',
    'Admin Office',
    'System'
  ];

  return {
    ACTIVITY_TYPES,
    ACTOR_TYPES
  };
})();
