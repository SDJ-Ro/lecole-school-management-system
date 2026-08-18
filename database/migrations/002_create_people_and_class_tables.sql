ALTER TABLE profiles
    ADD COLUMN date_of_birth DATE NULL AFTER last_name,
    ADD COLUMN gender ENUM('Female', 'Male', 'Prefer not to say') NULL AFTER date_of_birth,
    ADD COLUMN national_id VARCHAR(30) NULL AFTER gender,
    ADD COLUMN address TEXT NULL AFTER phone,
    ADD COLUMN emergency_name VARCHAR(150) NULL AFTER address,
    ADD COLUMN emergency_phone VARCHAR(30) NULL AFTER emergency_name,
    ADD COLUMN code VARCHAR(30) NULL UNIQUE AFTER account_id;   -- A student signs in with this code

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_class_name (grade_id, name),
    CONSTRAINT fk_classes_grade FOREIGN KEY (grade_id) REFERENCES grades (id) ON DELETE RESTRICT
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_details (
    account_id INT PRIMARY KEY,
    class_id INT NULL,
    birth_certificate VARCHAR(50) NOT NULL UNIQUE,
    admission_date DATE NOT NULL,
    previous_school VARCHAR(150) NULL,
    blood_group VARCHAR(15) NULL,
    medical_notes TEXT NULL,
    CONSTRAINT fk_student_account FOREIGN KEY (account_id) REFERENCES user_accounts (id) ON DELETE CASCADE,
    CONSTRAINT fk_student_class FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE parent_details (
    account_id INT PRIMARY KEY,
    relationship VARCHAR(30) NOT NULL DEFAULT 'Guardian',
    occupation VARCHAR(100) NULL,
    employer VARCHAR(150) NULL,
    CONSTRAINT fk_parent_account FOREIGN KEY (account_id) REFERENCES user_accounts (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE staff_details (
    account_id INT PRIMARY KEY,
    job_title VARCHAR(100) NULL,
    subjects VARCHAR(255) NULL,
    join_date DATE NULL,
    experience_years INT NULL,
    CONSTRAINT fk_staff_account FOREIGN KEY (account_id) REFERENCES user_accounts (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
