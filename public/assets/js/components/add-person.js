(function ()
{
  'use strict';

  document.addEventListener('change', (event) =>
  {
    if (!event.target.matches('.j-photo-input')) return;

    const file = event.target.files[0];
    event.target.closest('.c-field__photo').querySelector('.j-photo-name').textContent = file ? file.name : 'No file chosen';
  });
})();
