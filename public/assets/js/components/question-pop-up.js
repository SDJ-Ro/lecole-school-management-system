// Shared "Are you sure?" pop-up, opened with window.askQuestion()
// blocked is a reason that disables the main button
// extra is the id of a template shown inside. One of its checkboxes must be ticked and its required fields filled.
// A form with data-question-title asks first without any script of its own
(function ()
{
  'use strict';

  let confirmAction = null;

  function updateConfirm()
  {
    const boxes = [...document.querySelectorAll('#j-question-extra input[type="checkbox"]')];
    const empty = [...document.querySelectorAll('#j-question-extra [required]')].some(field => field.value.trim() === '');
    const blocked = !document.getElementById('j-question-blocked').hidden;

    document.getElementById('j-question-confirm').disabled = blocked || empty || (boxes.length > 0 && !boxes.some(box => box.checked));
  }

  function askQuestion({ title, text, button, buttonIcon = '', cancel = 'Cancel', icon = 'trash', tone = 'danger', wide = false, blocked = '', extra = '', onConfirm })
  {
    const popUp = document.getElementById('j-question');
    const confirmIcon = document.getElementById('j-question-button-icon');
    const blockedBox = document.getElementById('j-question-blocked');
    const template = extra ? document.getElementById(extra) : null;

    document.getElementById('j-question-title').textContent = title;
    document.getElementById('j-question-text').textContent = text;
    document.getElementById('j-question-extra').replaceChildren(...(template ? [template.content.cloneNode(true)] : []));
    blockedBox.querySelector('span').textContent = blocked;
    blockedBox.hidden = blocked === '';
    updateConfirm();
    document.getElementById('j-question-button-text').textContent = button;
    document.getElementById('j-question-cancel').textContent = cancel;
    document.getElementById('j-question-icon').setAttribute('href', `#icon-${icon}`);
    confirmIcon.querySelector('use').setAttribute('href', `#icon-${buttonIcon}`);
    confirmIcon.toggleAttribute('hidden', buttonIcon === '');   // An svg has no hidden property

    popUp.classList.remove('c-question--danger', 'c-question--warning', 'c-question--success');
    popUp.classList.add(`c-question--${tone}`);
    popUp.classList.toggle('c-question--wide', wide);

    confirmAction = onConfirm;
    window.openPopUp(popUp);
  }

  document.addEventListener('submit', (event) =>
  {
    const form = event.target;

    if (!form.dataset.questionTitle || form.dataset.questionAsked === 'yes') return;

    event.preventDefault();
    askQuestion({
      title: form.dataset.questionTitle,
      text: form.dataset.questionText,
      button: form.dataset.questionButton,
      icon: form.dataset.questionIcon,     // Left out means the default icon
      tone: form.dataset.questionTone,
      blocked: form.dataset.questionBlocked,
      extra: form.dataset.questionExtra,
      // The mark stops a second question. requestSubmit() fires submit straight away, so the mark can be removed right after.
      onConfirm: () =>
      {
        form.dataset.questionAsked = 'yes';
        form.requestSubmit();
        delete form.dataset.questionAsked;
      }
    });

    // The extra's fields are sent with this form
    // Uses getAttribute because form.id would return a field named id
    document.querySelectorAll('#j-question-extra [name]:not([form])').forEach(field => field.setAttribute('form', form.getAttribute('id')));
  });

  document.addEventListener('DOMContentLoaded', function ()
  {
    const confirmButton = document.getElementById('j-question-confirm');
    if (!confirmButton) return;

    document.getElementById('j-question-extra').addEventListener('change', updateConfirm);
    document.getElementById('j-question-extra').addEventListener('input', updateConfirm);

    confirmButton.addEventListener('click', () =>
    {
      window.closePopUp('j-question');
      if (confirmAction) confirmAction();
    });
  });

  window.askQuestion = askQuestion;
})();
