-- Create database if not exists
CREATE DATABASE IF NOT EXISTS attendance_db;
USE attendance_db;

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    semester INT,
    batch VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Student images table for storing multiple images per student
CREATE TABLE IF NOT EXISTS student_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    image_path VARCHAR(255) NOT NULL,
    encoding_data TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Classes/Sessions table
CREATE TABLE IF NOT EXISTS class_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    instructor VARCHAR(100),
    classroom VARCHAR(50),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    session_id INT,
    entry_time DATETIME,
    exit_time DATETIME,
    status ENUM('present', 'absent', 'late', 'partial') DEFAULT 'absent',
    total_time_present INT DEFAULT 0, -- in minutes
    percentage_present DECIMAL(5,2) DEFAULT 0.00,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, session_id)
);

-- Student movement tracking (entry/exit during class)
CREATE TABLE IF NOT EXISTS movement_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    session_id INT,
    movement_type ENUM('entry', 'exit') NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE
);

-- Monthly attendance summary
CREATE TABLE IF NOT EXISTS monthly_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    month INT NOT NULL,
    year INT NOT NULL,
    total_classes INT DEFAULT 0,
    classes_attended INT DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_monthly (student_id, month, year)
);

-- Semester attendance summary
CREATE TABLE IF NOT EXISTS semester_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    semester INT NOT NULL,
    academic_year VARCHAR(20),
    total_classes INT DEFAULT 0,
    classes_attended INT DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    low_attendance_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_semester (student_id, semester, academic_year)
);

-- Low attendance alerts
CREATE TABLE IF NOT EXISTS attendance_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    alert_type ENUM('warning', 'critical') NOT NULL,
    attendance_percentage DECIMAL(5,2),
    period_type ENUM('monthly', 'semester') NOT NULL,
    period_value VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_session ON attendance_records(session_id);
CREATE INDEX idx_movement_student ON movement_logs(student_id);
CREATE INDEX idx_movement_session ON movement_logs(session_id);
CREATE INDEX idx_monthly_student ON monthly_attendance(student_id);
CREATE INDEX idx_semester_student ON semester_attendance(student_id);