(function(global) {
  'use strict';

  var Validation = {
    /**
     * Validates the student enrollment form.
     * @param {Object} form - The state.enrollmentForm object containing the form fields.
     * @returns {Object} - { valid: boolean, message?: string }
     */
    validateStudentEnrollment: function(form) {
      var requiredFields = [
        
        'fullName', 'firstName', 'lastName',
        'dateOfBirth',
        'gender',
        'nationalId',
        'grade',
        'classSection',
        'homeAddress',
        'admissionDate',
        'bloodGroup'
      ];

      var missingFields = requiredFields.filter(function(field) {
        return !(form[field] || '').trim();
      });

      if (missingFields.length > 0) {
        return {
          valid: false,
          message: 'Complete all required student details before enrolling.'
        };
      }

      return { valid: true };
    },

    /**
     * Validates the teacher enrollment form.
     * @param {Object} form - The state.addTeacherForm object
     * @returns {Object} - { valid: boolean, message?: string }
     */
    validateTeacherEnrollment: function(form) {
      var requiredFields = ['fullName', 'firstName', 'lastName', 'nic', 'dateOfBirth', 'phone', 'personalEmail', 'subjects', 'experience', 'qualification', 'joinDate', 'emergencyName', 'emergencyPhone'];
      var missingFields = requiredFields.filter(function(field) { return !(form[field] || '').trim(); });

      if (missingFields.length > 0) {
        return { valid: false, message: 'Complete all required fields before creating this account.' };
      }
      if (form.personalEmail.indexOf('@') === -1) {
        return { valid: false, message: 'Enter a valid personal email for credential delivery.' };
      }
      return { valid: true };
    },

    /**
     * Validates the parent enrollment form.
     * @param {Object} form - The state.addParentForm object
     * @returns {Object} - { valid: boolean, message?: string }
     */
    validateParentEnrollment: function(form) {
      var requiredFields = ['status', 'relationship', 'fullName', 'firstName', 'lastName', 'nic', 'education', 'occupation', 'mobile'];
      var missingFields = requiredFields.filter(function(field) { return !(form[field] || '').trim(); });

      if (missingFields.length > 0) {
        return { valid: false, message: 'Complete the required guardian details before saving.' };
      }
      if (form.email && form.email.indexOf('@') === -1) {
        return { valid: false, message: 'Enter a valid email address or leave the optional field blank.' };
      }
      return { valid: true };
    },

    /**
     * Validates the management enrollment form.
     * @param {Object} form - The state.addManagementForm object
     * @returns {Object} - { valid: boolean, message?: string }
     */
    validateManagementEnrollment: function(form) {
      var requiredFields = ['fullName', 'firstName', 'lastName', 'nic', 'phone', 'personalEmail', 'jobTitle', 'joinDate', 'emergencyName', 'emergencyPhone'];
      var missingFields = requiredFields.filter(function(field) { return !(form[field] || '').trim(); });

      if (missingFields.length > 0) {
        return { valid: false, message: 'Complete the required account, employment, and emergency details.' };
      }
      if (form.personalEmail.indexOf('@') === -1) {
        return { valid: false, message: 'Enter a valid personal email for credential delivery.' };
      }
      return { valid: true };
    }
  };

  global.Validation = Validation;
})(window);
