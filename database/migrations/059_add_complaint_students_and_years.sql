CREATE TABLE complaint_students (
    complaint_id INT NOT NULL,
    student_id   INT NOT NULL,
    PRIMARY KEY (complaint_id, student_id),
    INDEX idx_complaint_students_student (student_id),
    CONSTRAINT fk_complaint_students_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_students_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO complaint_students (complaint_id, student_id) SELECT id, student_id FROM complaints;

-- The parent's foreign key needs an index at every step
ALTER TABLE complaints DROP FOREIGN KEY fk_complaint_student;
ALTER TABLE complaints ADD INDEX idx_complaints_by_parent (parent_id, created_at);
ALTER TABLE complaints DROP INDEX idx_complaints_parent, DROP INDEX fk_complaint_student, DROP COLUMN student_id;

ALTER TABLE complaints ADD COLUMN school_year INT NULL AFTER parent_id;
UPDATE complaints SET school_year = COALESCE(
    (SELECT MAX(t.year) FROM school_terms t WHERE t.term = 1 AND t.starts_on <= DATE(complaints.created_at)),
    (SELECT MIN(y.year) FROM school_years y));
ALTER TABLE complaints MODIFY school_year INT NOT NULL, ADD INDEX idx_complaints_year (school_year);

ALTER TABLE feedback ADD COLUMN school_year INT NULL AFTER student_id;
UPDATE feedback SET school_year = COALESCE(
    (SELECT MAX(t.year) FROM school_terms t WHERE t.term = 1 AND t.starts_on <= DATE(feedback.created_at)),
    (SELECT MIN(y.year) FROM school_years y));
ALTER TABLE feedback MODIFY school_year INT NOT NULL, ADD INDEX idx_feedback_year (school_year);
