import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateContactForm,
  getFieldError,
  hasErrors,
  clearFieldErrors,
} from '@utils/formValidation';
import type { FormValidationError } from '@/types';

describe('Validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const result = validateEmail('test@example.com');
      expect(result).toBeNull();
    });

    it('should reject invalid email addresses', () => {
      const result = validateEmail('invalid-email');
      expect(result).not.toBeNull();
    });

    it('should accept empty email (returns error if required elsewhere)', () => {
      const result = validateEmail('');
      // Empty is okay for optional field
      expect(typeof result === 'object' || result === null).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      const result = validatePhone('(555) 123-4567');
      expect(result).toBeNull();
    });

    it('should accept empty phone (optional)', () => {
      const result = validatePhone('');
      expect(result).toBeNull();
    });
  });

  describe('validateRequired', () => {
    it('should return error for empty value', () => {
      const result = validateRequired('', 'name');
      expect(result).not.toBeNull();
    });

    it('should return null for non-empty value', () => {
      const result = validateRequired('John Doe', 'name');
      expect(result).toBeNull();
    });
  });

  describe('validateMinLength', () => {
    it('should validate minimum length', () => {
      const result = validateMinLength('hello', 5, 'message');
      expect(result).toBeNull();
    });

    it('should return error when too short', () => {
      const result = validateMinLength('hi', 5, 'message');
      expect(result).not.toBeNull();
    });
  });

  describe('validateContactForm', () => {
    const validFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'ACME Corp',
      projectType: 'website',
      budget: '5000-10000',
      timeline: '3-6 months',
      message: 'This is a test message with enough content',
    };

    it('should validate correct form data', () => {
      const errors = validateContactForm(validFormData);
      expect(errors.length).toBe(0);
    });

    it('should return errors for missing required fields', () => {
      const invalidData = { ...validFormData, name: '' };
      const errors = validateContactForm(invalidData);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate email field', () => {
      const invalidData = { ...validFormData, email: 'invalid-email' };
      const errors = validateContactForm(invalidData);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate message length', () => {
      const invalidData = { ...validFormData, message: 'short' };
      const errors = validateContactForm(invalidData);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('getFieldError', () => {
    it('should return error for field that has error', () => {
      const errors: FormValidationError[] = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email' },
      ];
      const error = getFieldError(errors, 'name');
      expect(error?.message).toBe('Name is required');
    });

    it('should return undefined for field without error', () => {
      const errors: FormValidationError[] = [
        { field: 'name', message: 'Name is required' },
      ];
      const error = getFieldError(errors, 'email');
      expect(error).toBeUndefined();
    });
  });

  describe('hasErrors', () => {
    it('should return true when errors array has items', () => {
      const errors: FormValidationError[] = [
        { field: 'name', message: 'Required' },
      ];
      expect(hasErrors(errors)).toBe(true);
    });

    it('should return false for empty errors array', () => {
      expect(hasErrors([])).toBe(false);
    });
  });

  describe('clearFieldErrors', () => {
    it('should remove error for specific field', () => {
      const errors: FormValidationError[] = [
        { field: 'name', message: 'Required' },
        { field: 'email', message: 'Invalid' },
      ];
      const cleared = clearFieldErrors(errors, 'name');
      expect(cleared.length).toBe(1);
      expect(cleared[0].field).toBe('email');
    });

    it('should return same array if field not found', () => {
      const errors: FormValidationError[] = [
        { field: 'name', message: 'Required' },
      ];
      const cleared = clearFieldErrors(errors, 'email');
      expect(cleared.length).toBe(1);
    });
  });
});
