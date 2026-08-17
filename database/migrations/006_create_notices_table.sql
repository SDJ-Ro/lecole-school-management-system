CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    audience SET('student', 'parent', 'teacher', 'management') NOT NULL,
    class_id INT NULL,                       -- Empty means everyone in the audience
    author_id INT NULL,
    author_role VARCHAR(20) NOT NULL,        -- Kept even if the author's account is removed
    attachment_name VARCHAR(255) NULL,
    attachment_file VARCHAR(100) NULL,
    publish_at DATETIME NOT NULL,
    expires_at DATETIME NULL,
    pinned TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notices_feed (publish_at, expires_at, pinned),
    CONSTRAINT fk_notice_class FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
    CONSTRAINT fk_notice_author FOREIGN KEY (author_id) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
