/* =========================================================================
   L'ÉCOLE — SHARED UTILITY FUNCTIONS (PURE HELPERS ONLY)
   ========================================================================= */

(function (window) {
  'use strict';

  const Utils = {
    escapeHtml: function (str) {
      if (str == null) return '';
      const div = document.createElement('div');
      div.textContent = String(str);
      return div.innerHTML;
    },

    numberWithCommas: function (val) {
      if (val == null) return '0';
      return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    sameCalendarDay: function (d1, d2) {
      if (!d1 || !d2) return false;
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    },

    startOfMonth: function (year, monthZeroIdx) {
      return new Date(year, monthZeroIdx, 1);
    },

    daysInMonth: function (year, monthZeroIdx) {
      return new Date(year, monthZeroIdx + 1, 0).getDate();
    },

    formatLongDate: function (dateObj) {
      if (!dateObj) return '';
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj);
    },

    formatMonthDay: function (dateObj) {
      if (!dateObj) return '';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    }
  };

  window.LEcoleUtils = Utils;
})(window);
