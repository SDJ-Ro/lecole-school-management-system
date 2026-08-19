SET NAMES utf8mb4;

ALTER TABLE extracurriculars
    ADD COLUMN category VARCHAR(50) NULL AFTER type,
    ADD COLUMN cover_url VARCHAR(255) NULL AFTER description,                 -- Empty means the default cover
    ADD COLUMN coach_specialty VARCHAR(150) NULL AFTER coach_name,
    ADD COLUMN coach_email VARCHAR(191) NULL AFTER coach_specialty,
    ADD COLUMN coach_phone VARCHAR(30) NULL AFTER coach_email,
    ADD COLUMN age_group_limit SMALLINT UNSIGNED NULL AFTER venue,            -- Empty means the default in rules.php
    ADD COLUMN team_limit TINYINT UNSIGNED NULL AFTER age_group_limit,        -- Empty means no limit
    ADD COLUMN uses_age_groups TINYINT(1) NOT NULL DEFAULT 1 AFTER team_limit,
    ADD COLUMN open_to ENUM('everyone', 'boys', 'girls') NOT NULL DEFAULT 'everyone' AFTER uses_age_groups,
    ADD COLUMN lowest_grade TINYINT UNSIGNED NULL AFTER open_to,              -- Empty means any grade
    ADD COLUMN archived_at DATETIME NULL AFTER reviewed_at,                   -- Hidden from lists, but its history is kept
    ADD COLUMN archived_by INT NULL AFTER archived_at,
    ADD CONSTRAINT fk_extracurricular_archived_by FOREIGN KEY (archived_by) REFERENCES user_accounts (id) ON DELETE SET NULL;
