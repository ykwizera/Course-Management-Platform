const validators = require('../../utils/validators');

describe('Validators Utility', () => {
  describe('Email Validation', () => {
    test('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'firstname.lastname@company.io'
      ];

      validEmails.forEach(email => {
        expect(validators.isValidEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user.domain.com',
        'user@.com',
        'user@domain.',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(validators.isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    test('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MySecur3P@ssw0rd',
        'Str0ng#Pass',
        'C0mpl3x$Password',
        'Valid8Password!'
      ];

      strongPasswords.forEach(password => {
        expect(validators.isStrongPassword(password)).toBe(true);
      });
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'password',      // No uppercase, numbers, or special chars
        'PASSWORD',      // No lowercase, numbers, or special chars
        'Password',      // No numbers or special chars
        'Password123',   // No special chars
        'Password!',     // No numbers
        'Pass123!',      // Too short
        '',              // Empty
        '1234567!'       // No letters
      ];

      weakPasswords.forEach(password => {
        expect(validators.isStrongPassword(password)).toBe(false);
      });
    });
  });

  describe('UUID Validation', () => {
    test('should validate correct UUIDs', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '01234567-89ab-cdef-0123-456789abcdef',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      ];

      validUUIDs.forEach(uuid => {
        expect(validators.isValidUUID(uuid)).toBe(true);
      });
    });

    test('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '550e8400-e29b-41d4-a716',
        '550e8400-e29b-41d4-a716-446655440000-extra',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        '',
        null,
        undefined
      ];

      invalidUUIDs.forEach(uuid => {
        expect(validators.isValidUUID(uuid)).toBe(false);
      });
    });
  });

  describe('Date Validation', () => {
    test('should validate correct dates', () => {
      const validDates = [
        '2024-01-15',
        '2024-12-31',
        '2024-02-29', // Leap year
        '2023-01-01T00:00:00Z',
        new Date().toISOString()
      ];

      validDates.forEach(date => {
        expect(validators.isValidDate(date)).toBe(true);
      });
    });

    test('should reject invalid dates', () => {
      const invalidDates = [
        'not-a-date',
        '2024-13-01', // Invalid month
        '2024-02-30', // Invalid day for February
        '2023-02-29', // Not a leap year
        '',
        null,
        undefined
      ];

      invalidDates.forEach(date => {
        expect(validators.isValidDate(date)).toBe(false);
      });
    });
  });

  describe('Date Range Validation', () => {
    test('should validate correct date ranges', () => {
      expect(validators.isValidDateRange('2024-01-01', '2024-01-02')).toBe(true);
      expect(validators.isValidDateRange('2024-01-01', '2024-12-31')).toBe(true);
      expect(validators.isValidDateRange('2024-01-01T00:00:00Z', '2024-01-01T23:59:59Z')).toBe(true);
    });

    test('should reject invalid date ranges', () => {
      expect(validators.isValidDateRange('2024-01-02', '2024-01-01')).toBe(false);
      expect(validators.isValidDateRange('2024-01-01', '2024-01-01')).toBe(false);
      expect(validators.isValidDateRange('invalid-date', '2024-01-01')).toBe(false);
    });
  });

  describe('Module Code Validation', () => {
    test('should validate correct module codes', () => {
      const validCodes = [
        'CS101',
        'MATH200',
        'ENG300',
        'BIO101A',
        'PHYS2001'
      ];

      validCodes.forEach(code => {
        expect(validators.isValidModuleCode(code)).toBe(true);
      });
    });

    test('should reject invalid module codes', () => {
      const invalidCodes = [
        'cs101',        // Lowercase
        'CS',           // Too short
        'CS101-Advanced', // Contains hyphen
        'CS 101',       // Contains space
        '',             // Empty
        'A'.repeat(25)  // Too long
      ];

      invalidCodes.forEach(code => {
        expect(validators.isValidModuleCode(code)).toBe(false);
      });
    });
  });

  describe('Student ID Validation', () => {
    test('should validate correct student IDs', () => {
      const validIds = [
        'STU123456',
        'S12345678',
        '123456789',
        'STUDENT01',
        'A1B2C3D4E5'
      ];

      validIds.forEach(id => {
        expect(validators.isValidStudentId(id)).toBe(true);
      });
    });

    test('should reject invalid student IDs', () => {
      const invalidIds = [
        'stu123',       // Lowercase and too short
        'S1',           // Too short
        'S'.repeat(20), // Too long
        'S-123456',     // Contains hyphen
        '',             // Empty
        'student 123'   // Contains space
      ];

      invalidIds.forEach(id => {
        expect(validators.isValidStudentId(id)).toBe(false);
      });
    });
  });

  describe('Week Number Validation', () => {
    test('should validate correct week numbers', () => {
      for (let week = 1; week <= 52; week++) {
        expect(validators.isValidWeekNumber(week)).toBe(true);
        expect(validators.isValidWeekNumber(week.toString())).toBe(true);
      }
    });

    test('should reject invalid week numbers', () => {
      const invalidWeeks = [0, 53, 100, -1, 'invalid', null, undefined];

      invalidWeeks.forEach(week => {
        expect(validators.isValidWeekNumber(week)).toBe(false);
      });
    });
  });

  describe('Role Validation', () => {
    test('should validate correct roles', () => {
      const validRoles = ['manager', 'facilitator', 'student'];

      validRoles.forEach(role => {
        expect(validators.isValidRole(role)).toBe(true);
      });
    });

    test('should reject invalid roles', () => {
      const invalidRoles = ['admin', 'user', 'teacher', '', null, undefined];

      invalidRoles.forEach(role => {
        expect(validators.isValidRole(role)).toBe(false);
      });
    });
  });

  describe('Sanitization Functions', () => {
    test('should sanitize strings correctly', () => {
      expect(validators.sanitizeString('  hello world  ')).toBe('hello world');
      expect(validators.sanitizeString('<script>alert("xss")</script>test')).toBe('test');
      expect(validators.sanitizeString('<p>Hello <b>World</b></p>')).toBe('Hello World');
      expect(validators.sanitizeString('')).toBe('');
      expect(validators.sanitizeString(null)).toBe(null);
      expect(validators.sanitizeString(undefined)).toBe(undefined);
    });

    test('should sanitize emails correctly', () => {
      expect(validators.sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(validators.sanitizeEmail('User@Domain.Com')).toBe('user@domain.com');
      expect(validators.sanitizeEmail('')).toBe('');
      expect(validators.sanitizeEmail(null)).toBe(null);
    });
  });

  describe('Attendance Array Validation', () => {
    test('should validate correct attendance arrays', () => {
      const validArrays = [
        [],
        [true],
        [false],
        [true, false, true],
        [true, true, true, false, false]
      ];

      validArrays.forEach(array => {
        expect(validators.isValidAttendanceArray(array)).toBe(true);
      });
    });

    test('should reject invalid attendance arrays', () => {
      const invalidArrays = [
        [1, 0],              // Numbers instead of booleans
        ['true', 'false'],   // Strings instead of booleans
        [true, 'false'],     // Mixed types
        null,                // Not an array
        undefined,           // Not an array
        'not an array'       // Not an array
      ];

      invalidArrays.forEach(array => {
        expect(validators.isValidAttendanceArray(array)).toBe(false);
      });
    });
  });

  describe('Business Logic Validations', () => {
    describe('Course Offering Dates', () => {
      test('should validate correct course offering dates', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const result = validators.validateCourseOfferingDates(
          tomorrow.toISOString().split('T')[0],
          nextMonth.toISOString().split('T')[0]
        );

        expect(result.valid).toBe(true);
      });

      test('should reject past start dates', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 2);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = validators.validateCourseOfferingDates(
          yesterday.toISOString().split('T')[0],
          tomorrow.toISOString().split('T')[0]
        );

        expect(result.valid).toBe(false);
        expect(result.message).toContain('past');
      });

      test('should reject end date before start date', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

        const result = validators.validateCourseOfferingDates(
          dayAfterTomorrow.toISOString().split('T')[0],
          tomorrow.toISOString().split('T')[0]
        );

        expect(result.valid).toBe(false);
        expect(result.message).toContain('after start date');
      });

      test('should reject courses too short', () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 3); // Only 3 days

        const result = validators.validateCourseOfferingDates(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        expect(result.valid).toBe(false);
        expect(result.message).toContain('at least 1 week');
      });

      test('should reject courses too long', () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 2); // 2 years

        const result = validators.validateCourseOfferingDates(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        expect(result.valid).toBe(false);
        expect(result.message).toContain('cannot exceed 1 year');
      });
    });

    describe('Activity Log Week Validation', () => {
      test('should validate correct week duration', () => {
        const result = validators.validateActivityLogWeek(
          '2024-02-05',
          '2024-02-12',
          6
        );

        expect(result.valid).toBe(true);
      });

      test('should reject incorrect week duration', () => {
        const result = validators.validateActivityLogWeek(
          '2024-02-05',
          '2024-02-10', // Only 5 days
          6
        );

        expect(result.valid).toBe(false);
        expect(result.message).toContain('exactly 7 days');
      });

      test('should validate week number correspondence', () => {
        // Week 1 of 2024 (approximately)
        const result = validators.validateActivityLogWeek(
          '2024-01-01',
          '2024-01-08',
          1
        );

        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Pagination Validation', () => {
    test('should validate correct pagination parameters', () => {
      expect(validators.isValidPaginationParams(1, 10)).toBe(true);
      expect(validators.isValidPaginationParams(5, 50)).toBe(true);
      expect(validators.isValidPaginationParams('1', '10')).toBe(true);
    });

    test('should reject invalid pagination parameters', () => {
      expect(validators.isValidPaginationParams(0, 10)).toBe(false);
      expect(validators.isValidPaginationParams(1, 0)).toBe(false);
      expect(validators.isValidPaginationParams(1, 101)).toBe(false);
      expect(validators.isValidPaginationParams(-1, 10)).toBe(false);
    });
  });
});
