SET NAMES utf8mb4;

ALTER TABLE activity_members DROP FOREIGN KEY fk_am_activity, DROP FOREIGN KEY fk_am_student, DROP FOREIGN KEY fk_am_parent;
ALTER TABLE achievements DROP FOREIGN KEY fk_achievement_activity;
ALTER TABLE notices DROP FOREIGN KEY fk_notice_activity;
ALTER TABLE teachers_in_charge DROP FOREIGN KEY fk_tic_activity;

RENAME TABLE activities TO extracurriculars, activity_members TO extracurricular_members;

ALTER TABLE extracurricular_members
    RENAME COLUMN activity_id TO extracurricular_id,
    RENAME INDEX fk_am_student TO fk_em_student,
    RENAME INDEX fk_am_parent TO fk_em_parent,
    ADD CONSTRAINT fk_em_extracurricular FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_em_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_em_parent FOREIGN KEY (parent_id) REFERENCES user_accounts (id) ON DELETE SET NULL;

ALTER TABLE achievements
    RENAME COLUMN activity_id TO extracurricular_id,
    RENAME INDEX fk_achievement_activity TO fk_achievement_extracurricular,
    ADD CONSTRAINT fk_achievement_extracurricular FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars (id) ON DELETE SET NULL;

ALTER TABLE notices
    RENAME COLUMN activity_id TO extracurricular_id,
    RENAME INDEX fk_notice_activity TO fk_notice_extracurricular,
    ADD CONSTRAINT fk_notice_extracurricular FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars (id) ON DELETE CASCADE;

ALTER TABLE teachers_in_charge
    RENAME COLUMN activity_id TO extracurricular_id,
    RENAME INDEX fk_tic_activity TO fk_tic_extracurricular,
    ADD CONSTRAINT fk_tic_extracurricular FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars (id) ON DELETE CASCADE;

ALTER TABLE event_scopes MODIFY scope_type ENUM('school', 'grade', 'class', 'activity', 'extracurricular') NOT NULL;
UPDATE event_scopes SET scope_type = 'extracurricular' WHERE scope_type = 'activity';
ALTER TABLE event_scopes MODIFY scope_type ENUM('school', 'grade', 'class', 'extracurricular') NOT NULL;

CREATE OR REPLACE VIEW current_teachers_in_charge AS
    SELECT extracurricular_id, teacher_id FROM teachers_in_charge WHERE year = (SELECT MAX(year) FROM school_years);
