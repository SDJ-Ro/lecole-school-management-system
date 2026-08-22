ALTER TABLE user_accounts
    DROP INDEX idx_user_lock,
    DROP COLUMN locked_at,
    ADD COLUMN last_failed_at DATETIME NULL AFTER lock_expires_at,
    ADD INDEX idx_user_lock (lock_expires_at);
