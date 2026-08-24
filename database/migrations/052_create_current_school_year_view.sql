-- This year is the newest year whose Term 1 has started
CREATE OR REPLACE VIEW current_school_year AS
    SELECT COALESCE(
        (SELECT MAX(year) FROM school_terms WHERE term = 1 AND starts_on <= CURDATE()),
        (SELECT MIN(year) FROM school_years)
    ) AS year;

CREATE OR REPLACE VIEW current_class_students AS
    SELECT student_id, class_id FROM class_students WHERE year = (SELECT year FROM current_school_year);
CREATE OR REPLACE VIEW current_class_teachers AS
    SELECT class_id, teacher_id FROM class_teachers WHERE year = (SELECT year FROM current_school_year);
CREATE OR REPLACE VIEW current_subject_teachers AS
    SELECT class_id, subject_id, teacher_id FROM subject_teachers WHERE year = (SELECT year FROM current_school_year);
CREATE OR REPLACE VIEW current_teachers_in_charge AS
    SELECT extracurricular_id, teacher_id FROM teachers_in_charge WHERE year = (SELECT year FROM current_school_year);
