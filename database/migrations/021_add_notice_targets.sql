-- Only one of class_id, grade_id and activity_id may be set
ALTER TABLE notices
    ADD COLUMN grade_id INT NULL AFTER class_id,
    ADD COLUMN activity_id INT NULL AFTER grade_id,
    ADD CONSTRAINT fk_notice_grade FOREIGN KEY (grade_id) REFERENCES grades (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_notice_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE;
