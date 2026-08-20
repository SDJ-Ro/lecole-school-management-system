CREATE TABLE permission_requests (
    notice_id INT NOT NULL PRIMARY KEY,
    trip_on   DATE NOT NULL,
    place     VARCHAR(150) NOT NULL,
    cost      VARCHAR(50) NULL,
    reply_by  DATE NOT NULL,
    CONSTRAINT fk_permission_notice FOREIGN KEY (notice_id) REFERENCES notices (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A parent who never answers counts as No
CREATE TABLE permission_answers (
    notice_id   INT NOT NULL,
    student_id  INT NOT NULL,
    answer      ENUM('yes', 'no') NOT NULL,
    answered_by INT NULL,
    answered_at DATETIME NOT NULL,
    PRIMARY KEY (notice_id, student_id),
    CONSTRAINT fk_answer_request FOREIGN KEY (notice_id) REFERENCES permission_requests (notice_id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_student FOREIGN KEY (student_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_parent FOREIGN KEY (answered_by) REFERENCES user_accounts (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
