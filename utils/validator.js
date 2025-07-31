const { body, param, query } = require('express-validator');

/**
 * Custom validators for the application
 */
const validators = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Strong password validation
  isStrongPassword: (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // UUID validation
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Date validation
  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  // Date range validation
  isValidDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
  },

  // Module code validation
  isValidModuleCode: (code) => {
    // Module codes should be alphanumeric and between 3-20 characters
    const codeRegex = /^[A-Z0-9]{3,20}$/;
    return codeRegex.test(code);
  },

  // Student ID validation
  isValidStudentId: (studentId) => {
    // Student IDs should be numeric or alphanumeric
    const studentIdRegex = /^[A-Z0-9]{6,15}$/;
    return studentIdRegex.test(studentId);
  },

  // Employee ID validation
  isValidEmployeeId: (employeeId) => {
    // Employee IDs should be alphanumeric
    const employeeIdRegex = /^[A-Z0-9]{4,12}$/;
    return employeeIdRegex.test(employeeId);
  },

  // Week number validation
  isValidWeekNumber: (week) => {
    const weekNum = parseInt(week);
    return weekNum >= 1 && weekNum <= 52;
  },

  // Trimester validation
  isValidTrimester: (trimester) => {
    return ['1', '2', '3'].includes(trimester);
  },

  // Intake period validation
  isValidIntakePeriod: (intake) => {
    return ['HT1', 'HT2', 'FT'].includes(intake);
  },

  // Status validation for activity tracker
  isValidActivityStatus: (status) => {
    return ['Not Started', 'Pending', 'Done'].includes(status);
  },

  // Course offering status validation
  isValidCourseStatus: (status) => {
    return ['planned', 'active', 'completed', 'cancelled'].includes(status);
  },

  // Role validation
  isValidRole: (role) => {
    return ['manager', 'facilitator', 'student'].includes(role);
  },

  // Mode validation
  isValidMode: (mode) => {
    return ['online', 'in-person', 'hybrid'].includes(mode);
  },

  // Pagination validation
  isValidPaginationParams: (page, limit) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    return pageNum >= 1 && limitNum >= 1 && limitNum <= 100;
  },

  // Sanitization functions
  sanitizeString: (str) => {
    if (typeof str !== 'string') return str;
    // Remove HTML tags and trim whitespace
    return str.replace(/<[^>]*>/g, '').trim();
  },

  sanitizeEmail: (email) => {
    if (typeof email !== 'string') return email;
    return email.toLowerCase().trim();
  },

  // Attendance array validation
  isValidAttendanceArray: (attendance) => {
    if (!Array.isArray(attendance)) return false;
    return attendance.every(item => typeof item === 'boolean');
  },

  // Business logic validations
  validateCourseOfferingDates: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    // Start date should not be in the past (with some tolerance)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (start < yesterday) {
      return { valid: false, message: 'Start date cannot be in the past' };
    }
    
    // End date should be after start date
    if (end <= start) {
      return { valid: false, message: 'End date must be after start date' };
    }
    
    // Course duration should be reasonable (between 1 week and 1 year)
    const durationMs = end.getTime() - start.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    
    if (durationDays < 7) {
      return { valid: false, message: 'Course duration must be at least 1 week' };
    }
    
    if (durationDays > 365) {
      return { valid: false, message: 'Course duration cannot exceed 1 year' };
    }
    
    return { valid: true };
  },

  validateActivityLogWeek: (weekStartDate, weekEndDate, weekNumber) => {
    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);
    
    // Week should be exactly 7 days
    const durationMs = end.getTime() - start.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    
    if (Math.abs(durationDays - 7) > 0.1) { // Allow small floating point differences
      return { valid: false, message: 'Week duration must be exactly 7 days' };
    }
    
    // Week number should correspond roughly to the date
    const yearStart = new Date(start.getFullYear(), 0, 1);
    const daysDiff = Math.floor((start - yearStart) / (1000 * 60 * 60 * 24));
    const calculatedWeek = Math.ceil((daysDiff + yearStart.getDay() + 1) / 7);
    
    if (Math.abs(calculatedWeek - weekNumber) > 2) { // Allow some flexibility
      return { valid: false, message: 'Week number does not match the provided dates' };
    }
    
    return { valid: true };
  }
};

module.exports = validators;
