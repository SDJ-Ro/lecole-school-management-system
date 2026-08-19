CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('sport', 'club') NOT NULL,
    description VARCHAR(1000) NULL,
    teacher_id INT NULL,
    coach_name VARCHAR(150) NULL,            -- An outside coach, not an account
    schedule VARCHAR(150) NULL,
    venue VARCHAR(150) NULL,
    is_open TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_teacher FOREIGN KEY (teacher_id) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- When a student asks to join, the parent says yes first and then the teacher in charge
-- When the school adds a student, only the parent needs to say yes
CREATE TABLE activity_members (
    activity_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('parent', 'teacher', 'member', 'declined') NOT NULL,
    requested_by ENUM('student', 'school') NOT NULL,
    position VARCHAR(50) NULL,
    parent_id INT NULL,                      -- The parent who answered
    parent_answered_at DATETIME NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (activity_id, student_id),
    CONSTRAINT fk_am_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
    CONSTRAINT fk_am_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_am_parent FOREIGN KEY (parent_id) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
