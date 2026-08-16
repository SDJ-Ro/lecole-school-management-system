/* =========================================================================
   L'ÉCOLE ADMIN DASHBOARD — SEED & MOCK DATA MODEL
   -------------------------------------------------------------------------
   This file isolates all mock dataset models for the Dashboard tab.
   When linking a backend database later, fetch('/api/dashboard/...') calls
   will easily replace this file without altering any UI or rendering logic.
   ========================================================================= */

window.DASHBOARD_MOCK_DATA = (function () {
  'use strict';

  const examinationCalendarDetails = {
    17: { time: '08:30–10:30', title: 'Mathematics examination', details: 'Grades 6–8 · Respective classrooms' },
    18: { time: '08:30–10:30', title: 'English examination', details: 'Grades 6–8 · Respective classrooms' },
    19: { time: '08:30–10:30', title: 'Science examination', details: 'Grades 6–11 · Respective classrooms' },
    20: { time: '08:30–10:00', title: 'History examination', details: 'Grades 6–11 · Respective classrooms' },
    23: { time: '08:30–10:30', title: 'Sinhala / Tamil examination', details: 'Grades 6–11 · Respective classrooms' },
    24: { time: '08:30–11:00', title: 'ICT practical assessment', details: 'Grades 9–13 · Computer laboratories' },
    25: { time: '08:30–11:30', title: 'Senior stream papers', details: 'Grades 12–13 · Senior examination hall' },
    26: { time: '08:30–10:30', title: 'Make-up examination session', details: 'Grades 6–13 · Library seminar room' }
  };

  return {
    examinationCalendarDetails
  };
})();
