/* =========================================================================
   L'ÉCOLE ADMIN — "MY PROFILE & SETTINGS" PAGE SCRIPT
   ========================================================================= */

(function () {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  // Toast Notice Banner
  let noticeDismissTimer = null;

  function showNotice(message) {
    const banner = byId('j-notice-banner');
    const text = byId('j-notice-banner-text');
    if (!banner || !text) return;
    text.textContent = message;
    banner.classList.add('c-is-visible');

    window.clearTimeout(noticeDismissTimer);
    noticeDismissTimer = window.setTimeout(hideNotice, 3600);
  }

  function hideNotice() {
    const banner = byId('j-notice-banner');
    if (banner) banner.classList.remove('c-is-visible');
  }

  function initNoticeBanner() {
    const dismissBtn = byId('j-notice-banner-dismiss');
    if (dismissBtn) dismissBtn.addEventListener('click', hideNotice);
  }

  // Avatar Upload & Preview
  const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

  function initAvatarUpload() {
    const trigger = byId('j-avatar-trigger');
    const fileInput = byId('j-avatar-input');
    const preview = byId('j-avatar-preview');
    if (!trigger || !fileInput || !preview) return;

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

  // Save Profile Button
  function initSaveProfileButton() {
    const saveBtn = byId('j-save-profile-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        showNotice('Administrator profile saved.');
      });
    }
  }

  // Custom Select Dropdowns (Year / Term)
  function initCustomSelects() {
    const selects = document.querySelectorAll('.j-select');

    selects.forEach((select) => {
      const trigger = select.querySelector('.j-select-trigger');
      const valueLabel = select.querySelector('.j-select-value');
      const options = select.querySelectorAll('.c-select__option');
      if (!trigger || !valueLabel) return;

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
        const trig = select.querySelector('.j-select-trigger');
        if (trig) trig.setAttribute('aria-expanded', 'false');
      });
    }

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.j-select')) closeAllSelects();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAllSelects();
    });
  }

  // General Settings Form
  function initGeneralSettingsForm() {
    const form = byId('j-general-settings-form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        showNotice('Institution settings saved.');
      });
    }
  }

  // Admin Security Password Form & Visibility Toggle
  function initPasswordVisibilityToggle() {
    const toggleBtn = byId('j-toggle-passwords-btn');
    if (!toggleBtn) return;

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
      if (icon) icon.innerHTML = passwordsVisible ? EYE_OFF_PATH : EYE_PATH;
      if (label) label.textContent = passwordsVisible ? 'Hide passwords' : 'Show passwords';
    });
  }

  function initPasswordForm() {
    const form = byId('j-password-form');
    if (!form) return;

    const errorBanner = byId('j-password-form-error');
    const currentInput = byId('j-field-current-password');
    const newInput = byId('j-field-new-password');
    const confirmInput = byId('j-field-confirm-password');

    function showPasswordError(message) {
      if (!errorBanner) return;
      errorBanner.textContent = message;
      errorBanner.classList.add('c-is-visible');
    }

    function clearPasswordError() {
      if (!errorBanner) return;
      errorBanner.textContent = '';
      errorBanner.classList.remove('c-is-visible');
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!currentInput || !currentInput.value) {
        showPasswordError('Enter your current password to continue.');
        return;
      }
      if (!newInput || newInput.value.length < 10) {
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

  document.addEventListener('DOMContentLoaded', function () {
    initNoticeBanner();
    initAvatarUpload();
    initSaveProfileButton();
    initCustomSelects();
    initGeneralSettingsForm();
    initPasswordVisibilityToggle();
    initPasswordForm();
  });
})();
