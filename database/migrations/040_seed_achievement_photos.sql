SET NAMES utf8mb4;

INSERT INTO achievements (title, category, level, achieved_on, result, medal, event_name, organiser, venue, age_group, team,
                          summary, others, photo_url, extracurricular_id, added_by)
SELECT 'Under 15 Zonal Champions', x.name, 'Zonal', CONCAT(YEAR(CURDATE()), '-07-19'), 'Champions', 'Gold Medal',
       'Zonal Schools Football Tournament', 'Zonal Education Office', 'Main Football Pitch', 'Under 15', 'Under 15 Squad',
       'Unbeaten through the group stage, the Under 15 Squad won the final 2–0 to take the zonal title for the first time.',
       'Kavindu Perera, Sanjula Silva', '/assets/images/achievements/football.jpg', x.id, 3
FROM extracurriculars x WHERE x.id = 1;

INSERT INTO achievement_students (achievement_id, student_id) VALUES (LAST_INSERT_ID(), 10);

INSERT INTO achievement_photos (achievement_id, url, sort_order)
SELECT id, '/assets/images/achievements/football-penalty-kick.jpg', 0 FROM achievements WHERE title = 'Under 15 Zonal Champions';
