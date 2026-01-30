-- Create logs database for logger
CREATE DATABASE IF NOT EXISTS `logs` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE logs;

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    meta TEXT,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- alerts database is created via MYSQL_DATABASE env var
