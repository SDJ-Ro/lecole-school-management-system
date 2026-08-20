SET NAMES utf8mb4;

CREATE TABLE achievement_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achievement_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    INDEX idx_achievement_photos (achievement_id, sort_order),
    CONSTRAINT fk_photo_achievement FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
