-- Once closed_on is set, the account is never closed again, even if an admin switches it back on
ALTER TABLE user_accounts ADD COLUMN closed_on DATE NULL AFTER activation_status;
