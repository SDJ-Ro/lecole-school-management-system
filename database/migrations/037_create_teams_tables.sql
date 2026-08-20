SET NAMES utf8mb4;

ALTER TABLE extracurriculars DROP COLUMN team_limit;
ALTER TABLE extracurricular_members DROP COLUMN position;
ALTER TABLE extracurricular_member_history DROP COLUMN position;

CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    extracurricular_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age_group VARCHAR(20) NULL,                -- Empty means any age
    cover_url VARCHAR(255) NULL,               -- Empty means the programme's cover
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_team_name (extracurricular_id, name),
    CONSTRAINT fk_team_extracurricular FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team_members (
    team_id INT NOT NULL,
    student_id INT NOT NULL,
    position VARCHAR(50) NULL,                 -- Empty means a normal player
    since DATE NOT NULL,
    PRIMARY KEY (team_id, student_id),
    INDEX idx_team_members_student (student_id),
    CONSTRAINT fk_tm_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_tm_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team_member_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    extracurricular_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,           -- Saved as text because the team may be renamed or deleted later
    student_id INT NOT NULL,
    position VARCHAR(50) NULL,
    from_on DATE NOT NULL,
    to_on DATE NOT NULL,
    INDEX idx_team_history_student (student_id),
    CONSTRAINT fk_tmh_extracurricular FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars (id) ON DELETE CASCADE,
    CONSTRAINT fk_tmh_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
