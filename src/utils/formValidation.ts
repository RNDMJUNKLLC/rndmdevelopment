import type { FormValidationError } from '@/types';

/**
 * Form validation utilities
 * Reusable validation functions for different field types
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): FormValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return {
      field: 'email',
      message: 'Email is required',
    };
  }

  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Please enter a valid email address',
    };
  }

  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): FormValidationError | null => {
  if (!value || value.trim() === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }

  return null;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): FormValidationError | null => {
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return null;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): FormValidationError | null => {
  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return null;
};

/**
 * Validate phone number format (basic US format)
 */
export const validatePhone = (phone: string): FormValidationError | null => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.,]?[0-9]{3}[-\s.,]?[0-9]{4,6}$/;

  if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
    return {
      field: 'phone',
      message: 'Please enter a valid phone number',
    };
  }

  return null;
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): FormValidationError | null => {
  try {
    new URL(url);
    return null;
  } catch {
    return {
      field: 'url',
      message: 'Please enter a valid URL',
    };
  }
};

/**
 * Validate number range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): FormValidationError | null => {
  if (value < min || value > max) {
    return {
      field: fieldName,
      message: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return null;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDate = (dateString: string): FormValidationError | null => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateString)) {
    return {
      field: 'date',
      message: 'Please enter a valid date (YYYY-MM-DD)',
    };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      field: 'date',
      message: 'Please enter a valid date',
    };
  }

  return null;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): FormValidationError | null => {
  if (password.length < 8) {
    return {
      field: 'password',
      message: 'Password must be at least 8 characters',
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (!hasUpperCase) {
    return {
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!hasLowerCase) {
    return {
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!hasNumbers) {
    return {
      field: 'password',
      message: 'Password must contain at least one number',
    };
  }

  return null;
};

/**
 * Validate that two fields match (e.g., password confirmation)
 */
export const validateFieldMatch = (
  value1: string,
  value2: string,
  fieldName: string
): FormValidationError | null => {
  if (value1 !== value2) {
    return {
      field: fieldName,
      message: `${fieldName} values do not match`,
    };
  }

  return null;
};

/**
 * Validate custom pattern (regex)
 */
export const validatePattern = (
  value: string,
  pattern: RegExp,
  fieldName: string,
  message?: string
): FormValidationError | null => {
  if (!pattern.test(value)) {
    return {
      field: fieldName,
      message: message || `${fieldName} is invalid`,
    };
  }

  return null;
};

/**
 * Runtime validation for contact form
 */
export const validateContactForm = (data: {
  name: string;
  email: string;
  message: string;
  company?: string;
  phone?: string;
}): FormValidationError[] => {
  const errors: FormValidationError[] = [];

  // Validate name
  const nameError = validateRequired(data.name, 'Name');
  if (nameError) errors.push(nameError);

  const nameLength = validateMinLength(data.name, 2, 'Name');
  if (nameLength) errors.push(nameLength);

  // Validate email
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  // Validate message
  const messageError = validateRequired(data.message, 'Message');
  if (messageError) errors.push(messageError);

  const messageLength = validateMinLength(data.message, 10, 'Message');
  if (messageLength) errors.push(messageLength);

  // Validate optional phone
  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.push(phoneError);
  }

  return errors;
};

/**
 * Clear validation errors for specific fields
 */
export const clearFieldErrors = (
  errors: FormValidationError[],
  fieldName: string
): FormValidationError[] => {
  return errors.filter((error) => error.field !== fieldName);
};

/**
 * Get first error for a specific field
 */
export const getFieldError = (
  errors: FormValidationError[],
  fieldName: string
): FormValidationError | undefined => {
  return errors.find((error) => error.field === fieldName);
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors: FormValidationError[]): boolean => {
  return errors.length > 0;
};

/**
 * Convert validation errors to a map for easier access
 */
export const errorsToMap = (errors: FormValidationError[]): Record<string, string> => {
  return errors.reduce(
    (map, error) => {
      map[error.field] = error.message;
      return map;
    },
    {} as Record<string, string>
  );
};
