-- One row per started year, so the year end never runs twice
CREATE TABLE year_ends (
    year       SMALLINT NOT NULL PRIMARY KEY,
    promoted   INT NOT NULL DEFAULT 0,
    held_back  INT NOT NULL DEFAULT 0,
    graduated  INT NOT NULL DEFAULT 0,
    ran_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_year_end_year FOREIGN KEY (year) REFERENCES school_years (year) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO year_ends (year) SELECT year FROM school_years;

ALTER TABLE school_years ADD COLUMN dates_from_usual TINYINT(1) NOT NULL DEFAULT 0;
