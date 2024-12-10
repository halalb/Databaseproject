# Create the database
CREATE DATABASE IF NOT EXISTS login;
USE login;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100),
  email VARCHAR(100),
  hashedPassword VARCHAR(255)
);

# Create the app user
CREATE USER IF NOT EXISTS 'hasib'@'localhost' IDENTIFIED BY 'hasib';
GRANT ALL PRIVILEGES ON login.* TO 'hasib'@'localhost';



-- Use login;

-- CREATE TABLE conversion_history (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     from_currency VARCHAR(10) NOT NULL,
--     to_currency VARCHAR(10) NOT NULL,
--     amount DECIMAL(10, 2) NOT NULL,
--     converted_amount DECIMAL(10, 2) NOT NULL,
--     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     formatted_date VARCHAR(10) GENERATED ALWAYS AS (DATE_FORMAT(timestamp, '%d/%m/%Y')) STORED,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );
