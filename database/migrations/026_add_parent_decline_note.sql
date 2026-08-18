ALTER TABLE activity_members
    ADD COLUMN parent_note VARCHAR(255) NULL AFTER parent_answered_at;
