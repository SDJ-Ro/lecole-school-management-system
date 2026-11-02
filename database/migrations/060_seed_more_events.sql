SET NAMES utf8mb4;

INSERT INTO events (id, title, details, category, audience, event_date, start_time, end_time, author_id, author_role) VALUES
    (94, 'Annual Sports Day', 'Whole-school sports day on the main grounds. Bring your house colours.', 'General',
        'student,parent,teacher,management', '2026-10-23', '08:00', '15:00', 2, 'management'),
    (95, 'Grade 10 Mathematics unit test', 'Chapters 4–6. Calculators allowed.', 'Academic',
        'student,parent,teacher', '2026-10-27', '09:00', '10:00', 3, 'teacher'),
    (96, 'Chess Club practice', 'Friendly games and openings practice in the library.', 'Extracurricular',
        'student,parent', '2026-10-29', '15:30', '17:00', 1, 'admin'),
    (97, 'Parent-teacher meeting day', 'Meet your child''s class teacher. Book a slot at the office.', 'General',
        'parent,teacher,management', '2026-11-03', '13:00', '17:00', 2, 'management'),
    (98, '10-A history field visit', 'Visit to the national museum. Permission slips by Friday.', 'Academic',
        'student,parent', '2026-11-06', NULL, NULL, 3, 'teacher'),
    (99, 'Founders'' Day assembly', 'Special assembly in the main hall.', 'General',
        'student,parent,teacher,management', '2026-11-12', '08:00', '09:30', 1, 'admin'),
    (100, 'Drama Society rehearsal', 'Rehearsal for the end-of-term play.', 'Extracurricular',
        'student,parent', '2026-11-19', '15:00', '17:00', 1, 'admin');

INSERT INTO event_scopes (event_id, scope_type, scope_id) VALUES
    (94, 'school', NULL),
    (95, 'grade', 5),
    (96, 'extracurricular', 2),
    (97, 'school', NULL),
    (98, 'class', 9),
    (99, 'school', NULL),
    (100, 'extracurricular', 3);
