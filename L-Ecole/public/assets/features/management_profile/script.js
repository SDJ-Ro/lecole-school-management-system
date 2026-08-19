/* =========================================================================
   L'ÉCOLE ADMIN — "MY PROFILE & SETTINGS" PAGE SCRIPT
   -------------------------------------------------------------------------
   DESIGN PRINCIPLE: this file only contains things that genuinely need
   to run in the browser — user interaction and the small amount of state
   that changes after load. Everything that is purely visual (layout,
   colors, spacing, animation curves) lives in styles.css instead, so
   this script never touches style.* properties, only classList.

   Sections in this file:
     1. Shared helpers
     2. Sidebar behaviour (collapse + nav selection)
     3. Notice / toast banner
     4. Profile avatar upload + preview
     5. "Save Profile" action
     6. Custom select component (Academic Year / Current Term)
     7. General Information form (submit handler)
     8. Management Panel Security form (password visibility + validation + submit)
     9. App bootstrap

   Naming reminder: elements this script queries are marked with the j-*
   id/class prefix (see styles.css header comment for the full rule).
   ========================================================================= */

(function () {
  'use strict';

  /* =======================================================================
     1. SHARED HELPERS
     ======================================================================= */

  /** In-memory application state — resets on page reload (no backend here). */
  const state = {
    selectedNav: 'Alex Thompson'
  };

  function byId(id) {
    return document.getElementById(id);
  }



  /* =======================================================================
     3. NOTICE / TOAST BANNER
     ======================================================================= */

  let noticeDismissTimer = null;

  function showNotice(message) {
    const banner = byId('j-notice-banner');
    const text = byId('j-notice-banner-text');
    text.textContent = message;
    banner.classList.add('c-is-visible');

    window.clearTimeout(noticeDismissTimer);
    noticeDismissTimer = window.setTimeout(hideNotice, 3600);
  }

  function hideNotice() {
    byId('j-notice-banner').classList.remove('c-is-visible');
  }

  function initNoticeBanner() {
    byId('j-notice-banner-dismiss').addEventListener('click', hideNotice);
  }

  /* =======================================================================
     4. PROFILE AVATAR UPLOAD + PREVIEW
     ======================================================================= */

  const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

  function initAvatarUpload() {
    const trigger = byId('j-avatar-trigger');
    const fileInput = byId('j-avatar-input');
    const preview = byId('j-avatar-preview');

    trigger.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showNotice('Please choose an image file for the profile photo.');
        fileInput.value = '';
        return;
      }
      if (file.size > MAX_AVATAR_BYTES) {
        showNotice('Choose an image smaller than 5 MB.');
        fileInput.value = '';
        return;
      }

      preview.src = URL.createObjectURL(file);
      showNotice('Profile photo updated.');
    });
  }

  /* =======================================================================
     5. "SAVE PROFILE" ACTION
     ======================================================================= */

  function initSaveProfileButton() {
    byId('j-save-profile-btn').addEventListener('click', () => {
      showNotice('Administrator profile saved.');
    });
  }

  /* =======================================================================
     6. CUSTOM SELECT COMPONENT
     -------------------------------------------------------------------------
     A tiny, dependency-free dropdown. Positioning is handled entirely by
     CSS (the menu is absolutely anchored under its own trigger), so this
     script only ever toggles the c-is-open / c-is-selected state classes
     — no pixel math, no scroll/resize listeners needed.
     ======================================================================= */

  function initCustomSelects() {
    const selects = document.querySelectorAll('.j-select');

    selects.forEach((select) => {
      const trigger = select.querySelector('.j-select-trigger');
      const valueLabel = select.querySelector('.j-select-value');
      const options = select.querySelectorAll('.c-select__option');

      function open() {
        closeAllSelects();
        select.classList.add('c-is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      function close() {
        select.classList.remove('c-is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }

      trigger.addEventListener('click', () => {
        select.classList.contains('c-is-open') ? close() : open();
      });

      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((other) => {
            const isSelected = other === option;
            other.classList.toggle('c-is-selected', isSelected);
            other.setAttribute('aria-selected', String(isSelected));
          });
          valueLabel.textContent = option.dataset.optionValue;
          close();
          trigger.focus();
        });
      });

      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
      });
    });

    function closeAllSelects() {
      selects.forEach((select) => {
        select.classList.remove('c-is-open');
        select.querySelector('.j-select-trigger').setAttribute('aria-expanded', 'false');
      });
    }

    // click outside any select closes all of them
    document.addEventListener('click', (event) => {
      const clickedInsideASelect = event.target.closest('.j-select');
      if (!clickedInsideASelect) closeAllSelects();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAllSelects();
    });
  }

  /* =======================================================================
     7. GENERAL INFORMATION FORM
     ======================================================================= */

  function initGeneralSettingsForm() {
    byId('j-general-settings-form').addEventListener('submit', (event) => {
      event.preventDefault();
      showNotice('Institution settings saved.');
    });
  }

  /* =======================================================================
     8. ADMIN SECURITY FORM (password visibility + validation)
     ======================================================================= */

  function initPasswordVisibilityToggle() {
    const toggleBtn = byId('j-toggle-passwords-btn');
    const icon = toggleBtn.querySelector('.j-password-visibility-icon');
    const label = toggleBtn.querySelector('.j-password-visibility-label');
    const passwordInputs = document.querySelectorAll('.j-password-input');
    let passwordsVisible = false;

    const EYE_PATH = '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>';
    const EYE_OFF_PATH = '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>';

    toggleBtn.addEventListener('click', () => {
      passwordsVisible = !passwordsVisible;
      passwordInputs.forEach((input) => {
        input.type = passwordsVisible ? 'text' : 'password';
      });
      icon.innerHTML = passwordsVisible ? EYE_OFF_PATH : EYE_PATH;
      label.textContent = passwordsVisible ? 'Hide passwords' : 'Show passwords';
    });
  }

  function initPasswordForm() {
    const form = byId('j-password-form');
    const errorBanner = byId('j-password-form-error');
    const currentInput = byId('j-field-current-password');
    const newInput = byId('j-field-new-password');
    const confirmInput = byId('j-field-confirm-password');

    function showPasswordError(message) {
      errorBanner.textContent = message;
      errorBanner.classList.add('c-is-visible');
    }

    function clearPasswordError() {
      errorBanner.textContent = '';
      errorBanner.classList.remove('c-is-visible');
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!currentInput.value) {
        showPasswordError('Enter your current password to continue.');
        return;
      }
      if (newInput.value.length < 10) {
        showPasswordError('Use at least 10 characters for the new password.');
        return;
      }
      if (newInput.value !== confirmInput.value) {
        showPasswordError('The new password and confirmation do not match.');
        return;
      }

      clearPasswordError();
      form.reset();
      showNotice('Password updated successfully.');
    });
  }

  /* =======================================================================
     9. APP BOOTSTRAP
     ======================================================================= */

  function init() {
    initNoticeBanner();
    initAvatarUpload();
    initSaveProfileButton();
    initCustomSelects();
    initGeneralSettingsForm();
    initPasswordVisibilityToggle();
    initPasswordForm();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
