(function ()
{
  'use strict';

  const form = document.getElementById('j-add-notice');

  if (!form) return;

  form.addEventListener('dropdown:change', (event) =>
  {
    if (event.target.id !== 'j-add-notice-category') return;

    document.getElementById('j-add-notice-academic').hidden = event.detail.value !== 'Academic';
    document.getElementById('j-add-notice-club').hidden = event.detail.value !== 'Extracurricular';
  });
})();
