/* =========================================================================
   L'ÉCOLE ADMIN — USERS & DIRECTORY — SEED & MOCK DATA MODEL
   -------------------------------------------------------------------------
   This file isolates all mock dataset models for the People / Users tab.
   When linking a backend database later, fetch('/api/users/...') calls
   will easily replace this file without altering any UI or rendering logic.
   ========================================================================= */

window.PEOPLE_MOCK_DATA = (function () {
  'use strict';

  const GRADES = [
    { id: 'g6', name: 'Grade 6', classes: ['6-A', '6-B', '6-C', '6-D'] },
    { id: 'g7', name: 'Grade 7', classes: ['7-A', '7-B', '7-C'] },
    { id: 'g8', name: 'Grade 8', classes: ['8-A', '8-B', '8-C', '8-D'] },
    { id: 'g9', name: 'Grade 9', classes: ['9-A', '9-B', '9-C'] },
    { id: 'g10', name: 'Grade 10', classes: ['10-A', '10-B', '10-C', '10-D'] },
    { id: 'g11', name: 'Grade 11', classes: ['11-A', '11-B', '11-C'] }
  ];

  const CLASS_ACADEMIC_CONTEXT = {
    '6-A': { classTeacher: 'James Wilson' },
    '6-B': { classTeacher: 'Sarah Peiris' },
    '7-B': { classTeacher: 'Class teacher assignment pending' },
    '8-C': { classTeacher: 'Class teacher assignment pending' },
    '9-A': { classTeacher: 'Rohan Dias' }
  };

  const STUDENTS = [
    { firstName: 'Nethmi', lastName: 'Perera', index: 'S2021-091', email: 'n.perera@lecole.com', phone: '+94 77 345 6678', grade: 'Grade 6', className: '6-A', activities: ['Debating', 'Choir'], status: 'Active', avatar: 'bg-sand text-midnight', activityTag: 'bg-sand/40 text-midnight',
      profile: { personal: { preferredName: 'Nethmi', birthCertificateNumber: '2014/COL/00123', dateOfBirth: '18 Mar 2014', gender: 'Female', nationality: 'Sri Lankan', religion: 'Buddhism', ethnicity: 'Sinhalese', mediumOfInstruction: 'English', firstLanguage: 'Sinhala', medicalNotes: 'Slight asthma. Carries inhaler.' },
        residential: { address: '45 Galle Road, Wellawatte, Colombo 06', district: 'Colombo', province: 'Western', educationalZone: 'Colombo Zone 3' },
        recordBook: { previousSchool: { name: 'Colombo Primary College', type: 'Government', district: 'Colombo', completionYear: '2025', studentIndex: 'G6-2025-834', classStream: '6-A', classTeacher: 'Ms. D. Fernando', principal: 'Mrs. K. Jayasuriya', transferReason: 'Completed Primary' },
          marks: [{ subject: 'Sinhala', mark: '86' }, { subject: 'English', mark: '91' }, { subject: 'Mathematics', mark: '94' }, { subject: 'Science', mark: '89' }, { subject: 'History', mark: '84' }, { subject: 'Geography', mark: '82' }, { subject: 'ICT', mark: '95' }, { subject: 'Arts', mark: '90' }],
          classPosition: '3rd out of 38', conductGrade: 'Excellent',
          documents: [{ name: 'Grade 6 annual report card', status: 'Verified' }, { name: 'Leaving certificate', status: 'Verified' }, { name: 'Birth certificate', status: 'Submitted' }] },
        achievements: [{ title: 'Junior Public Speaking — 1st Place', category: 'Cultural', level: 'Inter-school', year: '2025' }, { title: 'Mathematics Merit Award', category: 'Academic', level: 'School', year: '2025' }],
        extracurriculars: [{ firstName: 'Debating', lastName: 'Society', role: 'Junior speaker', status: 'Active' }, { name: 'School Choir', role: 'Soprano', status: 'Active' }] } },

    { firstName: 'Maya', lastName: 'Kapoor', index: 'S2022-092', email: 'm.kapoor@lecole.com', phone: '+94 71 554 0921', grade: 'Grade 7', className: '7-B', activities: ['Robotics'], status: 'Active', avatar: 'bg-skyblue text-midnight', activityTag: 'bg-skyblue/20 text-midnight',
      profile: { personal: { preferredName: 'Maya', birthCertificateNumber: '2013/COL/00818', dateOfBirth: '09 Jul 2013', gender: 'Female', nationality: 'Sri Lankan', religion: 'Hinduism', ethnicity: 'Tamil', mediumOfInstruction: 'English', firstLanguage: 'Tamil' },
        residential: { address: '18 Park Avenue, Rajagiriya, Sri Jayawardenepura', district: 'Colombo', province: 'Western', educationalZone: 'Sri Jayawardenepura' },
        recordBook: { previousSchool: { name: 'Lakeview International School', type: 'International', district: 'Colombo', completionYear: '2025', studentIndex: 'LIS-6-2418', classStream: '6 Blue', classTeacher: 'Ms. R. James', principal: 'Dr. A. Perera', transferReason: 'Relocation' },
          marks: [{ subject: 'Tamil', mark: '88' }, { subject: 'English', mark: '93' }, { subject: 'Mathematics', mark: '90' }, { subject: 'Science', mark: '92' }, { subject: 'History', mark: '85' }, { subject: 'Geography', mark: '87' }, { subject: 'ICT', mark: '96' }, { subject: 'Arts', mark: '83' }],
          classPosition: '2nd out of 32', conductGrade: 'Excellent',
          documents: [{ name: 'Grade 6 annual report card', status: 'Verified' }, { name: 'Leaving certificate', status: 'Verified' }] },
        achievements: [{ title: 'Robotics Olympiad — Innovation Award', category: 'STEM', level: 'National', year: '2025' }],
        extracurriculars: [{ name: 'Robotics & AI Club', role: 'Member', status: 'Active' }] } }
  ];

  const TEACHERS = [
    { firstName: 'James', lastName: 'Wilson', id: 'T-004', subject: 'Science', classes: ['6-A', '7-B', '8-C'], role: 'Class Teacher', classTeacherOf: '6-A', tic: 'Science Society', email: 'j.wilson@lecole.com', phone: '+94 77 123 4567', status: 'Active', tone: 'bg-midnight text-white', nic: '198412345678V', dateOfBirth: '12 May 1984', joinDate: '01 Sep 2018', experience: '8', qualification: 'BSc Science (Hons)', emergencyContact: 'Sarah Wilson · +94 77 111 2233' },
    { firstName: 'Rohan', lastName: 'Dias', id: 'T-021', subject: 'Mathematics', classes: ['9-A', '10-B', '11-C'], role: 'Class Teacher', classTeacherOf: '9-A', tic: 'Chess Club', email: 'r.dias@lecole.com', phone: '+94 71 987 6543', status: 'Deactivated', tone: 'bg-sunshine text-white', nic: '197998765432V', dateOfBirth: '20 Oct 1979', joinDate: '15 Jan 2015', experience: '12', qualification: 'BSc Mathematics', emergencyContact: 'Kamani Dias · +94 71 222 3344' },
    { firstName: 'Sarah', lastName: 'Peiris', id: 'T-056', subject: 'English', classes: ['6-B', '7-A'], role: 'Class Teacher', classTeacherOf: '6-B', tic: 'Debating Society', email: 's.peiris@lecole.com', phone: '+94 70 456 7890', status: 'Active', tone: 'bg-terracotta text-white', nic: '198845678901V', dateOfBirth: '04 Mar 1988', joinDate: '01 Jun 2020', experience: '6', qualification: 'BA English Literature', emergencyContact: 'Dinesh Peiris · +94 70 333 4455' }
  ];

  const PARENTS = [
    { firstName: 'Suresh', lastName: 'Perera', id: 'P-045', children: ['Nethmi Perera — 6-A'], relation: 'Father', email: 's.perera@gmail.com', phone: '+94 77 234 5678', status: 'Active', tone: 'bg-deepsea text-white', guardianStatus: 'Living', identityReference: '197823454567V', occupation: 'Government Officer', employer: 'Ministry of Health', annualIncome: 'Above 1,000,000', secondaryContact: '+94 11 234 5678', emergencyContact: 'Nimali Perera · +94 77 456 7890', homeAddress: '45 Galle Road, Wellawatte, Colombo 06' },
    { firstName: 'Lakshmi', lastName: 'Kapoor', id: 'P-112', children: ['Maya Kapoor — 7-B', 'Arjun Kapoor — 9-A'], relation: 'Mother', email: 'l.kapoor@gmail.com', phone: '+94 71 345 6789', status: 'Active', tone: 'bg-deepsea text-white', guardianStatus: 'Living', identityReference: '198234569812V', occupation: 'Software Architect', employer: 'Ceylon Digital Systems', annualIncome: 'Above 1,000,000', secondaryContact: '+94 11 278 4410', emergencyContact: 'Raj Kapoor · +94 77 812 9044', homeAddress: '18 Park Avenue, Rajagiriya, Sri Jayawardenepura' },
    { firstName: 'Ranil', lastName: 'Silva', id: 'P-078', children: ['Amara Silva — 8-C'], relation: 'Guardian', email: 'r.silva@gmail.com', phone: '+94 70 456 7891', status: 'Deactivated', tone: 'bg-maroon text-white', guardianStatus: 'Living', identityReference: 'Passport N2291842', occupation: 'Small Business Owner', employer: 'Silva Trading', annualIncome: '500,000 - 1,000,000', secondaryContact: '+94 11 254 8812', emergencyContact: 'Kumari Silva · +94 71 778 3345', homeAddress: '82 Temple Road, Kalubowila, Dehiwala' }
  ];

  const MANAGEMENT = [
    { firstName: 'Alex', lastName: 'Thompson', id: 'M-001', jobTitle: 'Enrollment Manager', email: 'alex.thompson@lecole.com', phone: '+94 77 000 0001', status: 'Active', tone: 'bg-deepsea text-white', officeLocation: 'Main Building · Admissions Desk', joiningDate: '15 Jan 2018', personalEmail: 'alex.thompson@gmail.com', personalAddress: '14 Palm Grove, Colombo 07', emergencyContact: 'Emma Thompson · +94 77 000 0091', nic: '198000000001V' },
    { firstName: 'Maria', lastName: 'Rodrigo', id: 'M-002', jobTitle: 'Operations Manager', email: 'maria.rodrigo@lecole.com', phone: '+94 77 000 0002', status: 'Active', tone: 'bg-maroon text-white', officeLocation: 'Main Building · Service Desk', joiningDate: '01 Jun 2020', personalEmail: 'maria.rodrigo@gmail.com', personalAddress: '67 Lake Road, Nugegoda', emergencyContact: 'Nimal Rodrigo · +94 71 000 0092', nic: '198200000002V' },
    { firstName: 'David', lastName: 'Kumar', id: 'M-005', jobTitle: 'Character Certificate Manager', email: 'david.kumar@lecole.com', phone: '+94 77 000 0005', status: 'Active', tone: 'bg-moss text-white', officeLocation: 'Main Building · Records Desk', joiningDate: '10 Sep 2021', personalEmail: 'david.kumar@gmail.com', personalAddress: '9 Temple Lane, Rajagiriya', emergencyContact: 'Anjali Kumar · +94 77 000 0095', nic: '198500000005V' }
  ];

  const INITIAL_CLASS_ENROLLMENTS = {
    '6-A': 30, '6-B': 29, '6-C': 31, '6-D': 30,
    '7-A': 44, '7-B': 43, '7-C': 43,
    '8-A': 35, '8-B': 34, '8-C': 36, '8-D': 35,
    '9-A': 50, '9-B': 49, '9-C': 51,
    '10-A': 40, '10-B': 40, '10-C': 40, '10-D': 40,
    '11-A': 52, '11-B': 51, '11-C': 52
  };

  const TAB_THEMES = {
    Students: { accentClass: 'c-tone-sky', tint: 'rgba(127,199,204,0.15)', ring: 'rgba(127,199,204,0.4)', headerTint: 'rgba(127,199,204,0.2)', headerText: 'rgba(15,65,74,0.7)', rowHover: 'c-row-hover-sky', tone: 'sky' },
    Teachers: { accentClass: 'c-tone-sunshine', tint: 'rgba(234,137,19,0.15)', ring: 'rgba(234,137,19,0.4)', headerTint: 'rgba(234,137,19,0.2)', headerText: 'rgba(15,65,74,0.7)', rowHover: 'c-row-hover-sunshine', tone: 'sunshine' },
    Parents: { accentClass: 'c-tone-terracotta', tint: 'rgba(175,80,49,0.1)', ring: 'rgba(175,80,49,0.4)', headerTint: 'rgba(175,80,49,0.15)', headerText: 'var(--color-terracotta)', rowHover: 'c-row-hover-terracotta', tone: 'terracotta' },
    'Management Panel': { accentClass: 'c-tone-maroon', tint: 'rgba(127,3,3,0.1)', ring: 'rgba(127,3,3,0.4)', headerTint: 'rgba(127,3,3,0.1)', headerText: 'var(--color-maroon)', rowHover: 'c-row-hover-maroon', tone: 'maroon' }
  };

  return {
    GRADES,
    CLASS_ACADEMIC_CONTEXT,
    STUDENTS,
    TEACHERS,
    PARENTS,
    MANAGEMENT,
    INITIAL_CLASS_ENROLLMENTS,
    TAB_THEMES
  };
})();
