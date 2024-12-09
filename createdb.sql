# Create the database
CREATE DATABASE IF NOT EXISTS login;
USE login;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  email VARCHAR(100),
  hashedPassword VARCHAR(255)
);

# Create the app user
CREATE USER IF NOT EXISTS 'hasib'@'localhost' IDENTIFIED BY 'hasib';
GRANT ALL PRIVILEGES ON login.* TO 'hasib'@'localhost';

