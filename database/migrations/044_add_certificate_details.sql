SET NAMES utf8mb4;

-- Keeps the student's details as they were on the day it was issued
ALTER TABLE certificates
    ADD COLUMN details JSON NULL AFTER conduct;
