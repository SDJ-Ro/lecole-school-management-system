SET NAMES utf8mb4;

-- Marks for a term can only be typed in once the term has started
CREATE TABLE school_terms (
    year SMALLINT NOT NULL,
    term TINYINT NOT NULL,
    starts_on DATE NOT NULL,
    ends_on DATE NOT NULL,
    PRIMARY KEY (year, term),
    CONSTRAINT fk_term_year FOREIGN KEY (year) REFERENCES school_years (year) ON DELETE RESTRICT,
    CONSTRAINT chk_term_dates CHECK (ends_on > starts_on)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- An empty mark means the student was absent
ALTER TABLE marks
    MODIFY mark TINYINT UNSIGNED NULL,
    ADD CONSTRAINT chk_mark_range CHECK (mark <= 100),
    DROP FOREIGN KEY fk_mark_subject;
ALTER TABLE marks
    ADD CONSTRAINT fk_mark_subject FOREIGN KEY (subject_id) REFERENCES stage_subjects (id) ON DELETE RESTRICT;

-- A subject with marks is retired instead of deleted, so old reports still show it
ALTER TABLE stage_subjects
    ADD COLUMN retired_on DATE NULL AFTER sort_order;

-- Students and parents see a term only after the class teacher publishes it
CREATE TABLE term_publications (
    year SMALLINT NOT NULL,
    class_id INT NOT NULL,
    term TINYINT NOT NULL,
    published_by INT NULL,
    published_at DATETIME NOT NULL,
    PRIMARY KEY (year, class_id, term),
    CONSTRAINT fk_pub_year FOREIGN KEY (year) REFERENCES school_years (year) ON DELETE RESTRICT,
    CONSTRAINT fk_pub_class FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pub_teacher FOREIGN KEY (published_by) REFERENCES user_accounts (id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

INSERT INTO school_terms (year, term, starts_on, ends_on) VALUES
    (YEAR(CURDATE()), 1, CONCAT(YEAR(CURDATE()), '-01-02'), CONCAT(YEAR(CURDATE()), '-04-10')),
    (YEAR(CURDATE()), 2, CONCAT(YEAR(CURDATE()), '-05-02'), CONCAT(YEAR(CURDATE()), '-08-07')),
    (YEAR(CURDATE()), 3, CONCAT(YEAR(CURDATE()), '-09-01'), CONCAT(YEAR(CURDATE()), '-12-04'));
