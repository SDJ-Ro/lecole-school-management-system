<?php
$title = "L'École Admin Dashboard Interface";
$featureCss = "/assets/features/dashboard/styles.css";
$currentRole = 'admin';
$currentRoute = '/admin/dashboard';

require __DIR__ . '/../components/_head.php';
?>
  <div id="j-app-root" class="c-app-shell">

    <!-- =====================================================================
         SIDEBAR
         ===================================================================== -->
    <?php require __DIR__ . '/../components/_sidebar.php'; ?>

    <!-- =====================================================================
         MAIN CONTENT
         ===================================================================== -->
    <main class="c-main" id="j-main">
      <div class="c-main-inner">
        <div class="c-main-container">
          <div class="c-page-stack">

            <header>
              <h1 class="c-page-header__title c-font-display">Dashboard</h1>
              <p class="c-page-header__subtitle">Welcome back, Alex!</p>
            </header>

            <!-- ---------------------------------------------------------
                 METRIC CARDS
                 --------------------------------------------------------- -->
            <div class="c-metrics-grid">
              <div class="c-metric-card c-metric-card--sand" style="animation-delay:0ms">
                <div class="c-metric-card__top">
                  <span class="c-metric-card__icon" aria-hidden="true"><svg class="c-icon" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <path
                        d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                      <path d="M22 10v6" />
                      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                    </svg></span>
                </div>
                <p class="c-metric-card__value c-font-display" id="j-metric-students">0</p>
                <p class="c-metric-card__label">Total Students</p>
              </div>
              <div class="c-metric-card c-metric-card--maroon" style="animation-delay:50ms">
                <div class="c-metric-card__top">
                  <span class="c-metric-card__icon" aria-hidden="true"><svg class="c-icon" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg></span>
                </div>
                <p class="c-metric-card__value c-font-display">145</p>
                <p class="c-metric-card__label">Total Teachers</p>
              </div>
              <div class="c-metric-card c-metric-card--sunshine" style="animation-delay:100ms">
                <div class="c-metric-card__top">
                  <span class="c-metric-card__icon" aria-hidden="true"><svg class="c-icon" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <path d="M18 21a8 8 0 0 0-16 0" />
                      <circle cx="10" cy="8" r="5" />
                      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
                    </svg></span>
                </div>
                <p class="c-metric-card__value c-font-display">2,102</p>
                <p class="c-metric-card__label">Total Parents</p>
              </div>
              <div class="c-metric-card c-metric-card--light-blue" style="animation-delay:150ms">
                <div class="c-metric-card__top">
                  <span class="c-metric-card__icon" aria-hidden="true"><svg class="c-icon" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <path d="M12 12h.01" />
                      <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      <path d="M22 13a18.15 18.15 0 0 1-20 0" />
                      <rect width="20" height="14" x="2" y="6" rx="2" />
                    </svg></span>
                </div>
                <p class="c-metric-card__value c-font-display">12</p>
                <p class="c-metric-card__label">Management Panel</p>
              </div>
              <div class="c-metric-card c-metric-card--moss" style="animation-delay:200ms">
                <div class="c-metric-card__top">
                  <span class="c-metric-card__icon" aria-hidden="true"><svg class="c-icon" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <path d="M14.4 14.4 9.6 9.6" />
                      <path
                        d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.767a2 2 0 1 1-2.829-2.828l6.364-6.364a2 2 0 1 1 2.829 2.828l-1.768 1.768a2 2 0 1 1 2.829 2.828z" />
                      <path d="m21.5 21.5-1.4-1.4" />
                      <path d="M3.9 3.9 2.5 2.5" />
                      <path
                        d="M6.404 12.768a2 2 0 1 1-2.829-2.828l1.768-1.768a2 2 0 1 1-2.828-2.828l2.828-2.828a2 2 0 1 1 2.828 2.828l1.768-1.768a2 2 0 1 1 2.828 2.828" />
                    </svg></span>
                </div>
                <p class="c-metric-card__value c-font-display">6</p>
                <p class="c-metric-card__label">Extracurriculars</p>
              </div>
            </div>

            <!-- ---------------------------------------------------------
                 BAR CHART + CALENDAR
                 --------------------------------------------------------- -->
            <div class="c-primary-grid">
              <section class="c-panel c-primary-grid__chart">
                <div class="c-bar-chart-card__head">
                  <h2 class="c-panel__title">Total Students vs Sports Participation by Class</h2>
                </div>
                <div class="c-bar-chart-card__body">
                  <div class="c-bar-chart" id="j-bar-chart" style="position: relative; padding-left: 32px;">
                    <div
                      style="position: absolute; left: 0; top: 15px; bottom: 40px; width: 24px; display: flex; align-items: center; justify-content: center;">
                      <span
                        style="color: var(--moss); font-weight: 600; font-size: 0.875rem; letter-spacing: 0.05em; transform: rotate(-90deg); white-space: nowrap;">STUDENTS</span>
                    </div>
                    <div class="c-bar-chart__plot">
                      <!-- Bars are pre-plotted (static markup, computed once from the
                           enrollment data). JS only attaches hover/click behaviour via
                           the j-bar / j-bar-hover-band hooks; it never builds this SVG. -->
                      <svg class="c-bar-chart__svg" viewBox="0 0 640 360">
                        <!-- gridlines + y-axis labels (static, niceMax=160) -->
                        <!-- Axis lines and titles -->
                        <line x1="30" y1="320.0" x2="636" y2="320.0" stroke="rgba(15, 65, 74, 0.2)" stroke-width="2" />
                        <line x1="30" y1="15.0" x2="30" y2="320.0" stroke="rgba(15, 65, 74, 0.2)" stroke-width="2" />
                        <text class="c-bar-chart__axis-name" x="333" y="355" text-anchor="middle" font-size="14"
                          font-weight="600" letter-spacing="0.05em" fill="var(--moss, #4B5B34)">GRADE LEVEL</text>

                        <text class="c-bar-chart__axis-label" x="22" y="323.5" text-anchor="end"
                          fill="var(--color-midnight)">0</text>
                        <text class="c-bar-chart__axis-label" x="22" y="251.5" text-anchor="end"
                          fill="var(--color-midnight)">40</text>
                        <text class="c-bar-chart__axis-label" x="22" y="179.5" text-anchor="end"
                          fill="var(--color-midnight)">80</text>
                        <text class="c-bar-chart__axis-label" x="22" y="107.5" text-anchor="end"
                          fill="var(--color-midnight)">120</text>
                        <text class="c-bar-chart__axis-label" x="22" y="35.5" text-anchor="end"
                          fill="var(--color-midnight)">160</text>

                        <!-- bar groups: one hover band + two bars (total, sports) per grade -->
                        <g class="j-bar-group" data-grade="Grade 6" data-total="120" data-sports="35">
                          <rect class="c-bar-chart__bar c-bar-chart__bar--total j-bar" data-grade="Grade 6"
                            data-metric="Total" data-value="120" x="55.5" y="104" width="24" height="216" rx="3"
                            style="animation-delay:0ms" />
                          <rect class="c-bar-chart__bar c-bar-chart__bar--sports j-bar" data-grade="Grade 6"
                            data-metric="Sports" data-value="35" x="81.5" y="257" width="24" height="63" rx="3"
                            style="animation-delay:0ms" />
                          <text class="c-bar-chart__axis-label" x="80.5" y="335" text-anchor="middle">Grade 6</text>
                        </g>
                        <g class="j-bar-group" data-grade="Grade 7" data-total="130" data-sports="42">
                          <rect class="c-bar-chart__bar c-bar-chart__bar--total j-bar" data-grade="Grade 7"
                            data-metric="Total" data-value="130" x="156.5" y="86" width="24" height="234" rx="3"
                            style="animation-delay:45ms" />
                          <rect class="c-bar-chart__bar c-bar-chart__bar--sports j-bar" data-grade="Grade 7"
                            data-metric="Sports" data-value="42" x="182.5" y="244.4" width="24" height="75.6" rx="3"
                            style="animation-delay:45ms" />
                          <text class="c-bar-chart__axis-label" x="181.5" y="335" text-anchor="middle">Grade 7</text>
                        </g>
                        <g class="j-bar-group" data-grade="Grade 8" data-total="140" data-sports="48">
                          <rect class="c-bar-chart__bar c-bar-chart__bar--total j-bar" data-grade="Grade 8"
                            data-metric="Total" data-value="140" x="257.5" y="68" width="24" height="252" rx="3"
                            style="animation-delay:90ms" />
                          <rect class="c-bar-chart__bar c-bar-chart__bar--sports j-bar" data-grade="Grade 8"
                            data-metric="Sports" data-value="48" x="283.5" y="233.6" width="24" height="86.4" rx="3"
                            style="animation-delay:90ms" />
                          <text class="c-bar-chart__axis-label" x="282.5" y="335" text-anchor="middle">Grade 8</text>
                        </g>
                        <g class="j-bar-group" data-grade="Grade 9" data-total="150" data-sports="51">
                          <rect class="c-bar-chart__bar c-bar-chart__bar--total j-bar" data-grade="Grade 9"
                            data-metric="Total" data-value="150" x="358.5" y="50" width="24" height="270" rx="3"
                            style="animation-delay:135ms" />
                          <rect class="c-bar-chart__bar c-bar-chart__bar--sports j-bar" data-grade="Grade 9"
                            data-metric="Sports" data-value="51" x="384.5" y="228.2" width="24" height="91.8" rx="3"
                            style="animation-delay:135ms" />
                          <text class="c-bar-chart__axis-label" x="383.5" y="335" text-anchor="middle">Grade 9</text>
                        </g>
                        <g class="j-bar-group" data-grade="Grade 10" data-total="160" data-sports="57">
                          <rect class="c-bar-chart__bar c-bar-chart__bar--total j-bar" data-grade="Grade 10"
                            data-metric="Total" data-value="160" x="459.5" y="32" width="24" height="288" rx="3"
                            style="animation-delay:180ms" />
                          <rect class="c-bar-chart__bar c-bar-chart__bar--sports j-bar" data-grade="Grade 10"
                            data-metric="Sports" data-value="57" x="485.5" y="217.4" width="24" height="102.6" rx="3"
                            style="animation-delay:180ms" />
                          <text class="c-bar-chart__axis-label" x="484.5" y="335" text-anchor="middle">Grade 10</text>
                        </g>
                        <g class="j-bar-group" data-grade="Grade 11" data-total="155" data-sports="61">
                          <rect class="c-bar-chart__bar c-bar-chart__bar--total j-bar" data-grade="Grade 11"
                            data-metric="Total" data-value="155" x="560.5" y="41" width="24" height="279" rx="3"
                            style="animation-delay:225ms" />
                          <rect class="c-bar-chart__bar c-bar-chart__bar--sports j-bar" data-grade="Grade 11"
                            data-metric="Sports" data-value="61" x="586.5" y="210.2" width="24" height="109.8" rx="3"
                            style="animation-delay:225ms" />
                          <text class="c-bar-chart__axis-label" x="585.5" y="335" text-anchor="middle">Grade 11</text>
                        </g>
                      </svg>
                    </div>
                    <div class="c-bar-chart__legend">
                      <span class="c-bar-chart__legend-item"><span class="c-bar-chart__legend-dot"
                          style="background: var(--sky-blue)"></span>Total</span>
                      <span class="c-bar-chart__legend-item"><span class="c-bar-chart__legend-dot"
                          style="background: var(--maroon)"></span>Sports</span>
                    </div>
                  </div>
                </div>
              </section>

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
                    <p class="c-calendar__event-count" id="j-calendar-event-count" aria-live="polite">0 events scheduled
                    </p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <button type="button" class="c-calendar__view-all-btn" id="j-open-day-schedule">View all</button>
                    </div>
                  </div>
                  <div class="c-calendar__day-detail" id="j-calendar-day-detail"></div>
                </div>
              </section>
            </div>

            <!-- ---------------------------------------------------------
                 SPORTS / CLUBS DONUTS + UPCOMING EVENTS
                 --------------------------------------------------------- -->
            <section class="c-breakdown-grid" aria-label="Events and participation breakdowns">

              <!-- Sports donut: slices are pre-plotted static <path> markup (computed
                   once from the sports-participation figures below). JS only attaches
                   hover/click behaviour via the j-donut-slice / j-donut-legend-item hooks. -->
              <section class="c-panel" id="j-donut-sports" data-chart-title="Sports Participation"
                data-total-label="Students in all sports">
                <div class="c-donut-card__head">
                  <h2 class="c-panel__title">Sports Participation</h2>
                </div>
                <div class="c-donut-card__plot">
                  <svg class="c-donut-card__svg" viewBox="0 0 200 200">
                    <!-- Sports Participation: static donut -->
                    <path class="c-donut-card__slice j-donut-slice" data-name="Football" data-value="150"
                      data-color="#7FC7CC" fill="#7FC7CC"
                      d="M 162.68 131.17 A 70 70 0 0 0 100.00 30.00 L 100.00 50.00 A 50 50 0 0 1 144.77 122.26 Z" />
                    <path class="c-donut-card__slice j-donut-slice" data-name="Cricket" data-value="122"
                      data-color="#0F414A" fill="#0F414A"
                      d="M 58.72 156.53 A 70 70 0 0 0 159.72 136.51 L 142.66 126.08 A 50 50 0 0 1 70.51 140.38 Z" />
                    <path class="c-donut-card__slice j-donut-slice" data-name="Swimming" data-value="90"
                      data-color="#EA8913" fill="#EA8913"
                      d="M 34.65 74.91 A 70 70 0 0 0 53.95 152.72 L 67.10 137.65 A 50 50 0 0 1 53.32 82.08 Z" />
                    <path class="c-donut-card__slice j-donut-slice" data-name="Athletics" data-value="76"
                      data-color="#AF5031" fill="#AF5031"
                      d="M 93.90 30.27 A 70 70 0 0 0 37.09 69.31 L 55.06 78.08 A 50 50 0 0 1 95.64 50.19 Z" />
                  </svg>
                  <div class="c-donut-card__center" aria-hidden="true">
                    <span class="c-donut-card__center-value c-font-display">438</span>
                    <span class="c-donut-card__center-label">Total</span>
                  </div>
                </div>
                <div class="c-donut-card__legend">
                  <button type="button" class="c-donut-card__legend-item j-donut-legend-item" data-name="Football"
                    data-value="150" data-color="#7FC7CC" aria-label="View Football details"><span
                      class="c-donut-card__legend-dot" style="background:#7FC7CC"></span>Football</button>
                  <button type="button" class="c-donut-card__legend-item j-donut-legend-item" data-name="Cricket"
                    data-value="122" data-color="#0F414A" aria-label="View Cricket details"><span
                      class="c-donut-card__legend-dot" style="background:#0F414A"></span>Cricket</button>
                  <button type="button" class="c-donut-card__legend-item j-donut-legend-item" data-name="Swimming"
                    data-value="90" data-color="#EA8913" aria-label="View Swimming details"><span
                      class="c-donut-card__legend-dot" style="background:#EA8913"></span>Swimming</button>
                  <button type="button" class="c-donut-card__legend-item j-donut-legend-item" data-name="Athletics"
                    data-value="76" data-color="#AF5031" aria-label="View Athletics details"><span
                      class="c-donut-card__legend-dot" style="background:#AF5031"></span>Athletics</button>
                </div>
              </section>

              <!-- Clubs donut (same static-SVG pattern as the sports donut above) -->
              <section class="c-panel" id="j-donut-clubs" data-chart-title="Clubs & Societies"
                data-total-label="Club and society members">
                <div class="c-donut-card__head">
                  <h2 class="c-panel__title">Clubs & Societies</h2>
                </div>
                <div class="c-donut-card__plot">
                  <svg class="c-donut-card__svg" viewBox="0 0 200 200">
                    <!-- Clubs & Societies: static donut -->
                    <path class="c-donut-card__slice j-donut-slice" data-name="Science Society" data-value="120"
                      data-color="#96C0CE" fill="#96C0CE"
                      d="M 153.67 144.94 A 70 70 0 0 0 100.00 30.00 L 100.00 50.00 A 50 50 0 0 1 138.34 132.10 Z" />
                    <path class="c-donut-card__slice j-donut-slice" data-name="Debate" data-value="80"
                      data-color="#AF5031" fill="#AF5031"
                      d="M 53.56 152.38 A 70 70 0 0 0 149.55 149.44 L 135.39 135.32 A 50 50 0 0 1 66.83 137.41 Z" />
                    <path class="c-donut-card__slice j-donut-slice" data-name="Music" data-value="60"
                      data-color="#7F0303" fill="#7F0303"
                      d="M 34.88 74.31 A 70 70 0 0 0 49.17 148.13 L 63.69 134.38 A 50 50 0 0 1 53.49 81.65 Z" />
                    <path class="c-donut-card__slice j-donut-slice" data-name="Robotics" data-value="54"
                      data-color="#4B5B34" fill="#4B5B34"
                      d="M 93.90 30.27 A 70 70 0 0 0 37.37 68.73 L 55.26 77.67 A 50 50 0 0 1 95.64 50.19 Z" />
                  </svg>
                  <div class="c-donut-card__center" aria-hidden="true">
                    <span class="c-donut-card__center-value c-font-display">314</span>
                    <span class="c-donut-card__center-label">Total</span>
                  </div>
                </div>
                <div class="c-donut-card__legend">
                  <button type="button" class="c-donut-card__legend-item j-donut-legend-item"
                    data-name="Science Society" data-value="120" data-color="#96C0CE"
                    aria-label="View Science Society details"><span class="c-donut-card__legend-dot"
                      style="background:#96C0CE"></span>Science Society</button>
                  <button type="button" class="c-donut-card__legend-item j-donut-legend-item" data-name="Debate"
                    data-value="80" data-color="#AF5031" aria-label="View Debate details"><span
                      class="c-donut-card__legend-dot" style="background:#AF5031"></span>Debate</button>
                  <button type="button" class="c-donut-card__legend-item j-donut-legend-item" data-name="Music"
                    data-value="60" data-color="#7F0303" aria-label="View Music details"><span
                      class="c-donut-card__legend-dot" style="background:#7F0303"></span>Music</button>
                  <button type="button" class="c-donut-card__legend-item j-donut-legend-item" data-name="Robotics"
                    data-value="54" data-color="#4B5B34" aria-label="View Robotics details"><span
                      class="c-donut-card__legend-dot" style="background:#4B5B34"></span>Robotics</button>
                </div>
              </section>

              <!-- Upcoming events: fully static list, nothing here ever changes at
                   runtime so there is no reason for JS to build it. -->
              <section class="c-panel">
                <h2 class="c-events-card__title">Upcoming Events</h2>
                <div class="c-events-list">
                  <div class="c-event-row">
                    <div class="c-event-row__date">
                      <div class="c-event-row__day">17</div>
                      <div class="c-event-row__month">JUN</div>
                    </div>
                    <div>
                      <h3 class="c-event-row__name">Term 2 examinations begin</h3>
                      <span class="c-event-row__tag c-event-row__tag--sand">Academic</span>
                    </div>
                  </div>
                  <div class="c-event-row">
                    <div class="c-event-row__date">
                      <div class="c-event-row__day">20</div>
                      <div class="c-event-row__month">JUN</div>
                    </div>
                    <div>
                      <h3 class="c-event-row__name">History examination</h3>
                      <span class="c-event-row__tag c-event-row__tag--sky">Academic</span>
                    </div>
                  </div>
                  <div class="c-event-row">
                    <div class="c-event-row__date">
                      <div class="c-event-row__day">26</div>
                      <div class="c-event-row__month">JUN</div>
                    </div>
                    <div>
                      <h3 class="c-event-row__name">Make-up examination session</h3>
                      <span class="c-event-row__tag c-event-row__tag--terracotta">Academic</span>
                    </div>
                  </div>
                </div>
              </section>
            </section>

          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- =====================================================================
       MODAL: ADD / EDIT CALENDAR EVENT
       ===================================================================== -->
  <div class="c-modal-layer" id="j-modal-event-editor" role="presentation">
    <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close event editor"></button>
    <section class="c-modal" role="dialog" aria-modal="true" aria-labelledby="j-event-editor-title">
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge c-modal__icon-badge--sky" aria-hidden="true">
            <svg class="c-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 19h6" />
              <path d="M16 2v4" />
              <path d="M19 16v6" />
              <path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.598" />
              <path d="M3 10h18" />
              <path d="M8 2v4" />
            </svg>
          </div>
          <div>
            <p class="c-modal__eyebrow" id="j-event-editor-month">June 2026 calendar</p>
            <h2 class="c-modal__title" id="j-event-editor-title">Add an event</h2>
            <p class="c-modal__description" id="j-event-editor-description">This event is saved to the dashboard
              calendar for this session.</p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close event editor">
          <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      <form class="c-event-form" id="j-event-form" novalidate>
        <div class="c-event-form__error-banner" id="j-event-form-error-banner">
          Complete the highlighted event details before saving.
        </div>

        <div>
          <label class="c-field-label" for="j-field-category">Event category</label>
          <select class="c-field-input" id="j-field-category">
            <option value="Other">General / Other</option>
            <option value="Academic">Academic</option>
            <option value="Extracurricular">Extracurricular</option>
          </select>
        </div>

        <div id="j-field-extracurricular-wrap" style="display: none; margin-top: 1rem;">
          <label class="c-field-label" for="j-field-extracurricular-target">Sport / Club / Society</label>
          <select class="c-field-input" id="j-field-extracurricular-target">
            <option value="">Select target...</option>
            <optgroup label="Sports">
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Swimming">Swimming</option>
              <option value="Athletics">Athletics</option>
            </optgroup>
            <optgroup label="Clubs & Societies">
              <option value="Science Society">Science Society</option>
              <option value="Debate">Debate</option>
              <option value="Music">Music</option>
              <option value="Robotics">Robotics</option>
            </optgroup>
          </select>
        </div>

        <div style="margin-top: 1rem;">
          <label class="c-field-label">Visible to (Audiences)</label>
          <div class="c-multi-select" id="j-audience-select" style="position: relative; margin-top: 0.25rem;">
            <div class="c-field-input" id="j-audience-trigger"
              style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 38px; align-items: center; cursor: pointer; padding: 4px 8px;">
              <span style="color: var(--midnight); opacity: 0.5; font-size: 0.875rem; padding: 4px;"
                id="j-audience-placeholder">Select audiences...</span>
            </div>
            <div id="j-audience-menu"
              style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--color-border); border-radius: 6px; margin-top: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; max-height: 200px; overflow-y: auto;">
              <div class="j-audience-option" data-val="Students"
                style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">
                Students<span class="j-audience-check" style="display:none; color: var(--color-sunshine);"><svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg></span></div>
              <div class="j-audience-option" data-val="Teachers"
                style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">
                Teachers<span class="j-audience-check" style="display:none; color: var(--color-sunshine);"><svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg></span></div>
              <div class="j-audience-option" data-val="Parents"
                style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">
                Parents<span class="j-audience-check" style="display:none; color: var(--color-sunshine);"><svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg></span></div>
              <div class="j-audience-option" data-val="Management"
                style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between;">
                Management<span class="j-audience-check" style="display:none; color: var(--color-sunshine);"><svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg></span></div>
            </div>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <label class="c-field-label" for="j-field-time">Time</label>
          <input class="c-field-input" id="j-field-time" placeholder="e.g. 14:00–15:30" type="text" />
          <p class="c-field-error" id="j-field-time-error">Enter the event time.</p>
        </div>

        <div>
          <label class="c-field-label" for="j-field-title">Event title</label>
          <input class="c-field-input" id="j-field-title" placeholder="e.g. Parent information evening" type="text" />
          <p class="c-field-error" id="j-field-title-error">Enter an event title.</p>
        </div>

        <div>
          <label class="c-field-label" for="j-field-details">Details or location</label>
          <textarea class="c-field-input c-field-input--textarea" id="j-field-details"
            placeholder="e.g. Auditorium · Families of Grades 9–11"></textarea>
          <p class="c-field-error" id="j-field-details-error">Add details or a location.</p>
        </div>

        <footer class="c-event-form__footer">
          <button type="button" class="c-btn c-btn--ghost j-modal-close">Cancel</button>
          <button type="submit" class="c-btn c-btn--solid">
            <svg class="c-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 19h6" />
              <path d="M16 2v4" />
              <path d="M19 16v6" />
              <path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6.598" />
              <path d="M3 10h18" />
              <path d="M8 2v4" />
            </svg>
            <span id="j-event-form-submit-label">Save event</span>
          </button>
        </footer>
      </form>
    </section>
  </div>

  <!-- =====================================================================
       MODAL: CHART / METRIC DETAIL
       ===================================================================== -->
  <div class="c-modal-layer" id="j-modal-chart-detail" role="presentation">
    <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close chart details"></button>
    <section class="c-modal" role="dialog" aria-modal="true" aria-labelledby="j-chart-detail-title">
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <div class="c-modal__icon-badge" id="j-chart-detail-icon" aria-hidden="true">
            <svg class="c-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v16a2 2 0 0 0 2 2h16" />
              <path d="M7 16h8" />
              <path d="M7 11h12" />
              <path d="M7 6h3" />
            </svg>
          </div>
          <div>
            <p class="c-modal__eyebrow">Dashboard insight</p>
            <h2 class="c-modal__title" id="j-chart-detail-title"></h2>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close">
          <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>
      <div class="c-chart-detail__body">
        <section class="c-chart-detail__summary">
          <div class="c-chart-detail__summary-row">
            <div>
              <p class="c-chart-detail__summary-eyebrow" id="j-chart-detail-category"></p>
              <p class="c-chart-detail__summary-value c-font-display" id="j-chart-detail-value"></p>
            </div>
            <div class="c-chart-detail__summary-icon" id="j-chart-detail-icon-2" aria-hidden="true">
              <svg class="c-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 21a8 8 0 0 0-16 0" />
                <circle cx="10" cy="8" r="5" />
                <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
              </svg>
            </div>
          </div>
          <p class="c-chart-detail__summary-text" id="j-chart-detail-description"></p>
        </section>
        <dl class="c-chart-detail__stats" id="j-chart-detail-stats"></dl>
      </div>
    </section>
  </div>

  <!-- =====================================================================
       MODAL: FULL DAY SCHEDULE ("View all")
       ===================================================================== -->
  <div class="c-modal-layer c-modal-layer--day-schedule" id="j-modal-day-schedule" role="presentation">
    <button type="button" class="c-modal-backdrop j-modal-backdrop" aria-label="Close day schedule"></button>
    <section class="c-modal c-modal--day-schedule" role="dialog" aria-modal="true"
      aria-labelledby="j-day-schedule-title" tabindex="-1">
      <header class="c-modal__header">
        <div class="c-modal__heading-group">
          <span class="c-modal__icon-badge c-modal__icon-badge--sky-solid" aria-hidden="true">
            <svg class="c-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </span>
          <div>
            <p class="c-modal__eyebrow">Day schedule</p>
            <h2 class="c-modal__title" id="j-day-schedule-title"></h2>
            <p class="c-modal__description" id="j-day-schedule-description"></p>
          </div>
        </div>
        <button type="button" class="c-modal__close-btn j-modal-close" aria-label="Close day schedule">
          <svg class="c-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>
      <div class="c-day-schedule__body" id="j-day-schedule-body"></div>
    </section>
  </div>

  <!-- shared tooltip element reused by both the bar chart and the donuts -->
  <div class="c-chart-tooltip" id="j-chart-tooltip" role="status"></div>

  <script src="/assets/js/utils.js"></script>
  <script src="/assets/js/sidebar.js"></script>
  <script src="/assets/features/dashboard/data.js"></script>
  <script src="/assets/features/dashboard/script.js"></script>
</body>

</html>
