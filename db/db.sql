-- =========================================
-- STUDENT ENROLLMENT SYSTEM DATABASE
-- =========================================

PRAGMA foreign_keys = ON;

-- =========================================
-- USERS (Admin + Student Login)
-- =========================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'student')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- STUDENTS
-- =========================================
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_number TEXT UNIQUE NOT NULL 
    CHECK (
        length(student_number) = 8 
        AND student_number GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    ),
    user_id INTEGER UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birthdate DATE NOT NULL,
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- COURSES
-- =========================================
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code TEXT UNIQUE NOT NULL,
    units INTEGER NOT NULL CHECK(units > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- PREREQUISITES
-- =========================================
CREATE TABLE prerequisites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    prerequisite_id INTEGER NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (prerequisite_id) REFERENCES courses(id),
    UNIQUE(course_id, prerequisite_id)
);

-- =========================================
-- SECTIONS
-- =========================================
CREATE TABLE sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    instructor TEXT NOT NULL,
    schedule TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK(capacity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- =========================================
-- ENROLLMENTS
-- =========================================
CREATE TABLE enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('pending', 'enrolled', 'dropped')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    UNIQUE(student_id, section_id)
);

-- =========================================
-- GRADES
-- =========================================
CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade REAL CHECK(grade >= 0 AND grade <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(student_id, course_id)
);

-- =========================================
-- INDEXES (Performance Optimization)
-- =========================================
CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_code ON courses(course_code);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_section ON enrollments(section_id);

-- =========================================
-- TRIGGER: Auto-update updated_at (users)
-- =========================================
CREATE TRIGGER update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =========================================
-- TRIGGER: Auto-update updated_at (students)
-- =========================================
CREATE TRIGGER update_students_timestamp
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
    UPDATE students SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;