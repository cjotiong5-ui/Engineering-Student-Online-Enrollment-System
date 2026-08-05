/* =========================================================
   STUDENT VIEW RENDERING — Profile, Curriculum, Grades
   ========================================================= */

(function () {
  if (!document.body.classList.contains('role-student')) return;

  const { student, courses, grades, enrollments, programs } = MOCK_DB;
  const program = programs.find((p) => p.program_code === student.program_code);
  const gradeMap = Object.fromEntries(grades.map((g) => [g.course_id, g]));

  // ---------------- Profile view ----------------
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
  document.querySelectorAll('[data-profile-initials]').forEach((el) => (el.textContent = initials));
  document.querySelectorAll('[data-profile-name]').forEach((el) => (el.textContent = `${student.first_name} ${student.last_name}`));
  document.querySelectorAll('[data-profile-id]').forEach((el) => (el.textContent = student.student_number));

  const detailGrid = document.getElementById('profileDetailGrid');
  
  // Sync status with studentRoster if available
  const rosterMatch = MOCK_DB.studentRoster.find((s) => s.student_number === student.student_number);
  if (rosterMatch) {
    student.status = rosterMatch.status;
  }

  // Set default extended profile fields if missing
  if (!student.phone) student.phone = '+63 917 889 2041';
  if (!student.address) student.address = 'Abar 1st, San Jose City, Nueva Ecija';
  if (!student.mother_guardian) student.mother_guardian = 'Maria Teresa Marquez';
  if (student.gmail_verified === undefined) student.gmail_verified = true;

  function renderStudentStatus() {
    const status = (student.status || 'enrolled').toLowerCase();
    const subEl = document.getElementById('studentStatusSub');
    const bannerEl = document.getElementById('studentStatusBanner');

    if (subEl) {
      if (status === 'dropped') {
        subEl.textContent = 'Account Status: DROPPED — Please report to the Registrar’s Office immediately.';
      } else if (status === 'pending') {
        subEl.textContent = 'Account Status: PENDING — Enrollment approval is currently in progress.';
      } else {
        subEl.textContent = 'Currently enrolled — check your curriculum tab for full subject load.';
      }
    }

    if (bannerEl) {
      if (status === 'dropped') {
        bannerEl.style.display = 'flex';
        bannerEl.style.background = 'var(--danger-soft)';
        bannerEl.style.border = '1px solid rgba(239,68,68,0.3)';
        bannerEl.style.color = 'var(--danger)';
        bannerEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:24px;height:24px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <div>
            <strong style="font-size:14px;display:block;">ENROLLMENT STATUS ALERT: DROPPED</strong>
            <span style="font-size:12.5px;opacity:0.9;">Your enrollment status has been marked as <b>DROPPED</b> by the Administrator. Please contact or visit the Registrar's Office for resolution.</span>
          </div>
        `;
      } else if (status === 'pending') {
        bannerEl.style.display = 'flex';
        bannerEl.style.background = 'var(--warning-soft)';
        bannerEl.style.border = '1px solid rgba(245,158,11,0.3)';
        bannerEl.style.color = 'var(--warning)';
        bannerEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:24px;height:24px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <strong style="font-size:14px;display:block;">ENROLLMENT STATUS: PENDING APPROVAL</strong>
            <span style="font-size:12.5px;opacity:0.9;">Your enrollment is pending verification by the administration. Check back soon for updates.</span>
          </div>
        `;
      } else {
        bannerEl.style.display = 'none';
      }
    }
  }

  function renderProfileDetails() {
    if (!detailGrid) return;
    const rosterMatch = MOCK_DB.studentRoster.find((s) => s.student_number === student.student_number);
    if (rosterMatch) {
      student.status = rosterMatch.status;
    }

    const fullName = `${student.first_name} ${student.last_name}`;
    const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    document.querySelectorAll('[data-profile-name]').forEach((el) => (el.textContent = fullName));
    document.querySelectorAll('[data-profile-initials]').forEach((el) => (el.textContent = initials));
    document.querySelectorAll('[data-profile-id]').forEach((el) => (el.textContent = student.student_number));

    const currentStatus = (student.status || 'enrolled').toLowerCase();
    const details = [
      { k: 'Mother / Guardian', v: student.mother_guardian },
      { k: 'Gmail Address', v: `${student.email} ${student.gmail_verified ? '<span class="badge enrolled" style="font-size:10px;padding:2px 7px;margin-left:4px;">Verified ✓</span>' : '<span class="badge pending" style="font-size:10px;padding:2px 7px;margin-left:4px;">Unverified</span>'}` },
      { k: 'Phone Number', v: student.phone },
      { k: 'Program', v: `${student.program_code} — ${program?.program_name || ''}` },
      { k: 'Specialization', v: program?.specialization || 'General' },
      { k: 'Year Level & SY', v: `Year ${student.year_level} (Curriculum SY ${student.curriculum_effective_sy})` },
      { k: 'Home Address', v: student.address },
      { k: 'Age', v: `${student.age} years old` },
    ];
    detailGrid.innerHTML = details.map((d) => `
      <div class="detail-item">
        <div class="k">${d.k}</div>
        <div class="v">${d.v}</div>
      </div>
    `).join('');
    renderStudentStatus();
  }
  renderProfileDetails();

  // ---------------- Edit Profile Modal logic ----------------
  const editModal = document.getElementById('editProfileModal');
  const openEditBtn = document.getElementById('openEditProfileBtn');
  const closeEditBtn = document.getElementById('closeEditProfileBtn');
  const cancelEditBtn = document.getElementById('cancelEditProfileBtn');
  const editForm = document.getElementById('editProfileForm');
  const editFullName = document.getElementById('editFullName');
  const editGuardian = document.getElementById('editGuardian');
  const editPhone = document.getElementById('editPhone');
  const editAddress = document.getElementById('editAddress');
  const editGmail = document.getElementById('editGmail');
  const verifyGmailBtn = document.getElementById('verifyGmailBtn');
  const gmailVerifyStatus = document.getElementById('gmailVerifyStatus');

  if (openEditBtn && editModal) {
    openEditBtn.addEventListener('click', () => {
      if (editFullName) editFullName.value = `${student.first_name} ${student.last_name}`;
      if (editGuardian) editGuardian.value = student.mother_guardian || '';
      editPhone.value = student.phone || '';
      editAddress.value = student.address || '';
      editGmail.value = student.email || '';
      gmailVerifyStatus.innerHTML = student.gmail_verified 
        ? '<span style="color:var(--success);font-weight:600;">✓ Gmail address is verified</span>'
        : '<span style="color:var(--warning);font-weight:600;">⚠ Gmail address not verified</span>';
      editModal.style.display = 'flex';
    });
  }

  function closeEditModal() {
    if (editModal) editModal.style.display = 'none';
  }

  if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  if (verifyGmailBtn) {
    verifyGmailBtn.addEventListener('click', () => {
      student.gmail_verified = true;
      gmailVerifyStatus.innerHTML = '<span style="color:var(--success);font-weight:600;">✓ Verification email sent! Marked as verified.</span>';
      if (typeof window.showToast === 'function') {
        window.showToast('Gmail verification link sent to ' + editGmail.value, 'success');
      }
    });
  }

  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (editFullName && editFullName.value.trim()) {
        const parts = editFullName.value.trim().split(' ');
        student.first_name = parts[0] || '';
        student.last_name = parts.slice(1).join(' ') || parts[0];
      }
      if (editGuardian) student.mother_guardian = editGuardian.value.trim();
      student.phone = editPhone.value.trim();
      student.address = editAddress.value.trim();
      student.email = editGmail.value.trim();

      // Update session name and user chip
      const fullName = `${student.first_name} ${student.last_name}`;
      const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

      const rawSession = localStorage.getItem('sep_session');
      if (rawSession) {
        try {
          const session = JSON.parse(rawSession);
          session.name = fullName;
          localStorage.setItem('sep_session', JSON.stringify(session));
        } catch (e) {}
      }

      document.querySelectorAll('[data-user-name]').forEach((el) => (el.textContent = fullName));
      document.querySelectorAll('[data-user-initials]').forEach((el) => (el.textContent = initials));
      document.querySelectorAll('[data-profile-initials]').forEach((el) => (el.textContent = initials));
      document.querySelectorAll('[data-profile-id]').forEach((el) => (el.textContent = student.student_number));

      // Update mock roster item
      const item = MOCK_DB.studentRoster.find((s) => s.student_number === student.student_number);
      if (item) {
        item.name = fullName;
        item.email = student.email;
      }

      if (typeof window.saveRosterToStorage === 'function') {
        window.saveRosterToStorage();
      }

      renderProfileDetails();
      closeEditModal();

      if (typeof window.showToast === 'function') {
        window.showToast('Profile updated successfully!', 'success');
      }
    });
  }

  // ---------------- Overview stat cards ----------------
  const totalUnits = courses.reduce((s, c) => s + c.units, 0);
  const completedUnits = courses.filter((c) => gradeMap[c.id]).reduce((s, c) => s + c.units, 0);
  const enrolledCount = Object.values(enrollments).filter((s) => s === 'enrolled').length;
  const avgGrade = (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1);

  const studentStatGrid = document.getElementById('studentStatGrid');
  if (studentStatGrid) {
    const cards = [
      { label: 'Enrolled Subjects', value: enrolledCount, tint: 'var(--accent-soft)', color: 'var(--accent)', icon: iconBook() },
      { label: 'Units This Term', value: totalUnits, tint: 'var(--success-soft)', color: 'var(--success)', icon: iconLayers() },
      { label: 'Average Grade', value: avgGrade, tint: 'var(--warning-soft)', color: 'var(--warning)', icon: iconStar() },
      { label: 'Program Progress', value: `${Math.round((completedUnits / totalUnits) * 100)}%`, tint: 'var(--accent-soft)', color: 'var(--accent)', icon: iconTrend() },
    ];
    studentStatGrid.innerHTML = cards.map((c) => `
      <div class="stat-card" style="--icon-tint:${c.tint}; --icon-color:${c.color}">
        <div class="stat-card__top">
          <div class="stat-card__icon">${c.icon}</div>
        </div>
        <div class="stat-card__value">${c.value}</div>
        <div class="stat-card__label">${c.label}</div>
      </div>
    `).join('');
  }

  const overallProgressFill = document.getElementById('overallProgressFill');
  const overallProgressLabel = document.getElementById('overallProgressLabel');
  if (overallProgressFill) {
    const pct = Math.round((completedUnits / totalUnits) * 100);
    setTimeout(() => { overallProgressFill.style.width = `${pct}%`; }, 200);
    overallProgressLabel.textContent = `${completedUnits} of ${totalUnits} units completed (${pct}%)`;
  }

  // ---------------- Curriculum view (grouped by semester & sortable) ----------------
  const curriculumWrap = document.getElementById('curriculumWrap');
  const curriculumSortSelect = document.getElementById('curriculumSortSelect');

  function renderCurriculum(sortMode = 'default') {
    if (!curriculumWrap) return;
    let list = [...courses];
    if (sortMode === 'code') {
      list.sort((a, b) => a.course_code.localeCompare(b.course_code));
    } else if (sortMode === 'units') {
      list.sort((a, b) => b.units - a.units);
    }

    const semesters = [...new Set(list.map((c) => c.semester))];
    curriculumWrap.innerHTML = semesters.map((sem) => {
      const semCourses = list.filter((c) => c.semester === sem);
      return `
        <div class="sem-group">
          <div class="sem-group__title">Year ${student.year_level} · ${sem} Semester</div>
          <div class="course-grid">
            ${semCourses.map((c) => {
              const g = gradeMap[c.id];
              const status = enrollments[c.id];
              return `
                <div class="course-card">
                  <div class="course-card__top">
                    <span class="course-card__code">${c.course_code}</span>
                    <span class="course-card__units">${c.units} units</span>
                  </div>
                  <div class="course-card__desc">${c.course_description}</div>
                  <div class="course-card__grade">
                    <span class="badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    ${g ? `<span class="grade-pill pass">${g.grade}</span>` : `<span class="grade-pill progress">In progress</span>`}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
  renderCurriculum();

  if (curriculumSortSelect) {
    curriculumSortSelect.addEventListener('change', (e) => {
      renderCurriculum(e.target.value);
    });
  }

  // ---------------- Prerequisite Path Weighted Graph Modal ----------------
  const openPrereqGraphBtn = document.getElementById('openPrereqGraphBtn');
  const closePrereqGraphModal = document.getElementById('closePrereqGraphModal');
  const closePrereqGraphBtn = document.getElementById('closePrereqGraphBtn');
  const prereqGraphModal = document.getElementById('prereqGraphModal');

  function hidePrereqGraphModal() {
    if (prereqGraphModal) prereqGraphModal.style.display = 'none';
  }
  if (openPrereqGraphBtn && prereqGraphModal) {
    openPrereqGraphBtn.addEventListener('click', () => {
      prereqGraphModal.style.display = 'flex';
    });
  }
  if (closePrereqGraphModal) closePrereqGraphModal.addEventListener('click', hidePrereqGraphModal);
  if (closePrereqGraphBtn) closePrereqGraphBtn.addEventListener('click', hidePrereqGraphModal);

  // ---------------- Submit Enrollment Request Queue ----------------
  const submitEnrollmentQueueBtn = document.getElementById('submitEnrollmentQueueBtn');
  if (submitEnrollmentQueueBtn) {
    submitEnrollmentQueueBtn.addEventListener('click', () => {
      // Create admin notification
      if (!MOCK_DB.notifications) {
        MOCK_DB.notifications = [];
      }
      const studentName = `${student.first_name} ${student.last_name}`;
      const adminNotif = {
        id: Date.now(),
        recipient_role: 'admin',
        title: 'New Enrollment Request',
        message: `Student ${studentName} (${student.student_number}) submitted a new enrollment request queue.`,
        timestamp: Date.now(),
        time: 'Just now',
        unread: true
      };

      MOCK_DB.notifications.unshift(adminNotif);
      if (typeof window.saveNotificationsToStorage === 'function') {
        window.saveNotificationsToStorage();
      }

      if (window.SEP && typeof window.SEP.updateNotifications === 'function') {
        window.SEP.updateNotifications();
      }

      if (typeof window.showToast === 'function') {
        window.showToast('Enrollment request queue submitted successfully to Registrar!', 'success');
      }
    });
  }

  // ---------------- Grades view (table) ----------------
  const gradesBody = document.getElementById('gradesBody');
  if (gradesBody) {
    gradesBody.innerHTML = courses.map((c, idx) => {
      const g = gradeMap[c.id];
      return `
        <tr style="animation-delay:${idx * 0.03}s">
          <td><strong>${c.course_code}</strong></td>
          <td>${c.course_description}</td>
          <td>${c.units}</td>
          <td>${c.semester} Sem</td>
          <td>${g ? g.grade : '—'}</td>
          <td>${g ? `<span class="badge enrolled">Passed</span>` : `<span class="badge pending">Ongoing</span>`}</td>
        </tr>
      `;
    }).join('');
  }

  // Grade distribution donut
  const gradeDonut = document.getElementById('gradeDonut');
  if (gradeDonut) {
    const buckets = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0 };
    grades.forEach((g) => {
      if (g.grade >= 90) buckets['A (90-100)']++;
      else if (g.grade >= 80) buckets['B (80-89)']++;
      else buckets['C (70-79)']++;
    });
    const colors = ['var(--accent)', 'var(--success)', 'var(--warning)'];
    const entries = Object.entries(buckets).filter(([, v]) => v > 0);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    let acc = 0;
    const stops = entries.map(([, v], i) => {
      acc += v;
      return `${colors[i % colors.length]} ${((acc - v) / total * 100).toFixed(1)}% ${(acc / total * 100).toFixed(1)}%`;
    });
    gradeDonut.style.background = `conic-gradient(${stops.join(',')})`;
    const legend = document.getElementById('gradeLegend');
    if (legend) {
      legend.innerHTML = entries.map(([k], i) => `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${colors[i % colors.length]}"></span>
          ${k}
        </div>
      `).join('');
    }
  }

  // ---- Icons ----
  function iconBook() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'; }
  function iconLayers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'; }
  function iconStar() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>'; }
  function iconTrend() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>'; }
  window.renderStudentStatus = renderStudentStatus;
})();
