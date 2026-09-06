// The server checks everything again. These checks just give a quicker answer.
(function ()
{
  'use strict';

  document.addEventListener('DOMContentLoaded', function ()
  {
    const popUp = document.getElementById('j-event-editor');
    const form = document.getElementById('j-event-form');
    if (!popUp || !form) return;

    const byId = (id) => document.getElementById(id);
    const gradeRadio = byId('j-academic-level-grade');   // Only admin and management have this, a teacher picks classes
    const firstCategory = byId('j-field-category').querySelector('[data-value]').dataset.value;
    let editing = null;                                  // Stays empty when adding a new event

    function showScopeFor(category)
    {
      byId('j-scope-academic-section').hidden = category !== 'Academic';
      byId('j-scope-extracurricular-section').hidden = category !== 'Extracurricular';
    }

    function showAcademicLevel(level)
    {
      if (!gradeRadio) return;
      gradeRadio.checked = level === 'grade';
      byId('j-academic-level-class').checked = level === 'class';
      byId('j-academic-grades-container').hidden = level !== 'grade';
      byId('j-academic-classes-container').hidden = level !== 'class';
    }

    // A General event is for everyone by default. Other events default to students and parents.
    byId('j-field-category').addEventListener('dropdown:change', (e) =>
    {
      showScopeFor(e.detail.value);
      window.setDropdownMultiValues('j-field-audience', e.detail.value === 'General' ? ['all'] : ['student', 'parent']);
    });

    form.querySelectorAll('input[name="academic_level"][type="radio"]').forEach(radio =>
    {
      radio.addEventListener('change', () => showAcademicLevel(radio.value));
    });

    function showError(message)
    {
      const banner = byId('j-event-form-error-banner');
      banner.textContent = message;
      banner.hidden = !message;
    }

    function clearMessages()
    {
      showError('');
      byId('j-field-title-error').hidden = true;
      byId('j-field-time-error').hidden = true;
      byId('j-event-form-warning-banner').hidden = true;
    }

    // Only called when the pop-up opens, so a ticked "Allow parallel schedule" stays ticked for the next Save
    function resetParallel()
    {
      byId('j-parallel-container').hidden = true;
      byId('j-field-allow-parallel').checked = false;
    }

    // No start hour means an all-day event with no end time
    function timeOf(which)
    {
      const hour = window.getDropdownValue(`j-${which}-hour`);
      return hour === '' ? '' : `${hour}:${window.getDropdownValue(`j-${which}-minute`)}`;
    }

    function setTime(which, time)
    {
      const [hour, minute] = time ? time.split(':') : ['', '00'];
      window.setDropdownValue(`j-${which}-hour`, hour);
      window.setDropdownValue(`j-${which}-minute`, minute);
    }

    // Comparing as text works because both are HH:MM
    function timesAreValid()
    {
      const start = timeOf('start');
      const ok = start === '' || timeOf('end') > start;
      byId('j-field-time-error').hidden = ok;
      return ok;
    }

    function showTimes()
    {
      const allDay = timeOf('start') === '';
      ['j-start-colon', 'j-start-minute-wrap', 'j-time-separator', 'j-time-end-col'].forEach(id => byId(id).hidden = allDay);
    }

    // Capped at 23:59, so the event stays on the same day
    function endOneHourLater()
    {
      const start = timeOf('start');
      if (start === '') return;

      const [hour, minute] = start.split(':');
      setTime('end', hour < '23' ? `${String(Number(hour) + 1).padStart(2, '0')}:${minute}` : '23:59');
    }

    ['j-start-hour', 'j-start-minute'].forEach(id => byId(id).addEventListener('dropdown:change', () =>
    {
      endOneHourLater();
      showTimes();
      timesAreValid();
    }));
    ['j-end-hour', 'j-end-minute'].forEach(id => byId(id).addEventListener('dropdown:change', timesAreValid));

    // ev is empty for a new event
    function open(ev)
    {
      editing = ev;
      const category = ev ? ev.category : firstCategory;
      const date = ev ? ev.date : window.calendarApi.selectedDate();
      const scopes = ev ? ev.scopes : [];
      const ids = (type) => scopes.filter(s => s.type === type).map(s => String(s.id));

      byId('j-event-editor-title').textContent = ev ? 'Edit Event' : 'Add Event';
      byId('j-event-form-submit-label').textContent = ev ? 'Save Changes' : 'Save Event';
      byId('j-event-editor-eyebrow').textContent = window.calendarApi.formatDate(date, true);
      byId('j-event-editor-delete-btn').hidden = !ev;

      byId('j-field-id').value = ev ? ev.id : '';
      byId('j-field-date').value = window.calendarApi.formatIsoDate(date);
      byId('j-field-title').value = ev ? ev.title : '';
      byId('j-field-details').value = ev ? ev.details : '';

      window.setDropdownValue('j-field-category', category);
      showScopeFor(category);
      showAcademicLevel(ids('class').length > 0 ? 'class' : 'grade');      window.setDropdownMultiValues('j-select-academic-grades', ids('grade'));
      window.setDropdownMultiValues('j-select-academic-classes', ids('class'));
      window.setDropdownMultiValues('j-select-extracurriculars', ids('extracurricular'));
      window.setDropdownMultiValues('j-field-audience', ev ? ev.audience : (category === 'General' ? ['all'] : ['student', 'parent']));

      setTime('start', ev ? ev.start : '');      if (ev && ev.end)
      {
        setTime('end', ev.end);
      }
      else
      {
        endOneHourLater();
      }
      showTimes();

      clearMessages();
      resetParallel();
      window.openPopUp(popUp);
    }

    // An answer that is not JSON usually means the user was signed out, so reload to show the sign-in page
    function send(url, data)
    {
      const only = document.getElementById('j-calendar').dataset.only;   // A programme's page only gets its own events back

      if (only) data.append('only', only);

      return fetch(url, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(res => res.json())
        .catch(() =>
        {
          window.location.reload();
          return null;
        });
    }

    function done(answer)
    {
      window.closePopUp(popUp);
      window.calendarApi.setEvents(answer.events, answer.date);
      window.showFeedbackBanner(answer.message);
    }

    form.addEventListener('submit', (e) =>
    {
      e.preventDefault();
      clearMessages();

      const titleMissing = byId('j-field-title').value.trim() === '';
      byId('j-field-title-error').hidden = !titleMissing;
      if (!timesAreValid() || titleMissing) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      send(form.action, new FormData(form)).then(answer =>
      {
        submitBtn.disabled = false;
        if (!answer) return;

        if (answer.ok)
        {
          done(answer);
        }
        else if (answer.clash)
        {
          // A clash is only a warning. Ticking "Allow parallel schedule" and saving again lets it through.
          const warning = byId('j-event-form-warning-banner');
          warning.textContent = answer.message;
          warning.hidden = false;
          byId('j-parallel-container').hidden = false;
          warning.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        else
        {
          showError(answer.message);
          byId('j-field-title-error').hidden = !answer.errors.title;
        }
      });
    });

    function remove(ev)
    {
      window.askQuestion({
        title: `Delete '${ev.title}'?`,
        text: 'This event will be permanently removed from the school calendar schedule.',
        button: 'Delete Event',
        icon: 'trash',
        tone: 'danger',
        onConfirm: () =>
        {
          const data = new FormData();
          data.append('_csrf_token', form.querySelector('[name="_csrf_token"]').value);
          data.append('id', ev.id);

          // A refused delete changes nothing. The buttons only show for events this user may delete.
          send(form.dataset.deleteUrl, data).then(answer =>
          {
            if (answer?.ok) done(answer);
          });
        }
      });
    }

    byId('j-event-editor-delete-btn').addEventListener('click', () =>
    {
      window.closePopUp(popUp);
      remove(editing);
    });

    window.calendarEditor = { open: open, remove: remove };
  });
})();