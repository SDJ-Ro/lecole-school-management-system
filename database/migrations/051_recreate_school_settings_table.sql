-- Only the keys listed in config/settings.php are allowed
-- The value is saved as JSON
CREATE TABLE school_settings (
    setting_key VARCHAR(60) NOT NULL PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_by  INT NULL,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_setting_by FOREIGN KEY (updated_by) REFERENCES user_accounts (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
