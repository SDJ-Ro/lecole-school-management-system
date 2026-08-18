SET NAMES utf8mb4;

-- A student's request waits for the parent, but a parent's request is approved at once
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    leaving_on DATE NOT NULL,
    reason VARCHAR(30) NOT NULL,
    note VARCHAR(500) NULL,
    status ENUM('parent','approved','declined','cancelled') NOT NULL DEFAULT 'parent',
    asked_by INT NOT NULL,
    answered_by INT NULL,
    parent_note VARCHAR(255) NULL,
    answered_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_leave_requests_student (student_id, status),
    CONSTRAINT fk_leave_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_asker FOREIGN KEY (asked_by) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_answerer FOREIGN KEY (answered_by) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
