(function ()
{
  'use strict';

  const page      = document.getElementById('j-profile-page');
  const pwdButton = document.getElementById('j-profile-pwd-toggle');
  const pwdForm   = document.getElementById('j-profile-pwd');

  if (!page) return;

  pwdButton?.addEventListener('click', () =>
  {
    pwdForm.hidden = !pwdForm.hidden;
    pwdButton.textContent = pwdForm.hidden ? 'Change Password' : 'Cancel';
  });

  // The photo is saved as soon as it is chosen, without the Save button
  page.querySelector('.j-profile-photo')?.addEventListener('change', (event) =>
  {
    if (event.target.files.length > 0) event.target.form.submit();
  });
})();
