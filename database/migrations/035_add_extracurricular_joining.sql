SET NAMES utf8mb4;

ALTER TABLE extracurricular_members
    ADD COLUMN joined_on DATE NULL AFTER position,
    ADD COLUMN declined_by ENUM('parent', 'teacher') NULL AFTER parent_note,
    ADD COLUMN teacher_note VARCHAR(255) NULL AFTER declined_by;

UPDATE extracurricular_members SET joined_on = DATE(updated_at) WHERE status = 'member';
UPDATE extracurricular_members SET declined_by = 'parent' WHERE status = 'declined';

-- When a membership ends, its row moves here, so joining again starts a new row
CREATE TABLE extracurricular_member_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    extracurricular_id INT NOT NULL,
    student_id INT NOT NULL,
    position VARCHAR(50) NULL,
    joined_on DATE NULL,
    left_on DATE NOT NULL,
    left_why ENUM('removed', 'archived', 'left_school') NOT NULL,
    ended_by INT NULL,
    INDEX idx_member_history_student (student_id),
    CONSTRAINT fk_emh_extracurricular FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars (id) ON DELETE CASCADE,
    CONSTRAINT fk_emh_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_emh_ended_by FOREIGN KEY (ended_by) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- A lift only covers the term it was given for
CREATE TABLE academic_watch_lifts (
    student_id INT NOT NULL,
    year SMALLINT NOT NULL,
    term TINYINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    lifted_by INT NULL,
    lifted_at DATETIME NOT NULL,
    PRIMARY KEY (student_id, year, term),
    CONSTRAINT fk_watch_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_watch_lifted_by FOREIGN KEY (lifted_by) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
