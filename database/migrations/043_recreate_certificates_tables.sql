SET NAMES utf8mb4;

-- An empty section is built live from the student's records until the certificate is issued
CREATE TABLE certificates (
    student_id INT PRIMARY KEY,
    academic JSON NULL,
    activities JSON NULL,
    conduct JSON NULL,
    edited_at DATETIME NULL,
    status ENUM('draft','issued') NOT NULL DEFAULT 'draft',
    issue_number INT NOT NULL DEFAULT 0,
    issued_by INT NULL,
    issued_at DATETIME NULL,
    reopened_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_certificate_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_certificate_issuer FOREIGN KEY (issued_by) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

INSERT INTO leave_requests (student_id, leaving_on, reason, note, status, asked_by, answered_by, answered_at)
VALUES (10, CURDATE() + INTERVAL 21 DAY, 'Relocation', 'The family is moving to Kandy.', 'approved', 10, 8, NOW());

CREATE TABLE certificate_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    copies TINYINT NOT NULL,
    delivery VARCHAR(60) NOT NULL,
    notes VARCHAR(500) NULL,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    note VARCHAR(255) NULL,                          -- Why it was rejected
    decided_by INT NULL,
    decided_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_certificate_requests (student_id, status),
    CONSTRAINT fk_cert_request_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cert_request_decider FOREIGN KEY (decided_by) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
