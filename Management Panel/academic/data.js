/* =========================================================================
   L'ÉCOLE ADMIN — ACADEMIC OVERVIEW — SEED & MOCK DATA MODEL
   -------------------------------------------------------------------------
   This file isolates all mock dataset models for the Academic tab.
   When linking a backend database later, fetch('/api/academic/...') calls
   will easily replace this file without altering any UI or rendering logic.
   ========================================================================= */

window.ACADEMIC_MOCK_DATA = (function () {
  'use strict';

  const initialSubjects = ['Mathematics', 'English', 'Science', 'History', 'Sinhala / Tamil', 'ICT'];

  const initialCurriculumGroups = [
    { range: 'Years 6–9', description: '', subjects: ['English', 'Mathematics', 'Science', 'Humanities', 'Sinhala / Tamil', 'ICT'] },
    { range: 'Years 10–11', description: '', subjects: ['English Language', 'Mathematics', 'Science', 'History', 'Business Studies', 'ICT'] }
  ];

  const initialGrades = [
    { id: 'g6', name: 'Grade 6', classes: ['6-A', '6-B'], subjectScores: { Mathematics: [76, 82], English: [80, 78], Science: [75, 80], History: [72, 76], 'Sinhala / Tamil': [79, 77], ICT: [84, 80] } },
    { id: 'g7', name: 'Grade 7', classes: ['7-A', '7-B'], subjectScores: { Mathematics: [77, 80], English: [79, 82], Science: [76, 79], History: [73, 76], 'Sinhala / Tamil': [78, 80], ICT: [82, 84] } },
    { id: 'g8', name: 'Grade 8', classes: ['8-A', '8-B'], subjectScores: { Mathematics: [79, 76], English: [82, 79], Science: [77, 75], History: [74, 72], 'Sinhala / Tamil': [81, 78], ICT: [85, 82] } },
    { id: 'g9', name: 'Grade 9', classes: ['9-A', '9-B'], subjectScores: { Mathematics: [74, 78], English: [80, 82], Science: [75, 78], History: [71, 74], 'Sinhala / Tamil': [77, 79], ICT: [81, 84] } },
    { id: 'g10', name: 'Grade 10', classes: ['10-A', '10-B'], subjectScores: { Mathematics: [76, 79], English: [81, 83], Science: [77, 80], History: [73, 75], 'Sinhala / Tamil': [78, 81], ICT: [84, 86] } },
    { id: 'g11', name: 'Grade 11', classes: ['11-A', '11-B'], subjectScores: { Mathematics: [78, 75], English: [82, 80], Science: [79, 76], History: [75, 72], 'Sinhala / Tamil': [80, 78], ICT: [86, 83] } }
  ];

  const initialClassTeachers = {
    '6-A': 'James Wilson', '6-B': 'Sarah Peiris', '6-C': 'Nethmi Perera', '6-D': 'Amara Silva',
    '7-A': 'Kavindi Jayasinghe', '7-B': 'Rohan Dias', '7-C': 'Madhavi Fernando',
    '8-A': 'Ishara Perera', '8-B': 'David Peris', '8-C': 'Nimali Wijesekara', '8-D': 'Samira Cooray',
    '9-A': 'Ruwan Silva', '9-B': 'Nadeesha Pinto', '9-C': 'Tharindu Jayasuriya',
    '10-A': 'Chandani Fernando', '10-B': 'Mihiran De Silva', '10-C': 'Sashika Ramanayake', '10-D': 'Rukshan Abeysinghe',
    '11-A': 'Anjali Perera', '11-B': 'Pradeep Ratnayake', '11-C': 'Harsha Wickramasinghe'
  };

  const staffAssignments = [
    { id: 'priya-de-silva', name: 'Priya De Silva', subject: 'Visual Arts', subjectClasses: [], extracurriculars: [] },
    { id: 'anura-wijesinghe', name: 'Anura Wijesinghe', subject: 'Geography', subjectClasses: ['8-A', '9-B'], extracurriculars: [] },
    { id: 'sofia-fernando', name: 'Sofia Fernando', subject: 'Subject allocation pending', subjectClasses: [], extracurriculars: ['Eco Club'] },
    { id: 'james-wilson', name: 'James Wilson', subject: 'Science', subjectClasses: ['6-A', '7-B', '8-C'], extracurriculars: ['Science Society'] },
    { id: 'sarah-peiris', name: 'Sarah Peiris', subject: 'English', subjectClasses: ['6-B', '7-A'], extracurriculars: ['Debate Society'] },
    { id: 'rohan-dias', name: 'Rohan Dias', subject: 'Mathematics', subjectClasses: ['9-A', '10-B', '11-C'], extracurriculars: ['Chess Club'] },
    { id: 'shanthi-silva', name: 'Shanthi Silva', subject: 'Computer Science', subjectClasses: [], extracurriculars: ['Robotics & AI Lab'] },
    { id: 'madhavi-fernando', name: 'Madhavi Fernando', subject: 'English Literature', subjectClasses: ['7-C', '11-A'], extracurriculars: ['L’École Philharmonic'] }
  ];

  const initialClassEnrollments = {
    '6-A': 30, '6-B': 29, '6-C': 31, '6-D': 30,
    '7-A': 44, '7-B': 43, '7-C': 43,
    '8-A': 35, '8-B': 34, '8-C': 36, '8-D': 35,
    '9-A': 50, '9-B': 49, '9-C': 51,
    '10-A': 40, '10-B': 40, '10-C': 40, '10-D': 40,
    '11-A': 52, '11-B': 51, '11-C': 52
  };

  const initialEnrollmentGrades = [
    { id: 'g6', name: 'Grade 6', classNames: ['6-A', '6-B'] },
    { id: 'g7', name: 'Grade 7', classNames: ['7-A', '7-B'] },
    { id: 'g8', name: 'Grade 8', classNames: ['8-A', '8-B'] },
    { id: 'g9', name: 'Grade 9', classNames: ['9-A', '9-B'] },
    { id: 'g10', name: 'Grade 10', classNames: ['10-A', '10-B'] },
    { id: 'g11', name: 'Grade 11', classNames: ['11-A', '11-B'] }
  ];

  const examSessions = [
    { day: 17, title: 'Mathematics examination', grades: 'Grades 6–8', time: '08:30–10:30', room: 'Respective classrooms' },
    { day: 18, title: 'English examination', grades: 'Grades 6–8', time: '08:30–10:30', room: 'Respective classrooms' },
    { day: 19, title: 'Science examination', grades: 'Grades 6–11', time: '08:30–10:30', room: 'Respective classrooms' },
    { day: 20, title: 'History examination', grades: 'Grades 6–11', time: '08:30–10:00', room: 'Respective classrooms' },
    { day: 23, title: 'Sinhala / Tamil examination', grades: 'Grades 6–11', time: '08:30–10:30', room: 'Respective classrooms' },
    { day: 24, title: 'ICT practical assessment', grades: 'Grades 9–11', time: '08:30–11:00', room: 'Computer laboratories' },
    { day: 26, title: 'Make-up examination session', grades: 'Grades 6–11', time: '08:30–10:30', room: 'Library seminar room' }
  ];

  return {
    initialSubjects,
    initialCurriculumGroups,
    initialGrades,
    initialClassTeachers,
    staffAssignments,
    initialClassEnrollments,
    initialEnrollmentGrades,
    examSessions
  };
})();
