-- A rule change counts from the next school year, so old results never change
CREATE TABLE school_rules (
    from_year  SMALLINT NOT NULL,
    rule_key   VARCHAR(60) NOT NULL,
    value      TEXT NOT NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (from_year, rule_key),
    CONSTRAINT fk_rule_by FOREIGN KEY (updated_by) REFERENCES user_accounts (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
