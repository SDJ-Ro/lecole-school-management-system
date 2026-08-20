SET NAMES utf8mb4;

-- Evidence files are private, so they are never stored under public/
ALTER TABLE achievements
    ADD COLUMN issued_by VARCHAR(150) NULL AFTER venue,
    ADD COLUMN evidence_path VARCHAR(64) NULL AFTER photo_alt,       -- A random file name on disk
    ADD COLUMN evidence_name VARCHAR(150) NULL AFTER evidence_path;  -- The name the file was uploaded with

CREATE TABLE missing_record_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    record_type VARCHAR(60) NOT NULL,
    extracurricular_id INT NULL,                     -- If set, the teacher in charge answers
    school_year VARCHAR(40) NOT NULL,                -- Free text, as the student typed it
    title VARCHAR(150) NOT NULL,
    details VARCHAR(1000) NOT NULL,
    evidence_path VARCHAR(64) NOT NULL,
    evidence_name VARCHAR(150) NOT NULL,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    reason VARCHAR(500) NULL,
    achievement_id INT NULL,
    answered_by INT NULL,
    answered_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_missing_records_waiting (status, student_id),
    CONSTRAINT fk_missing_record_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_missing_record_extracurricular FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars (id) ON DELETE SET NULL,
    CONSTRAINT fk_missing_record_achievement FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE SET NULL,
    CONSTRAINT fk_missing_record_answerer FOREIGN KEY (answered_by) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
