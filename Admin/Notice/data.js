/* =========================================================================
   L'ÉCOLE ADMIN — NOTICE BOARD — SEED & MOCK DATA MODEL
   -------------------------------------------------------------------------
   This file isolates all mock dataset models for the Notice Board tab.
   When linking a backend database later, fetch('/api/notices/...') calls
   will easily replace this file without altering any UI or rendering logic.
   ========================================================================= */

window.NOTICE_MOCK_DATA = (function () {
  'use strict';

  const AUDIENCE_OPTIONS = ['All', 'Students', 'Parents', 'Teachers', 'Management'];
  const CATEGORY_OPTIONS = ['Academic', 'Extracurricular', 'General', 'Administrative'];

  const initialNotices = [
    {
      id: 1,
      title: 'Term 2 Examination Schedule — June 2026',
      category: 'Academic',
      audience: ['All'],
      body: 'Term 2 examinations run from 17–26 June 2026. Students should follow their grade and class section timetable for subject sessions, rooms, and reporting times. The make-up examination session is scheduled for 26 June for approved absences.',
      author: 'Academic Office',
      date: 'Jun 10, 2026',
      pinned: true
    },
    {
      id: 2,
      title: 'Sports Day Rehearsal Schedule',
      category: 'Extracurricular',
      audience: ['Students'],
      body: 'Final rehearsal for the annual sports meet will take place on the main grounds this Friday at 14:00. Attendance is mandatory for all participating athletes.',
      author: 'Student Life Office',
      date: 'Jun 14, 2026',
      pinned: false
    },
    {
      id: 3,
      title: 'Library Renovation Notice',
      category: 'General',
      audience: ['All'],
      body: 'The main library will be closed for renovations starting next Monday. A temporary reading room has been set up in Hall B.',
      author: 'Admin Office',
      date: 'Oct 20, 2024',
      pinned: false
    },
    {
      id: 4,
      title: 'Parent-Teacher Meeting: Grade 10',
      category: 'Academic',
      audience: ['Parents'],
      body: 'The termly parent-teacher meeting for Grade 10 will be held virtually this Saturday. Booking links have been sent to registered email addresses.',
      author: 'Mrs. Perera',
      date: 'Oct 18, 2024',
      pinned: false
    }
  ];

  return {
    AUDIENCE_OPTIONS,
    CATEGORY_OPTIONS,
    initialNotices
  };
})();
