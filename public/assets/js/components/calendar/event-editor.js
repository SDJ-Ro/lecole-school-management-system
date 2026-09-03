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