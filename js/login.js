/* =========================================================
   LOGIN LOGIC — role select, validation, simulated auth
   ========================================================= */

(function () {
  const form = document.getElementById('loginForm');
  const emailField = document.getElementById('email');
  const pwField = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const pwError = document.getElementById('pwError');
  const roleBtns = document.querySelectorAll('.role-select button');
  const submitBtn = document.getElementById('submitBtn');
  const toastStack = document.getElementById('toastStack');
  const togglePw = document.getElementById('togglePw');

  let selectedRole = 'student';

  // ---- Role selection (placeholder text only — label position never changes) ----
  roleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      roleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.dataset.role;
      emailField.placeholder = selectedRole === 'admin' ? 'admin@campus.edu' : 'alexa.marquez@gmail.com';
    });
  });

  // ---- Password visibility toggle ----
  togglePw.addEventListener('click', () => {
    const isPw = pwField.type === 'password';
    pwField.type = isPw ? 'text' : 'password';
    togglePw.innerHTML = isPw ? eyeOffIcon() : eyeIcon();
  });

  function eyeIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  }
  function eyeOffIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.9 19.9 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.9 19.9 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';
  }

  // ---- Validation ----
  function validateEmail(value) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value.trim());
  }

  function setFieldError(fieldEl, errEl, msg) {
    const wrap = fieldEl.closest('.input-group');
    if (msg) {
      wrap.classList.add('invalid');
      errEl.textContent = msg;
      errEl.classList.add('show');
    } else {
      wrap.classList.remove('invalid');
      errEl.classList.remove('show');
      errEl.textContent = '';
    }
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastStack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  // ---- Submit handling ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    if (!validateEmail(emailField.value)) {
      setFieldError(emailField, emailError, 'Enter a valid email address');
      valid = false;
    } else {
      setFieldError(emailField, emailError, '');
    }

    if (pwField.value.length < 6) {
      setFieldError(pwField, pwError, 'Password must be at least 6 characters');
      valid = false;
    } else {
      setFieldError(pwField, pwError, '');
    }

    if (!valid) return;

    // ---- Simulated login ----
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      const account = selectedRole === 'admin' ? MOCK_USERS.admin : MOCK_USERS.student;
      const isStudent = selectedRole === 'student';
      const inputEmail = emailField.value.trim().toLowerCase();
      const emailMatches = isStudent
        ? (inputEmail === 'alexa.marquez@gmail.com' || inputEmail === 'alexa.marquez@student.edu')
        : (inputEmail === account.email.toLowerCase());
      const pwMatches = pwField.value === account.password;

      if (emailMatches && pwMatches) {
        const session = {
          role: selectedRole,
          name: account.name,
          email: account.email,
          loginAt: Date.now(),
        };
        localStorage.setItem('sep_session', JSON.stringify(session));
        showToast('Login successful — redirecting…', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);
      } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        showToast('Invalid credentials. Try the demo account shown below.', 'error');
        setFieldError(pwField, pwError, 'Email or password is incorrect');
      }
    }, 1100);
  });

  // ---- Theme toggle (persisted) ----
  const themeFab = document.getElementById('themeFab');
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sep_theme', theme);
  }
  const savedTheme = localStorage.getItem('sep_theme') || 'light';
  applyTheme(savedTheme);
  themeFab.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ---- If already logged in, skip straight to dashboard ----
  const existing = localStorage.getItem('sep_session');
  if (existing) {
    // Do not auto-redirect aggressively; just a subtle hint
    // (kept passive so devs can re-test the login screen freely)
  }
})();
