/* =========================================================
   DASHBOARD SHELL LOGIC
   Session guard, sidebar collapse/mobile toggle, theme,
   view switching, logout.
   ========================================================= */

(function () {
  // ---- Session guard (frontend-only simulation) ----
  const raw = localStorage.getItem('sep_session');
  if (!raw) {
    window.location.href = 'login.html';
    return;
  }
  const session = JSON.parse(raw);

  // ---- Theme ----
  const savedTheme = localStorage.getItem('sep_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sep_theme', next);
    });
  }

  // ---- Populate user chip & Click navigation ----
  const initials = session.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  document.querySelectorAll('[data-user-name]').forEach((el) => (el.textContent = session.name));
  document.querySelectorAll('[data-user-role]').forEach((el) => (el.textContent = session.role === 'admin' ? 'Administrator' : 'Student'));
  document.querySelectorAll('[data-user-initials]').forEach((el) => (el.textContent = initials));

  const userChip = document.getElementById('userChip');
  if (userChip) {
    userChip.addEventListener('click', () => {
      const targetView = session.role === 'admin' ? 'admin-settings' : 'student-profile';
      if (typeof switchView === 'function') {
        switchView(targetView);
      }
    });
  }

  // ---- Role-based visibility ----
  document.querySelectorAll('[data-role-only]').forEach((el) => {
    if (el.dataset.roleOnly !== session.role) el.style.display = 'none';
  });
  document.body.classList.add(`role-${session.role}`);

  // ---- Sidebar collapse (desktop) ----
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('collapseBtn');
  const savedCollapsed = localStorage.getItem('sep_sidebar_collapsed') === 'true';
  if (savedCollapsed) sidebar.classList.add('collapsed');

  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sep_sidebar_collapsed', sidebar.classList.contains('collapsed'));
    });
  }

  // ---- Sidebar mobile toggle ----
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('sidebarOverlay');
  function openMobileSidebar() {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('show');
  }
  function closeMobileSidebar() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('show');
  }
  if (hamburger) hamburger.addEventListener('click', openMobileSidebar);
  if (overlay) overlay.addEventListener('click', closeMobileSidebar);

  // ---- View switching (SPA-style within dashboard.html) ----
  const navItems = Array.from(document.querySelectorAll('.nav-item[data-view]'));
  const views = document.querySelectorAll('.view');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');

  const roleNavItems = navItems.filter((item) => {
    const roleGroup = item.closest('[data-role-only]');
    return !roleGroup || roleGroup.dataset.roleOnly === session.role;
  });

  function switchView(viewName) {
    views.forEach((v) => v.classList.toggle('active', v.id === `view-${viewName}`));
    roleNavItems.forEach((n) => n.classList.toggle('active', n.dataset.view === viewName));
    const active = roleNavItems.find((n) => n.dataset.view === viewName) || roleNavItems[0];
    if (active && pageTitle) {
      pageTitle.textContent = active.dataset.title || active.querySelector('.label').textContent;
      pageSubtitle.textContent = active.dataset.subtitle || '';
    }
    closeMobileSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  roleNavItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(item.dataset.view);
    });
  });

  // Activate the correct default view for the logged-in role
  const defaultViewName = session.role === 'admin' ? 'admin-overview' : 'student-profile';
  const defaultView = roleNavItems.find((item) => item.dataset.view === defaultViewName) || roleNavItems[0];
  if (defaultView) switchView(defaultView.dataset.view);

  // ---- Toast Notification helper ----
  function showToast(message, type = 'success') {
    let toastStack = document.getElementById('toastStack');
    if (!toastStack) {
      toastStack = document.createElement('div');
      toastStack.id = 'toastStack';
      toastStack.className = 'toast-stack';
      toastStack.setAttribute('aria-live', 'assertive');
      document.body.appendChild(toastStack);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastStack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }
  window.showToast = showToast;

  // ---- Notifications system ----
  const notifBtn = document.getElementById('notifBtn');
  const notifDropdown = document.getElementById('notifDropdown');
  const notifDot = document.getElementById('notifDot');
  const notifList = document.getElementById('notifList');
  const clearNotifsBtn = document.getElementById('clearNotifsBtn');

  // Load notifications from local storage if available
  const storedNotifs = localStorage.getItem('sep_notifications');
  if (storedNotifs) {
    try {
      MOCK_DB.notifications = JSON.parse(storedNotifs);
    } catch (e) {
      MOCK_DB.notifications = [];
    }
  } else if (!MOCK_DB.notifications) {
    MOCK_DB.notifications = [
      {
        id: 1,
        student_number: '22114087',
        title: 'Welcome to PhilCST Portal',
        message: 'Your account is active. Check your enrolled subjects in the curriculum view.',
        time: '1 hour ago',
        unread: true
      }
    ];
  }

  // ---- Realtime Digital Clock ----
  const topbarClockText = document.getElementById('topbarClockText');
  function updateTopClock() {
    if (!topbarClockText) return;
    const now = new Date();
    topbarClockText.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }
  updateTopClock();
  setInterval(updateTopClock, 1000);

  // ---- Relative Time Ago Helper ----
  function getTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function updateNotifications() {
    if (!notifList) return;
    const userNotifs = (MOCK_DB.notifications || []).filter((n) => {
      if (session.role === 'admin') {
        // Admin sees general system/admin notifications only, not student personal alerts
        return n.recipient_role === 'admin';
      } else {
        // Logged-in student ONLY sees notifications addressed specifically to their student_number
        const currentStudentId = MOCK_DB.student.student_number;
        return n.student_number === currentStudentId;
      }
    });

    const unreadCount = userNotifs.filter((n) => n.unread).length;
    if (notifDot) notifDot.style.display = unreadCount > 0 ? 'block' : 'none';

    if (userNotifs.length === 0) {
      notifList.innerHTML = '<div class="notif-empty">No notifications</div>';
      return;
    }

    notifList.innerHTML = userNotifs.map((n) => {
      const displayTime = n.timestamp ? getTimeAgo(n.timestamp) : (n.time || 'Just now');
      return `
        <div class="notif-item ${n.unread ? 'unread' : ''}">
          <div class="notif-item__title">${n.title}</div>
          <div class="notif-item__msg">${n.message}</div>
          <div class="notif-item__time">${displayTime}</div>
        </div>
      `;
    }).join('');
  }

  // Real-time notification timer refresh every 1 second
  setInterval(() => {
    if (notifList && notifDropdown && notifDropdown.style.display === 'block') {
      updateNotifications();
    }
  }, 1000);

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notifDropdown.style.display === 'block';
      notifDropdown.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        updateNotifications();
      }

      // Mark as read when opening
      if (!isOpen && MOCK_DB.notifications) {
        MOCK_DB.notifications.forEach((n) => (n.unread = false));
        localStorage.setItem('sep_notifications', JSON.stringify(MOCK_DB.notifications));
        if (notifDot) notifDot.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBtn) {
        notifDropdown.style.display = 'none';
      }
    });
  }

  if (clearNotifsBtn) {
    clearNotifsBtn.addEventListener('click', () => {
      MOCK_DB.notifications = [];
      localStorage.removeItem('sep_notifications');
      updateNotifications();
    });
  }

  updateNotifications();

  // ---- Logout ----
  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      localStorage.removeItem('sep_session');
      window.location.href = 'login.html';
    });
  });

  // ---- Simulate skeleton loading then reveal content ----
  document.querySelectorAll('.skeleton-wrap').forEach((wrap) => {
    setTimeout(() => {
      wrap.classList.add('loaded');
    }, 550 + Math.random() * 400);
  });

  window.SEP = { session, switchView, updateNotifications };
})();
