import type { ContactFormSubmission, ServiceResponse, Notification } from '@/types';

/**
 * Reusable form utilities for handling submission, formatting, and state management
 * These utilities are designed to be extracted and used across multiple projects
 */

/**
 * Format form submission data with metadata
 */
export const formatSubmission = (
  data: Omit<ContactFormSubmission, 'id' | 'timestamp' | 'status'>,
  userId?: string
): Omit<ContactFormSubmission, 'id' | 'timestamp'> => {
  return {
    ...data,
    status: 'pending',
    userId,
  };
};

/**
 * Generate unique submission ID
 */
export const generateSubmissionId = (): string => {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format submission data for database storage
 */
export const formatSubmissionForStorage = (
  data: Omit<ContactFormSubmission, 'id' | 'timestamp'>,
  userId?: string
): Omit<ContactFormSubmission, 'id'> => {
  return {
    ...data,
    timestamp: Date.now(),
    userId: userId || 'anonymous',
  };
};

/**
 * Format submission data for email
 */
export const formatSubmissionForEmail = (submission: ContactFormSubmission): string => {
  const lines = [
    `New Project Inquiry from ${submission.name}`,
    '='.repeat(50),
    '',
    `From: ${submission.name}`,
    `Email: ${submission.email}`,
    `Company: ${submission.company || 'Not specified'}`,
    `Project Type: ${submission.projectType}`,
    `Budget: ${submission.budget}`,
    `Timeline: ${submission.timeline}`,
    '',
    'Message:',
    submission.message,
    '',
    `Submitted: ${new Date(submission.timestamp).toLocaleString()}`,
    `Status: ${submission.status}`,
  ];

  return lines.join('\n');
};

/**
 * Create submission summary for UI display
 */
export const createSubmissionSummary = (submission: ContactFormSubmission): string => {
  return `${submission.name} - ${submission.projectType} (${submission.budget})`;
};

/**
 * Format submission date
 */
export const formatSubmissionDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: Error | string): string => {
  if (typeof error === 'string') {
    return error;
  }

  // Handle Firebase errors
  if (error.message.includes('auth/')) {
    const authErrors: Record<string, string> = {
      'auth/user-not-found': 'Email not found. Please check your email or create an account.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      'auth/invalid-email': 'Invalid email format.',
      'auth/too-many-requests': 'Too many login attempts. Please try again later.',
    };

    for (const [key, value] of Object.entries(authErrors)) {
      if (error.message.includes(key)) {
        return value;
      }
    }
  }

  return error.message || 'An error occurred. Please try again.';
};

/**
 * Create notification object
 */
export const createNotification = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  duration: number = 5000
): Notification => {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    duration,
  };
};

/**
 * Create success notification for form submission
 */
export const createSuccessNotification = (message: string = 'Form submitted successfully'): Notification => {
  return createNotification('success', message, 5000);
};

/**
 * Create error notification for form submission
 */
export const createErrorNotification = (error: Error | string): Notification => {
  const message = typeof error === 'string' ? error : error.message;
  return createNotification('error', message, 7000);
};

/**
 * Combine multiple responses into a single response
 */
export const combineResponses = <T>(
  responses: ServiceResponse<T>[]
): ServiceResponse<T[]> => {
  const allSuccess = responses.every((r) => r.success);
  const data = responses.filter((r) => r.data).map((r) => r.data!) as T[];
  const errors = responses.filter((r) => r.error).map((r) => r.error!);

  return {
    success: allSuccess,
    data: allSuccess ? data : undefined,
    error: errors.length > 0 ? errors.join(', ') : undefined,
  };
};

/**
 * Sanitize form input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate submission completeness
 */
export const isSubmissionComplete = (submission: Partial<ContactFormSubmission>): boolean => {
  return !!(
    submission.name &&
    submission.email &&
    submission.projectType &&
    submission.budget &&
    submission.timeline &&
    submission.message &&
    submission.timestamp
  );
};

/**
 * Filter submissions by criteria
 */
export const filterSubmissions = (
  submissions: ContactFormSubmission[],
  criteria: Partial<{
    status: string;
    projectType: string;
    budget: string;
    fromDate: number;
    toDate: number;
  }>
): ContactFormSubmission[] => {
  return submissions.filter((submission) => {
    if (criteria.status && submission.status !== criteria.status) {
      return false;
    }

    if (criteria.projectType && submission.projectType !== criteria.projectType) {
      return false;
    }

    if (criteria.budget && submission.budget !== criteria.budget) {
      return false;
    }

    if (criteria.fromDate && submission.timestamp < criteria.fromDate) {
      return false;
    }

    if (criteria.toDate && submission.timestamp > criteria.toDate) {
      return false;
    }

    return true;
  });
};

/**
 * Sort submissions by field
 */
export const sortSubmissions = (
  submissions: ContactFormSubmission[],
  sortBy: 'date' | 'name' | 'status' = 'date',
  order: 'asc' | 'desc' = 'desc'
): ContactFormSubmission[] => {
  const sorted = [...submissions].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'date':
        compareValue = a.timestamp - b.timestamp;
        break;
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
    }

    return order === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
};

/**
 * Get submission statistics
 */
export const getSubmissionStats = (submissions: ContactFormSubmission[]): Record<string, number> => {
  const stats = {
    total: submissions.length,
    pending: 0,
    viewed: 0,
    responded: 0,
  };

  submissions.forEach((submission) => {
    if (submission.status === 'pending') stats.pending++;
    if (submission.status === 'viewed') stats.viewed++;
    if (submission.status === 'responded') stats.responded++;
  });

  return stats;
};

/**
 * Export submissions to CSV format
 */
export const exportSubmissionsToCSV = (submissions: ContactFormSubmission[]): string => {
  const headers = ['ID', 'Name', 'Email', 'Company', 'Project Type', 'Budget', 'Timeline', 'Message', 'Status', 'Date'];

  const rows = submissions.map((sub) => [
    sub.id || '',
    sub.name,
    sub.email,
    sub.company || '',
    sub.projectType,
    sub.budget,
    sub.timeline,
    `"${sub.message.replace(/"/g, '""')}"`, // Escape quotes in message
    sub.status,
    formatSubmissionDate(sub.timestamp),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  return csv;
};

/**
 * Download CSV file
 */
export const downloadCSV = (csv: string, filename: string = 'submissions.csv'): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Batch update submission status
 */
export const updateSubmissionStatuses = (
  submissions: ContactFormSubmission[],
  ids: string[],
  newStatus: 'pending' | 'viewed' | 'responded'
): ContactFormSubmission[] => {
  return submissions.map((submission) => {
    if (ids.includes(submission.id || '')) {
      return {
        ...submission,
        status: newStatus,
      };
    }
    return submission;
  });
};

/**
 * Create form submission from form data
 */
export const createSubmissionFromFormData = (
  formData: Record<string, any>,
  userId?: string
): Omit<ContactFormSubmission, 'id' | 'timestamp'> => {
  return {
    name: formData.name || '',
    email: formData.email || '',
    company: formData.company || undefined,
    projectType: formData.projectType || '',
    budget: formData.budget || '',
    timeline: formData.timeline || '',
    message: formData.message || '',
    status: 'pending',
    userId,
  };
};

/**
 * Validate form data before submission
 */
export const validateFormData = (
  data: Record<string, any>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.projectType?.trim()) {
    errors.projectType = 'Project type is required';
  }

  if (!data.message?.trim()) {
    errors.message = 'Message is required';
  } else if (data.message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
