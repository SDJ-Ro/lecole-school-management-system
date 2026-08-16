/* =========================================================================
   L'ÉCOLE — AUTH SHARED JS
   Loaded by every page in sign-in/. Three jobs only:
   1. ROLES data (one canonical list — the original app had two overlapping
      role lists for the same 5 roles; merged into one here).
   2. Forgot-password modal — injected once, shared by every page that has
      a <div id="fp-modal-root"></div>.
   3. Basic form validation + fake-submit state for the sign-in/sign-up
      forms, and the role-switching behavior on access.html.
   Every page is otherwise static HTML — this file only does things a
   browser can't do without JS (validation, modal state, live switching).
   ========================================================================= */
(function () {
  'use strict';

  var ROLES = {
    student: {
      label: 'Student', selfServe: true,
      image: '../assets/images/7c9fae96-24b6-445b-aec1-74f901b17fff.jpg',
      imageAlt: 'Student boy and girl in school uniform',
      eyebrow: 'Your learning journey', tagline: 'Timetables, grades, clubs, and notices in one place.',
      chipBg: 'var(--tan)', chipColor: 'var(--midnight)', icon: 'graduationCap'
    },
    teacher: {
      label: 'Teacher', selfServe: true,
      image: '../assets/images/f39f549e-64d2-4a26-9672-d3efd1201588.jpg',
      imageAlt: 'Welcoming teacher holding a book',
      eyebrow: 'Guide the journey', tagline: 'Plan lessons, record grades, run your clubs and teams.',
      chipBg: 'var(--maroon)', chipColor: 'var(--alabaster)', icon: 'bookOpen'
    },
    parent: {
      label: 'Parent', selfServe: true,
      image: '../assets/images/5f29c757-f05e-4c61-b148-9051ec94ddbc.jpg',
      imageAlt: 'Father and mother holding their baby',
      eyebrow: 'Part of the team', tagline: 'Follow academic progress, activities, and achievements.',
      chipBg: 'var(--lightblue)', chipColor: 'var(--midnight)', icon: 'heartHandshake'
    },
    management: {
      label: 'Management', selfServe: false, supportEmail: 'office@lecole.edu',
      image: '../assets/images/842235f5-c6b1-4373-b391-b56d9a606de8.jpg',
      imageAlt: 'School leadership team talking in a bright campus corridor',
      eyebrow: 'Restricted access', tagline: 'Enrolment, staffing, curriculum, and school-wide notices.',
      chipBg: 'var(--terracotta)', chipColor: 'var(--cream)', icon: 'building2'
    },
    admin: {
      label: 'Admin', selfServe: false, supportEmail: 'itdesk@lecole.edu',
      image: '../assets/images/2add0442-13b9-4eaa-a1b6-f2eae3968626.jpg',
      imageAlt: "L'École school building and front lawn",
      eyebrow: 'Restricted access', tagline: 'Platform configuration, accounts, and system access.',
      chipBg: 'var(--midnight)', chipColor: '#fff', icon: 'shield'
    }
  };
  window.LECOLE_ROLES = ROLES;

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  /* ---------------- forgot-password modal (shared by every page) ---------------- */
  function injectForgotPasswordModal(defaultEmail) {
    var root = document.getElementById('fp-modal-root');
    if (!root) return;
    root.innerHTML =
      '<div class="fp-overlay" id="fp-overlay" role="dialog" aria-modal="true" aria-labelledby="fp-title">' +
      '<div class="fp-dialog">' +
      '<div class="fp-head">' +
      '<div class="fp-head-left"><span class="fp-head-icon"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-keyRound"/></svg></span>' +
      '<div><h2 class="fp-title" id="fp-title">Reset your password</h2><p class="fp-subtitle" id="fp-subtitle">Enter your account email and we\'ll send a 6-digit code.</p></div></div>' +
      '<button type="button" class="fp-close-btn" id="fp-close" aria-label="Close"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-x"/></svg></button>' +
      '</div>' +
      '<div class="fp-body">' +
      '<div class="fp-step is-active" data-step="email">' +
      '<div class="field"><span class="field-label">Account email</span><input type="email" class="field-input" id="fp-email" placeholder="you@lecole.edu" value="' + (defaultEmail || '') + '" /></div>' +
      '<p class="form-alert" id="fp-email-alert"></p>' +
      '<button type="button" class="auth-submit-btn auth-submit-btn--block" id="fp-send-code">Send reset code<svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-arrowRight"/></svg></button>' +
      '</div>' +
      '<div class="fp-step" data-step="code">' +
      '<p class="fp-code-hint" id="fp-code-hint"></p>' +
      '<div class="field"><span class="field-label">6-digit code</span><input type="text" inputmode="numeric" maxlength="6" class="fp-otp-input" id="fp-code" placeholder="000000" /></div>' +
      '<p class="form-alert" id="fp-code-alert"></p>' +
      '<div class="fp-otp-row"><button type="button" class="fp-link-btn" id="fp-resend"><svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-mailCheck"/></svg>Resend code</button>' +
      '<button type="button" class="auth-submit-btn" id="fp-verify-code">Verify code</button></div>' +
      '</div>' +
      '<div class="fp-step" data-step="success">' +
      '<div class="form-success is-visible"><svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-checkCircle2"/></svg><span>Code verified. Check your email for a link to set a new password.</span></div>' +
      '<button type="button" class="auth-submit-btn auth-submit-btn--block" id="fp-done">Done</button>' +
      '</div>' +
      '</div></div></div>';

    var overlay = qs('#fp-overlay');
    function showStep(name) {
      qsa('.fp-step', overlay).forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-step') === name); });
    }
    function open() { overlay.classList.add('is-open'); showStep('email'); qs('#fp-email-alert').classList.remove('is-visible'); }
    function close() { overlay.classList.remove('is-open'); }
    qsa('.j-forgot-trigger').forEach(function (btn) { btn.addEventListener('click', open); });
    qs('#fp-close').addEventListener('click', close);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });

    qs('#fp-send-code').addEventListener('click', function () {
      var email = qs('#fp-email').value.trim();
      var alertEl = qs('#fp-email-alert');
      if (!isValidEmail(email)) { alertEl.textContent = 'Enter a valid email address.'; alertEl.classList.add('is-visible'); return; }
      alertEl.classList.remove('is-visible');
      qs('#fp-code-hint').textContent = 'We sent a 6-digit code to ' + email + '. It expires in 10 minutes.';
      showStep('code');
    });
    qs('#fp-verify-code').addEventListener('click', function () {
      var code = qs('#fp-code').value.trim();
      var alertEl = qs('#fp-code-alert');
      if (code.length !== 6 || !/^\d{6}$/.test(code)) { alertEl.textContent = 'Enter the 6-digit code from your email.'; alertEl.classList.add('is-visible'); return; }
      alertEl.classList.remove('is-visible');
      showStep('success');
    });
    qs('#fp-resend').addEventListener('click', function () { qs('#fp-code-hint').textContent = 'A new code has been sent.'; });
    qs('#fp-done').addEventListener('click', close);
  }

  /* ---------------- sign-in / sign-up form: validate + redirect to admin portal ---------------- */
  function wireAuthForm(formId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var alertEl = qs('.form-alert', form);
    var successEl = qs('.form-success', form);
    var submitBtn = qs('.auth-submit-btn', form);
    var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var inputs = qsa('.field-input', form);
      var missing = inputs.some(function (i) { return i.hasAttribute('required') && !i.value.trim(); });
      var emailInput = qs('input[type="email"]', form);
      if (missing) { showAlert('Please fill in every field.'); return; }
      if (emailInput && !isValidEmail(emailInput.value.trim())) { showAlert('Enter a valid email address.'); return; }
      hideAlert();
      submitBtn.disabled = true;
      var isSignUp = formId.indexOf('sign-up') !== -1;
      submitBtn.textContent = isSignUp ? 'Requesting access…' : 'Signing in…';
      setTimeout(function () {
        if (successEl) successEl.classList.add('is-visible');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;

        // Redirect to portal based on role
        var targetUrl = '../../index.html#dashboard';
        var pathname = window.location.pathname.toLowerCase();
        if (formId === 'gw-form-student' || pathname.indexOf('student') !== -1) {
          targetUrl = '../../../Student/index.html';
        } else if (formId === 'gw-form-teacher' || pathname.indexOf('teacher') !== -1) {
          targetUrl = '../../index.html#academic';
        } else if (formId === 'gw-form-parent' || pathname.indexOf('parent') !== -1) {
          targetUrl = '../../index.html#Notice';
        } else if (formId === 'gw-form-management' || pathname.indexOf('management') !== -1) {
          targetUrl = '../../../Management%20Panel/index.html';
        } else if (formId === 'gw-form-admin' || pathname.indexOf('admin') !== -1) {
          targetUrl = '../../index.html#dashboard';
        }

        setTimeout(function () {
          window.location.href = targetUrl;
        }, 800);
      }, 700);
    });
    function showAlert(msg) { if (alertEl) { alertEl.textContent = msg; alertEl.classList.add('is-visible'); } }
    function hideAlert() { if (alertEl) alertEl.classList.remove('is-visible'); }
  }

  /* ---------------- access.html: role list -> inline panel switching ---------------- */
  function wireAccessGateway() {
    var roleButtons = qsa('.j-gw-role-btn');
    if (!roleButtons.length) return;
    var rolesView = document.getElementById('gw-roles-view');
    var eyebrowEl = document.getElementById('gw-visual-eyebrow');
    var headlineEl = document.getElementById('gw-visual-headline');
    var defaultEyebrow = eyebrowEl ? eyebrowEl.textContent : '';
    var defaultHeadline = headlineEl ? headlineEl.textContent : '';

    function activate(role, label, tagline) {
      qsa('.gw-panel').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-role-panel') === role); });
      if (rolesView) rolesView.classList.remove('is-active');
      qsa('.gw-visual img').forEach(function (img) { img.classList.toggle('is-active', img.getAttribute('data-role-image') === role); });
      if (eyebrowEl) eyebrowEl.textContent = "L'École for " + label;
      if (headlineEl) headlineEl.textContent = tagline;
    }
    function resetVisual() {
      qsa('.gw-visual img').forEach(function (img) { img.classList.toggle('is-active', img.getAttribute('data-role-image') === ''); });
      if (eyebrowEl) eyebrowEl.textContent = defaultEyebrow;
      if (headlineEl) headlineEl.textContent = defaultHeadline;
    }
    roleButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = qs('.gw-role-name', btn) ? qs('.gw-role-name', btn).textContent : '';
        var tagline = qs('.gw-role-tagline', btn) ? qs('.gw-role-tagline', btn).textContent : '';
        activate(btn.getAttribute('data-role'), label, tagline);
      });
    });
    qsa('.j-gw-back-to-roles').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qsa('.gw-panel').forEach(function (p) { p.classList.remove('is-active'); });
        if (rolesView) rolesView.classList.add('is-active');
        resetVisual();
      });
    });
  }

  window.LECOLE_AUTH = { injectForgotPasswordModal: injectForgotPasswordModal, wireAuthForm: wireAuthForm, wireAccessGateway: wireAccessGateway };
})();
