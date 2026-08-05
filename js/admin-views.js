/* =========================================================
   ADMIN VIEW RENDERING — Overview, Student Mgmt, Analytics
   ========================================================= */

(function () {
  if (!document.body.classList.contains('role-admin')) return;

  const { adminStats, studentRoster } = MOCK_DB;

  // ---------------- Overview cards ----------------
  const overviewGrid = document.getElementById('adminStatGrid');
  if (overviewGrid) {
    const cards = [
      { label: 'Total Students', value: adminStats.totalStudents.toLocaleString(), trend: '+4.2%', up: true, tint: 'var(--accent-soft)', color: 'var(--accent)', icon: iconUsers() },
      { label: 'Active Courses', value: adminStats.totalCourses, trend: '+2', up: true, tint: 'var(--success-soft)', color: 'var(--success)', icon: iconBook() },
      { label: 'Open Sections', value: adminStats.activeSections, trend: '+11', up: true, tint: 'var(--warning-soft)', color: 'var(--warning)', icon: iconLayers() },
      { label: 'Pending Enrollments', value: adminStats.pendingEnrollments, trend: '-6', up: false, tint: 'var(--danger-soft)', color: 'var(--danger)', icon: iconClock() },
    ];
    overviewGrid.innerHTML = cards.map((c) => `
      <div class="stat-card" style="--icon-tint:${c.tint}; --icon-color:${c.color}">
        <div class="stat-card__top">
          <div class="stat-card__icon">${c.icon}</div>
          <div class="stat-card__trend ${c.up ? 'up' : 'down'}">${c.up ? '▲' : '▼'} ${c.trend}</div>
        </div>
        <div class="stat-card__value">${c.value}</div>
        <div class="stat-card__label">${c.label}</div>
      </div>
    `).join('');
  }

  // ---------------- Newest Records preview (overview) ----------------
  function renderNewestRecords() {
    const previewBody = document.querySelector('#rosterPreviewWrap tbody');
    if (previewBody && studentRoster) {
      const top3 = studentRoster.slice(0, 3);
      previewBody.innerHTML = top3.map((s) => {
        const initials = s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
        return `
          <tr>
            <td>
              <div class="cell-user">
                <div class="avatar-sm">${initials}</div>
                <div class="meta">
                  <div class="full-name">${s.name}</div>
                  <div class="sub">${s.email}</div>
                </div>
              </div>
            </td>
            <td>${s.student_number}</td>
            <td>${s.program}</td>
            <td><span class="badge ${s.status}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
          </tr>
        `;
      }).join('');
    }
  }
  renderNewestRecords();

  // ---------------- Student roster table ----------------
  const tableBody = document.getElementById('rosterBody');
  const searchInput = document.getElementById('rosterSearch');
  const programFilter = document.getElementById('rosterProgramFilter');
  const emptyState = document.getElementById('rosterEmpty');
  const tableWrap = document.getElementById('rosterTableWrap');

  function renderRoster(list) {
    if (!tableBody) return;
    if (list.length === 0) {
      tableWrap.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    tableWrap.style.display = 'block';
    emptyState.style.display = 'none';

    tableBody.innerHTML = list.map((s, idx) => {
      const initials = s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
      return `
        <tr style="animation-delay:${idx * 0.03}s" data-student-number="${s.student_number}">
          <td>
            <div class="cell-user">
              <div class="avatar-sm">${initials}</div>
              <div class="meta">
                <div class="full-name">${s.name}</div>
                <div class="sub">${s.email}</div>
              </div>
            </div>
          </td>
          <td>${s.student_number}</td>
          <td>${s.program}</td>
          <td>Year ${s.year}</td>
          <td>
            <select class="status-select-badge ${s.status}" data-status-select data-student-id="${s.student_number}">
              <option value="enrolled" ${s.status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
              <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="dropped" ${s.status === 'dropped' ? 'selected' : ''}>Dropped</option>
            </select>
          </td>
          <td>
            <div class="row-actions">
              <button title="View" aria-label="View student" data-action="view" data-student-id="${s.student_number}">${iconEye()}</button>
              <button title="Edit" aria-label="Edit student" data-action="edit" data-student-id="${s.student_number}">${iconEdit()}</button>
              <button title="Remove" aria-label="Remove student" data-action="delete" data-student-id="${s.student_number}">${iconTrash()}</button>
            </div>
          </td>
        </tr>`;
    }).join('');

    // Attach row action event listeners (View, Edit, Delete)
    tableBody.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const actionBtn = e.currentTarget;
        const action = actionBtn.dataset.action;
        const studentId = actionBtn.dataset.studentId;
        const studentItem = studentRoster.find((s) => s.student_number === studentId);

        if (!studentItem) return;

        if (action === 'view') {
          const viewModal = document.getElementById('adminViewStudentModal');
          const viewBody = document.getElementById('adminViewStudentBody');
          if (viewModal && viewBody) {
            viewBody.innerHTML = `
              <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px;">
                <div class="avatar-lg" style="width:50px;height:50px;font-size:18px;">${studentItem.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <div>
                  <h4 style="font-size:16px;font-weight:700;">${studentItem.name}</h4>
                  <div style="font-size:12px;color:var(--ink-soft);">${studentItem.email}</div>
                </div>
              </div>
              <div class="detail-grid">
                <div class="detail-item"><div class="k">Student ID</div><div class="v">${studentItem.student_number}</div></div>
                <div class="detail-item"><div class="k">Program</div><div class="v">${studentItem.program}</div></div>
                <div class="detail-item"><div class="k">Year Level</div><div class="v">Year ${studentItem.year}</div></div>
                <div class="detail-item"><div class="k">Status</div><div class="v"><span class="badge ${studentItem.status}">${studentItem.status.toUpperCase()}</span></div></div>
              </div>
            `;
            viewModal.style.display = 'flex';
          }
        } else if (action === 'edit') {
          const editModal = document.getElementById('adminEditStudentModal');
          if (editModal) {
            document.getElementById('adminEditId').value = studentItem.student_number;
            document.getElementById('adminEditName').value = studentItem.name;
            document.getElementById('adminEditEmail').value = studentItem.email;
            document.getElementById('adminEditProgram').value = studentItem.program;
            document.getElementById('adminEditYear').value = studentItem.year;
            editModal.style.display = 'flex';
          }
        } else if (action === 'delete') {
          if (confirm(`Are you sure you want to remove student "${studentItem.name}" (${studentItem.student_number})?`)) {
            const index = studentRoster.findIndex((s) => s.student_number === studentId);
            if (index !== -1) {
              studentRoster.splice(index, 1);
              applyFilters();
              if (typeof window.showToast === 'function') {
                window.showToast(`Student ${studentItem.name} removed successfully`, 'success');
              }
            }
          }
        }
      });
    });

    // Attach status change event listeners
    tableBody.querySelectorAll('[data-status-select]').forEach((select) => {
      select.addEventListener('change', (e) => {
        const newStatus = e.target.value;
        const studentId = e.target.dataset.studentId;
        const studentItem = studentRoster.find((s) => s.student_number === studentId);

        if (studentItem) {
          const oldStatus = studentItem.status;
          studentItem.status = newStatus;
          e.target.className = `status-select-badge ${newStatus}`;

          // Save roster status change to localStorage for persistence across reloads/logins
          if (typeof window.saveRosterToStorage === 'function') {
            window.saveRosterToStorage();
          }
          renderNewestRecords();

          // Update student status in main student profile if matching logged-in student
          if (MOCK_DB.student.student_number === studentId) {
            MOCK_DB.student.status = newStatus;
            if (typeof window.renderStudentStatus === 'function') {
              window.renderStudentStatus();
            }
          }

          // Create notification for student
          if (!MOCK_DB.notifications) {
            MOCK_DB.notifications = [];
          }

          const notification = {
            id: Date.now(),
            student_number: studentId,
            title: 'Enrollment Status Updated',
            message: `Your status has been changed from "${oldStatus.toUpperCase()}" to "${newStatus.toUpperCase()}" by Admin.`,
            timestamp: Date.now(),
            time: 'Just now',
            unread: true
          };

          MOCK_DB.notifications.unshift(notification);
          saveNotificationsToStorage();

          if (window.SEP && typeof window.SEP.updateNotifications === 'function') {
            window.SEP.updateNotifications();
          }

          if (typeof window.showToast === 'function') {
            window.showToast(`Status for ${studentItem.name} updated to ${newStatus.toUpperCase()}`, 'success');
          } else {
            alert(`Status updated to ${newStatus.toUpperCase()}! Notification sent.`);
          }
        }
      });
    });
  }

  function saveNotificationsToStorage() {
    localStorage.setItem('sep_notifications', JSON.stringify(MOCK_DB.notifications));
  }

  function applyFilters() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const prog = programFilter?.value || 'all';
    const filtered = studentRoster.filter((s) => {
      const matchesQ = !q || s.name.toLowerCase().includes(q) || s.student_number.includes(q) || s.email.toLowerCase().includes(q);
      const matchesProg = prog === 'all' || s.program === prog;
      return matchesQ && matchesProg;
    });
    renderRoster(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (programFilter) programFilter.addEventListener('change', applyFilters);
  renderRoster(studentRoster);

  // ---------------- Admin Modals Logic (View / Edit Student) ----------------
  const closeAdminViewModal = document.getElementById('closeAdminViewModal');
  const closeAdminViewBtn = document.getElementById('closeAdminViewBtn');
  const adminViewStudentModal = document.getElementById('adminViewStudentModal');

  function hideAdminViewModal() {
    if (adminViewStudentModal) adminViewStudentModal.style.display = 'none';
  }
  if (closeAdminViewModal) closeAdminViewModal.addEventListener('click', hideAdminViewModal);
  if (closeAdminViewBtn) closeAdminViewBtn.addEventListener('click', hideAdminViewModal);

  const closeAdminEditModal = document.getElementById('closeAdminEditModal');
  const cancelAdminEditBtn = document.getElementById('cancelAdminEditBtn');
  const adminEditStudentModal = document.getElementById('adminEditStudentModal');
  const adminEditStudentForm = document.getElementById('adminEditStudentForm');

  function hideAdminEditModal() {
    if (adminEditStudentModal) adminEditStudentModal.style.display = 'none';
  }
  if (closeAdminEditModal) closeAdminEditModal.addEventListener('click', hideAdminEditModal);
  if (cancelAdminEditBtn) cancelAdminEditBtn.addEventListener('click', hideAdminEditModal);

  if (adminEditStudentForm) {
    adminEditStudentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('adminEditId').value;
      const studentItem = studentRoster.find((s) => s.student_number === id);
      if (studentItem) {
        studentItem.name = document.getElementById('adminEditName').value.trim();
        studentItem.email = document.getElementById('adminEditEmail').value.trim();
        studentItem.program = document.getElementById('adminEditProgram').value;
        studentItem.year = parseInt(document.getElementById('adminEditYear').value, 10) || studentItem.year;

        applyFilters();
        hideAdminEditModal();
        if (typeof window.saveRosterToStorage === 'function') {
          window.saveRosterToStorage();
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`Updated student record for ${studentItem.name}`, 'success');
        }
      }
    });
  }

  // ---------------- Add Student Modal Logic & Undo History Stack ----------------
  const lastActionHistory = [];
  const addStudentBtn = document.getElementById('addStudentBtn');
  const adminAddStudentModal = document.getElementById('adminAddStudentModal');
  const closeAdminAddModal = document.getElementById('closeAdminAddModal');
  const cancelAdminAddBtn = document.getElementById('cancelAdminAddBtn');
  const adminAddStudentForm = document.getElementById('adminAddStudentForm');

  function hideAdminAddModal() {
    if (adminAddStudentModal) adminAddStudentModal.style.display = 'none';
  }

  if (addStudentBtn && adminAddStudentModal) {
    addStudentBtn.addEventListener('click', () => {
      adminAddStudentForm.reset();
      adminAddStudentModal.style.display = 'flex';
    });
  }

  if (closeAdminAddModal) closeAdminAddModal.addEventListener('click', hideAdminAddModal);
  if (cancelAdminAddBtn) cancelAdminAddBtn.addEventListener('click', hideAdminAddModal);

  if (adminAddStudentForm) {
    adminAddStudentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newStudent = {
        student_number: document.getElementById('adminAddNumber').value.trim(),
        name: document.getElementById('adminAddName').value.trim(),
        email: document.getElementById('adminAddEmail').value.trim(),
        program: document.getElementById('adminAddProgram').value,
        year: parseInt(document.getElementById('adminAddYear').value, 10) || 1,
        status: 'enrolled'
      };

      // Save state for undo
      lastActionHistory.push({ type: 'add', student: newStudent });

      studentRoster.unshift(newStudent);
      if (typeof window.saveRosterToStorage === 'function') {
        window.saveRosterToStorage();
      }
      applyFilters();
      renderNewestRecords();
      hideAdminAddModal();

      if (typeof window.showToast === 'function') {
        window.showToast(`Added new student record: ${newStudent.name}`, 'success');
      }
    });
  }

  // Global helper to undo last modification
  window.undoLastAdminAction = function () {
    if (lastActionHistory.length === 0) {
      if (typeof window.showToast === 'function') window.showToast('No actions to undo', 'error');
      return;
    }
    const last = lastActionHistory.pop();
    if (last.type === 'add') {
      const idx = studentRoster.findIndex(s => s.student_number === last.student.student_number);
      if (idx !== -1) {
        studentRoster.splice(idx, 1);
        if (typeof window.saveRosterToStorage === 'function') window.saveRosterToStorage();
        applyFilters();
        renderNewestRecords();
        if (typeof window.showToast === 'function') window.showToast(`Undo: Removed added student ${last.student.name}`, 'success');
      }
    }
  };

  // ---------------- Analytics: bar chart (monthly enrollments) ----------------
  const barChart = document.getElementById('enrollmentBarChart');
  if (barChart) {
    const max = Math.max(...adminStats.monthlyEnrollments);
    barChart.innerHTML = adminStats.monthlyEnrollments.map((v, i) => `
      <div class="bar-col">
        <div class="bar" style="height:${(v / max * 100).toFixed(0)}%; animation-delay:${i * 0.06}s"></div>
        <div class="bar-label">${adminStats.monthLabels[i]}</div>
      </div>
    `).join('');
  }

  // ---------------- Analytics: sparkline ----------------
  const sparkline = document.getElementById('sparklineChart');
  if (sparkline) {
    const vals = [40, 55, 48, 70, 62, 80, 75, 92, 85, 98];
    const max = Math.max(...vals);
    sparkline.innerHTML = vals.map((v, i) => `<div class="spark-bar" style="height:${(v / max * 100).toFixed(0)}%; animation-delay:${i * 0.04}s"></div>`).join('');
  }

  // ---- Icons ----
  function iconUsers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'; }
  function iconBook() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'; }
  function iconLayers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'; }
  function iconClock() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'; }
  function iconEye() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>'; }
  function iconEdit() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'; }
  function iconTrash() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z"/></svg>'; }
})();
