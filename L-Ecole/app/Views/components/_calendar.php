<!-- Dark Month Calendar -->
<section class="c-calendar" id="j-calendar" aria-label="Term 2 examination calendar">
  <header class="c-calendar__header">
    <div class="c-calendar__header-row">
      <div class="c-calendar__nav">
        <button type="button" class="c-calendar__nav-btn" id="j-calendar-prev"
          aria-label="Previous month">
          <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button type="button" class="c-calendar__nav-btn" id="j-calendar-next" aria-label="Next month">
          <svg class="c-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div class="c-calendar__month-year">
        <!-- month select -->
        <div class="c-select c-select--month" id="j-select-month">
          <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
            <span class="j-select-value">June</span>
            <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div class="c-select__menu" role="listbox" aria-label="Choose calendar month"></div>
        </div>
        <!-- year select -->
        <div class="c-select c-select--year" id="j-select-year">
          <button type="button" class="c-select__trigger" aria-haspopup="listbox" aria-expanded="false">
            <span class="j-select-value">2026</span>
            <svg class="c-icon c-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div class="c-select__menu" role="listbox" aria-label="Choose calendar year"></div>
        </div>
      </div>

    </div>
  </header>

  <div class="c-calendar__weekdays" id="j-calendar-weekdays"></div>
  <div class="c-calendar__days" id="j-calendar-days"></div>

  <div class="c-calendar__footer">
    <div class="c-calendar__footer-row">
      <p class="c-calendar__event-count" id="j-calendar-event-count" aria-live="polite">0 events scheduled</p>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button type="button" class="c-calendar__view-all-btn" id="j-open-day-schedule">View all</button>
      </div>
    </div>
    <div class="c-calendar__day-detail" id="j-calendar-day-detail"></div>
  </div>
</section>
