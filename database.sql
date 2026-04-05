CREATE DATABASE users_db;
USE users_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    typeOfUser VARCHAR(20),
    studentId INT
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20),
    name VARCHAR(100),
    term VARCHAR(50),
    enabled TINYINT(1) DEFAULT 1
);

CREATE TABLE student_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO courses (code, name, term, enabled) VALUES
('SOEN287','Web Programming','Winter 2026',1),
('COMP248','OOP I','Winter 2026',1),
('COMP249','OOP II','Winter 2026',1),
('SOEN341','Software Process','Winter 2026',1),
('ENGR201','Professional Practice','Winter 2026',1);

CREATE TABLE assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    type VARCHAR(50),
    name VARCHAR(100),
    due_date VARCHAR(50),
    description VARCHAR(255),
    grade INT DEFAULT 0,
    completed TINYINT(1) DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE course_weights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    type VARCHAR(50),
    weight INT DEFAULT 25,
    UNIQUE KEY unique_course_type (course_id, type),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE student_grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assessment_id INT NOT NULL,
    grade INT DEFAULT 0,
    completed TINYINT(1) DEFAULT 0,
    UNIQUE KEY unique_student_assessment (student_id, assessment_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);  