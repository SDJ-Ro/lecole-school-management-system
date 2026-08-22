CREATE TABLE notifications (
    id            INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    account_id    INT NOT NULL,
    about_student INT NOT NULL,
    text          VARCHAR(255) NOT NULL,
    link          VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at       DATETIME NULL,
    KEY idx_notifications_reader (account_id, about_student, read_at),
    CONSTRAINT fk_notification_account FOREIGN KEY (account_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_student FOREIGN KEY (about_student) REFERENCES user_accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
