/* =========================================================================
   L'ÉCOLE ADMIN — COMPLAINTS & INQUIRIES — SEED & MOCK DATA MODEL
   -------------------------------------------------------------------------
   This file isolates all mock dataset models for the Complaints tab.
   When linking a backend database later, fetch('/api/complaints/...') calls
   will easily replace this file without altering any UI or rendering logic.
   ========================================================================= */

window.COMPLAINTS_MOCK_DATA = (function () {
  'use strict';

  const COMPLAINTS = [
    {
      id: 'CMP-001',
      subject: 'Air conditioning in Grade 10 classroom',
      category: 'Facilities',
      message: 'The AC in the Grade 10 classroom has not been working properly for the past two days. It is very hot and uncomfortable for the students.',
      status: 'In Progress',
      date: '2023-10-24',
      parentName: 'Sarah Jenkins',
      childClass: '10-A'
    },
    {
      id: 'CMP-002',
      subject: 'Math assignment grading delay',
      category: 'Academic',
      message: 'We are still waiting for the grades on the mid-term math assignment submitted last week.',
      status: 'Resolved',
      date: '2023-10-20',
      parentName: 'Michael Chen',
      childClass: '8-C',
      resolutionNote: 'Grades have been updated in the portal. Apologies for the delay.'
    }
  ];

  const CATEGORY_OPTIONS = [
    { label: 'All Categories', value: 'All' },
    { label: 'Academic', value: 'Academic' },
    { label: 'Facilities', value: 'Facilities' },
    { label: 'Extracurricular', value: 'Extracurricular' },
    { label: 'General', value: 'General' }
  ];

  const STATUS_OPTIONS = [
    { label: 'All Statuses', value: 'All' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' }
  ];

  return {
    COMPLAINTS,
    CATEGORY_OPTIONS,
    STATUS_OPTIONS
  };
})();
