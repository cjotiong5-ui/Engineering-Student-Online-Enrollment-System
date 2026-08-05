/* =========================================================
   MOCK DATA
   Shaped to mirror db.sql + CURRICULUM_MODULE_EXTENSION.sql:
   programs, courses (program_id, year_level, semester, units),
   students, enrollments, grades. Frontend-only — no backend.
   ========================================================= */

const MOCK_DB = {
  programs: [
    { id: 1, program_code: 'BSCE', program_name: 'Bachelor of Science in Civil Engineering', specialization: 'Construction Engineering and Management' },
    { id: 2, program_code: 'BSCOME', program_name: 'Bachelor of Science in Computer Engineering', specialization: 'Software Development' },
    { id: 3, program_code: 'BSEE', program_name: 'Bachelor of Science in Electrical Engineering', specialization: null },
    { id: 4, program_code: 'BSECE', program_name: 'Bachelor of Science in Electronics Engineering', specialization: 'Telecommunications' },
    { id: 5, program_code: 'BSME', program_name: 'Bachelor of Science in Mechanical Engineering', specialization: 'HVAC/R' },
  ],

  // Curriculum for the logged-in student's program (BSCOMPE, Year 2)
  courses: [
    { id: 101, course_code: 'CS211', course_description: 'Data Structures and Algorithms', units: 4, lec_units: 3, lab_units: 1, year_level: 2, semester: '1st', course_type: 'regular' },
    { id: 102, course_code: 'MATH21', course_description: 'Differential Equations', units: 3, lec_units: 3, lab_units: 0, year_level: 2, semester: '1st', course_type: 'regular' },
    { id: 103, course_code: 'CS212', course_description: 'Object-Oriented Programming', units: 3, lec_units: 2, lab_units: 1, year_level: 2, semester: '1st', course_type: 'regular' },
    { id: 104, course_code: 'GE111', course_description: 'Ethics and Society', units: 3, lec_units: 3, lab_units: 0, year_level: 2, semester: '1st', course_type: 'regular' },
    { id: 105, course_code: 'CS221', course_description: 'Database Management Systems', units: 3, lec_units: 2, lab_units: 1, year_level: 2, semester: '2nd', course_type: 'regular' },
    { id: 106, course_code: 'CS222', course_description: 'Computer Architecture', units: 3, lec_units: 3, lab_units: 0, year_level: 2, semester: '2nd', course_type: 'regular' },
    { id: 107, course_code: 'MATH22', course_description: 'Numerical Methods', units: 3, lec_units: 3, lab_units: 0, year_level: 2, semester: '2nd', course_type: 'regular' },
    { id: 108, course_code: 'RIZAL', course_description: 'Life and Works of Rizal', units: 3, lec_units: 3, lab_units: 0, year_level: 2, semester: '2nd', course_type: 'regular' },
  ],

  // Grades: subset of courses have completed grades (1st sem), 2nd sem in progress
  grades: [
    { course_id: 101, grade: 91, remark: 'Passed' },
    { course_id: 102, grade: 87, remark: 'Passed' },
    { course_id: 103, grade: 94, remark: 'Passed' },
    { course_id: 104, grade: 89, remark: 'Passed' },
  ],

  // Enrollment status per course this term
  enrollments: {
    101: 'enrolled', 102: 'enrolled', 103: 'enrolled', 104: 'enrolled',
    105: 'enrolled', 106: 'enrolled', 107: 'pending', 108: 'enrolled',
  },

  student: {
    student_number: '00014087',
    first_name: 'Alexa',
    last_name: 'Marquez',
    program_code: 'BSCOME',
    year_level: 2,
    email: 'alexa.marquez@gmail.com',
    age: 19,
    curriculum_effective_sy: '2023-2024',
  },

  // Admin-facing student roster (table UI)
  studentRoster: [
    { student_number: '00014087', name: 'Alexa Marquez', program: 'BSCOME', year: 2, status: 'enrolled', email: 'alexa.marquez@gmail.com' },
    { student_number: '00003312', name: 'Diego Santos', program: 'BSCE', year: 3, status: 'enrolled', email: 'diego.santos@student.edu' },
    { student_number: '00009945', name: 'Mikaela Reyes', program: 'BSEE', year: 4, status: 'pending', email: 'mikaela.reyes@student.edu' },
    { student_number: '00000221', name: 'Josh Dela Cruz', program: 'BSECE', year: 1, status: 'enrolled', email: 'josh.delacruz@student.edu' },
    { student_number: '00007765', name: 'Patricia Uy', program: 'BSME', year: 2, status: 'dropped', email: 'patricia.uy@student.edu' },
    { student_number: '00005543', name: 'Ramon Villanueva', program: 'BSCOME', year: 4, status: 'enrolled', email: 'ramon.v@student.edu' },
    { student_number: '00000998', name: 'Bea Fernandez', program: 'BSCE', year: 1, status: 'pending', email: 'bea.fernandez@student.edu' },
    { student_number: '00012230', name: 'Carlo Mendoza', program: 'BSEE', year: 3, status: 'enrolled', email: 'carlo.mendoza@student.edu' },
  ],

  adminStats: {
    totalStudents: 1284,
    totalCourses: 96,
    activeSections: 142,
    pendingEnrollments: 37,
    programBreakdown: [
      { code: 'BSCE', count: 298 },
      { code: 'BSCOME', count: 341 },
      { code: 'BSEE', count: 215 },
      { code: 'BSECE', count: 260 },
      { code: 'BSME', count: 170 },
    ],
    monthlyEnrollments: [ 62, 88, 74, 120, 96, 140, 110, 132 ],
    monthLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
  },
};

// ---- LocalStorage persistence for student roster & profile ----
const storedProfile = localStorage.getItem('sep_student_profile');
if (storedProfile) {
  try {
    Object.assign(MOCK_DB.student, JSON.parse(storedProfile));
  } catch (e) {
    console.error('Failed to parse stored student profile', e);
  }
}

const storedRoster = localStorage.getItem('sep_student_roster');
if (storedRoster) {
  try {
    const parsed = JSON.parse(storedRoster);
    // Check if stored roster still uses old 7-digit/8-digit without '000' prefix
    const needsMigration = parsed.some((s) => !s.student_number || !s.student_number.startsWith('000'));
    if (needsMigration) {
      localStorage.removeItem('sep_student_roster');
    } else {
      MOCK_DB.studentRoster = parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored student roster', e);
  }
}

// Sync student object with roster (bi-directional)
const mainStudentMatch = MOCK_DB.studentRoster.find((s) => s.student_number === MOCK_DB.student.student_number);
if (mainStudentMatch) {
  const currentFullName = `${MOCK_DB.student.first_name} ${MOCK_DB.student.last_name}`;
  if (MOCK_DB.student.first_name && MOCK_DB.student.last_name) {
    mainStudentMatch.name = currentFullName;
  }
  if (MOCK_DB.student.email) {
    mainStudentMatch.email = MOCK_DB.student.email;
  }
  MOCK_DB.student.status = mainStudentMatch.status;
}

// Helper function to save roster & student profile changes across sessions
window.saveRosterToStorage = function () {
  localStorage.setItem('sep_student_roster', JSON.stringify(MOCK_DB.studentRoster));
  localStorage.setItem('sep_student_profile', JSON.stringify(MOCK_DB.student));
};

// --- Simulated auth "database" (frontend only, no real security) ---
const MOCK_USERS = {
  admin: { email: 'admin@campus.edu', password: 'admin123', role: 'admin', name: 'Admin User' },
  student: { email: 'alexa.marquez@gmail.com', password: 'student123', role: 'student', name: 'Alexa Marquez' },
};
