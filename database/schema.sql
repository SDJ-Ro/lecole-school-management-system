SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS verification_codes;
DROP TABLE IF EXISTS student_parents;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS user_accounts;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE user_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(191) NOT NULL UNIQUE,
    role ENUM('admin','management','teacher','student','parent') NOT NULL,
    password_hash VARCHAR(255) NULL,
    activation_status ENUM('PENDING','ACTIVE','INACTIVE') NOT NULL DEFAULT 'PENDING',
    activated_at DATETIME NULL,
    first_login_required TINYINT(1) NOT NULL DEFAULT 0,
    failed_login_count INT NOT NULL DEFAULT 0,
    lock_expires_at DATETIME NULL,
    locked_at DATETIME NULL,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_status (activation_status),
    INDEX idx_user_lock (lock_expires_at, locked_at)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NULL,
    identifier VARCHAR(191) NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_account FOREIGN KEY (account_id)
        REFERENCES user_accounts (id) ON DELETE SET NULL,
    INDEX idx_log_action (action),
    INDEX idx_log_created (created_at)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profiles (
    account_id INT PRIMARY KEY,
    first_name VARCHAR(75) NOT NULL,
    last_name VARCHAR(75) NOT NULL,
    full_name VARCHAR(151) AS (CONCAT(first_name, ' ', last_name)) STORED,
    personal_email VARCHAR(191) NULL,                                       -- Emails are sent here, not to the sign-in address
    phone VARCHAR(30) NULL,
    photo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_account FOREIGN KEY (account_id)
        REFERENCES user_accounts (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_parents (
    student_account_id INT NOT NULL,
    parent_account_id INT NOT NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 1,   -- The parent who gets the student's emails
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_account_id, parent_account_id),
    CONSTRAINT fk_sp_student FOREIGN KEY (student_account_id)
        REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_sp_parent FOREIGN KEY (parent_account_id)
        REFERENCES user_accounts (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    purpose ENUM('activate', 'reset') NOT NULL,
    code_hash VARCHAR(255) NOT NULL,             -- Hashed like a password, never stored plain
    attempts_left TINYINT UNSIGNED NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_codes_account FOREIGN KEY (account_id)
        REFERENCES user_accounts (id) ON DELETE CASCADE,
    INDEX idx_code_lookup (account_id, purpose)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
