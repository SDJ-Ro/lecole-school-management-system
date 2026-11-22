// A gallery input keeps every file chosen so far, since choosing again would otherwise replace them.
(function ()
{
  'use strict';

  const chosen = new WeakMap();   // The files each gallery input will send, in order
  const fileOf = new WeakMap();   // The file behind each preview

  const showFile = (file, image) =>
  {
    image.src = URL.createObjectURL(file);
    image.hidden = false;
  };

  // A file input's list can only be set through DataTransfer
  function setFiles(input, files)
  {
    const list = new DataTransfer();
    files.forEach((file) => list.items.add(file));
    input.files = list.files;
    chosen.set(input, files);
  }

  document.addEventListener('change', (event) =>
  {
    const input = event.target;

    if (input.matches('[data-image-picker]') && input.files[0])
    {
      const picker = input.closest('.c-image-picker');
      showFile(input.files[0], picker.querySelector('.c-image-picker__image'));
      picker.querySelector('.c-image-picker__empty').hidden = true;
    }

    
    if (input.matches('[data-gallery-add]'))
    {
      const list     = document.getElementById(input.dataset.galleryAdd);
      const template = document.getElementById(`${input.dataset.galleryAdd}-photo`);
      const added    = [...input.files];

      added.forEach((file) =>
      {
        const photo = template.content.firstElementChild.cloneNode(true);
        showFile(file, photo.querySelector('img'));
        fileOf.set(photo, file);
        list.insertBefore(photo, input.closest('label'));
      });
      setFiles(input, [...(chosen.get(input) ?? []), ...added]);
    }
  });

  document.addEventListener('click', (event) =>
  {
    const remove = event.target.closest('[data-gallery-remove]');

    if (!remove) return;

    const photo = remove.closest('[data-gallery-photo]');
    const input = photo.parentElement.querySelector('[data-gallery-add]');
    setFiles(input, (chosen.get(input) ?? []).filter((file) => file !== fileOf.get(photo)));
    photo.remove();
  });
})();
