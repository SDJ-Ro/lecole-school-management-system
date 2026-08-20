-- scope_id is empty when the event is for the whole school
CREATE TABLE event_scopes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    scope_type ENUM('school', 'grade', 'class', 'activity') NOT NULL,
    scope_id INT NULL,
    INDEX idx_scope_lookup (scope_type, scope_id),
    CONSTRAINT fk_scope_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

INSERT INTO event_scopes (event_id, scope_type, scope_id)
SELECT id,
       CASE WHEN class_id IS NOT NULL THEN 'class' WHEN grade_id IS NOT NULL THEN 'grade' ELSE 'school' END,
       COALESCE(class_id, grade_id)
FROM events;

ALTER TABLE events
    DROP FOREIGN KEY fk_event_grade,
    DROP FOREIGN KEY fk_event_class,
    DROP COLUMN grade_id,
    DROP COLUMN class_id;

UPDATE events SET category = 'Academic' WHERE category = 'Exam';
UPDATE events SET category = 'General' WHERE category IN ('Meeting', 'Holiday');

INSERT INTO events (title, details, category, audience, event_date, start_time, end_time, author_id, author_role) VALUES
    ('Chess Club friendly match', 'Library hall. Bring your club badge.', 'Extracurricular', 'student,parent',
        CURDATE() + INTERVAL 4 DAY, '15:30', '17:00', 1, 'admin');
INSERT INTO event_scopes (event_id, scope_type, scope_id) VALUES (LAST_INSERT_ID(), 'activity', 2);
