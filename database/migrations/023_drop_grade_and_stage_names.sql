ALTER TABLE grades
    DROP INDEX name,
    DROP COLUMN name,
    ADD UNIQUE KEY uq_grade_number (sort_order);

ALTER TABLE stages
    DROP INDEX name,
    DROP COLUMN name;
