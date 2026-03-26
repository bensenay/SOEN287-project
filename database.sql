CREATE DATABASE users_db;
USE users_db;

CREATE TABLE users (
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    typeOfUser VARCHAR(20),
    studentId INT
    id INT AUTO_INCREMENT PRIMARY KEY,
);