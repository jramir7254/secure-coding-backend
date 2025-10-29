-- ========================================
-- SECURE CODING GAME DATABASE SCHEMA
-- Optimized Version
-- ========================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS leaderboard;
DROP TABLE IF EXISTS coding_attempts;
DROP TABLE IF EXISTS multiple_choice_attempts;
DROP TABLE IF EXISTS question_attempts;
DROP TABLE IF EXISTS code_files;
DROP TABLE IF EXISTS question_categories;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS games;

-- ========================================
-- GAMES TABLE
-- ========================================
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    max_teams INT NOT NULL,
    time_limit INT NOT NULL,
    is_active BOOLEAN DEFAULT 0,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    INDEX idx_is_active (is_active)
);

-- ========================================
-- TEAMS TABLE
-- ========================================
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    join_code VARCHAR(10) UNIQUE NOT NULL,
    on_section ENUM('mcq', 'coding', 'exploit') DEFAULT 'mcq',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE (team_name),
    INDEX idx_game_id (game_id)
);

-- ========================================
-- QUESTIONS TABLE
-- ========================================
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('mcq', 'break', 'fix', 'exploit') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    categories SET('compile', 'runtime', 'logic', 'vulnerability') NOT NULL,
    description TEXT,
    explanation TEXT,
    INDEX idx_type (type),
    INDEX idx_difficulty (difficulty)
);



-- ========================================
-- CODE FILES TABLE
-- ========================================
CREATE TABLE code_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    name VARCHAR(20) NOT NULL,
    language VARCHAR(20) NOT NULL,
    value TEXT NOT NULL,
    editable_ranges JSON,
    display_order TINYINT UNSIGNED,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE (question_id, display_order),
    INDEX idx_question_id (question_id)
);

-- ========================================
-- QUESTION ATTEMPTS TABLE
-- ========================================
CREATE TABLE question_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    team_id INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT NULL,
    score INT DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE (question_id, team_id),
    INDEX idx_team_question (team_id, question_id)
);

-- ========================================
-- MULTIPLE CHOICE ATTEMPTS TABLE
-- ========================================
CREATE TABLE multiple_choice_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    selected_answers JSON,
    created_at TIMESTAMP DECIMAL CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES question_attempts(id) ON DELETE CASCADE,
    INDEX idx_attempt_id (attempt_id)
);

-- ========================================
-- CODING ATTEMPTS TABLE
-- ========================================
CREATE TABLE coding_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    submitted_code TEXT,
    created_at TIMESTAMP DECIMAL CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES question_attempts(id) ON DELETE CASCADE,
    INDEX idx_attempt_id (attempt_id)
);

-- ========================================
-- LEADERBOARD TABLE
-- ========================================
CREATE TABLE leaderboard (
    team_id INT NOT NULL,
    total_points INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_total_points (total_points)
);

-- ========================================
-- END OF SCHEMA
-- ========================================



