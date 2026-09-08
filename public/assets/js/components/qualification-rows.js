// Listens on the document, so rows that arrive later in a pop-up work too
(function ()
{
  'use strict';

  document.addEventListener('click', (event) =>
  {
    const add = event.target.closest('.j-qualification-add');
    const remove = event.target.closest('.j-qualification-remove');

    if (add)
    {
      const list = add.closest('.j-qualifications').querySelector('.j-qualification-list');
      const row = list.querySelector('.j-qualification-row').cloneNode(true);

      row.querySelectorAll('input').forEach((input) => { input.value = ''; });
      list.append(row);
      row.querySelector('input').focus();
    }

    if (remove)
    {
      const row = remove.closest('.j-qualification-row');

      // The last row is only emptied, so there is always one to type in
      if (row.parentElement.children.length > 1)
      {
        row.remove();
      }
      else
      {
        row.querySelectorAll('input').forEach((input) => { input.value = ''; });
      }
    }
  });
})();
