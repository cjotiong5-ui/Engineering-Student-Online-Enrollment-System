-- =========================================================
-- CURRICULUM MODULE EXTENSION
-- Adds: Programs + full Curriculum (Year/Sem course listing)
-- Compatible with the existing STUDENT ENROLLMENT SYSTEM DB
-- (uses/extends existing `courses` and `prerequisites` tables)
-- =========================================================

PRAGMA foreign_keys = ON;

-- =========================================
-- IMPORTANT FIX: the original `courses` table has
--   course_code TEXT UNIQUE NOT NULL
-- which is GLOBALLY unique. Course codes like GE111, MATH1,
-- RIZAL, BES2, etc. repeat across programs (BSCE, BSEE, BSME,
-- BSECE, BSCOMPE), so that constraint must be dropped and
-- replaced by the per-program unique index below.
-- SQLite can't drop a UNIQUE column constraint directly, so we
-- rebuild the table.
-- =========================================
CREATE TABLE courses_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code TEXT NOT NULL,
    units INTEGER NOT NULL CHECK(units > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO courses_new (id, course_code, units, created_at)
    SELECT id, course_code, units, created_at FROM courses;
DROP TABLE courses;
ALTER TABLE courses_new RENAME TO courses;

-- =========================================
-- PROGRAMS (e.g., BSCE, BSEE, BSME, BSECE, BSComE)
-- =========================================
CREATE TABLE programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_code TEXT UNIQUE NOT NULL,      -- e.g. 'BSCE', 'BSEE', 'BSME', 'BSECE', 'BSCOMPE'
    program_name TEXT NOT NULL,             -- e.g. 'Bachelor of Science in Civil Engineering'
    specialization TEXT,                    -- e.g. 'Construction Engineering and Management', 'HVAC/R', 'Telecommunications', 'Software Development'
    curriculum_effective_sy TEXT,           -- e.g. '2023-2024'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- ALTER: courses table needs program linkage
-- and extra descriptive fields seen on the sheets
-- (course_description, year_level, semester, type)
-- =========================================
ALTER TABLE courses ADD COLUMN program_id INTEGER REFERENCES programs(id);
ALTER TABLE courses ADD COLUMN course_description TEXT;   -- e.g. 'Static of Rigid Bodies'
ALTER TABLE courses ADD COLUMN lec_units INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN lab_units INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN lec_hours INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN lab_hours INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN year_level INTEGER;         -- 1,2,3,4
ALTER TABLE courses ADD COLUMN semester TEXT               -- '1st', '2nd', 'Summer'
    CHECK (semester IN ('1st','2nd','Summer') OR semester IS NULL);
ALTER TABLE courses ADD COLUMN course_type TEXT DEFAULT 'regular'
    CHECK (course_type IN ('regular','ojt','elective','none'));

-- Unique per program (same code could repeat across programs, e.g. MATH1)
CREATE UNIQUE INDEX idx_courses_program_code ON courses(program_id, course_code);

-- =========================================
-- PREREQUISITE TEXT SUPPORT
-- Some prereqs are non-course text like "3rd Year", "4th Yr Standing",
-- "Co-Req: MATH2", "None". Add a raw text field + a co-req flag
-- alongside the existing prerequisites table (course-to-course FK).
-- =========================================
ALTER TABLE prerequisites ADD COLUMN is_corequisite INTEGER DEFAULT 0; -- 1 = co-requisite
ALTER TABLE prerequisites ADD COLUMN note TEXT;                        -- e.g. 'Co-Req: MATH2'

CREATE TABLE prerequisite_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    requisite_text TEXT NOT NULL,   -- e.g. '3rd Year', '4th Yr Standing', 'None'
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- =========================================
-- INDEXES
-- =========================================
CREATE INDEX idx_courses_program ON courses(program_id);
CREATE INDEX idx_courses_year_sem ON courses(year_level, semester);