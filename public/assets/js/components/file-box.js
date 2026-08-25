// The whole dashed box is the file input's label. Files dropped on it go to the input.
(function ()
{
  'use strict';

  document.addEventListener('change', (event) =>
  {
    if (!event.target.matches('.j-file-box')) return;

    const file = event.target.files[0];
    const name = event.target.closest('.c-field__file').querySelector('.j-file-box-name');

    name.hidden = !file;
    name.textContent = file ? `${file.name} (${(file.size / 1048576).toFixed(1)} MB)` : '';
  });

  document.addEventListener('dragover', (event) =>
  {
    if (event.target.closest('.c-field__file:has(.j-file-box)')) event.preventDefault();
  });

  document.addEventListener('drop', (event) =>
  {
    const box = event.target.closest('.c-field__file:has(.j-file-box)');

    if (!box) return;

    event.preventDefault();
    const input = box.querySelector('.j-file-box');
    input.files = event.dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // reset() does not clear the name line by itself
  document.addEventListener('reset', (event) =>
  {
    event.target.querySelectorAll('.j-file-box-name').forEach((name) => { name.hidden = true; });
  });
})();
