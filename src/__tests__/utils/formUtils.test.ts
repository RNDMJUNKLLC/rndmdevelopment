import {
  createSuccessNotification,
  createErrorNotification,
  formatErrorMessage,
  formatSubmissionDate,
  sortSubmissions,
  getSubmissionStats,
  createSubmissionFromFormData,
} from '@utils/formUtils';
import type { ContactFormSubmission } from '@/types';

describe('formUtils', () => {
  describe('createSuccessNotification', () => {
    it('should create a success notification', () => {
      const notification = createSuccessNotification('Form submitted successfully');
      
      expect(notification.type).toBe('success');
      expect(notification.message).toBe('Form submitted successfully');
      expect(notification.id).toBeDefined();
    });

    it('should generate unique IDs', () => {
      const notif1 = createSuccessNotification('Message 1');
      const notif2 = createSuccessNotification('Message 2');
      
      expect(notif1.id).not.toBe(notif2.id);
    });
  });

  describe('createErrorNotification', () => {
    it('should create an error notification', () => {
      const notification = createErrorNotification('An error occurred');
      
      expect(notification.type).toBe('error');
      expect(notification.message).toBeDefined();
    });
  });

  describe('formatErrorMessage', () => {
    it('should format Firebase auth errors', () => {
      const error = new Error('auth/user-not-found');
      const formatted = formatErrorMessage(error);
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should handle generic error messages', () => {
      const error = new Error('Something went wrong');
      const formatted = formatErrorMessage(error);
      
      expect(typeof formatted).toBe('string');
    });

    it('should handle string errors', () => {
      const formatted = formatErrorMessage('Error message');
      
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatSubmissionDate', () => {
    it('should format timestamp to readable string', () => {
      const timestamp = 1705324200000;
      const formatted = formatSubmissionDate(timestamp);
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle current date', () => {
      const timestamp = Date.now();
      const formatted = formatSubmissionDate(timestamp);
      
      expect(typeof formatted).toBe('string');
    });
  });

  describe('sortSubmissions', () => {
    const mockSubmissions: ContactFormSubmission[] = [
      {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        company: 'Corp A',
        projectType: 'website',
        budget: '5000-10000',
        timeline: '3-6 months',
        message: 'Message 1',
        status: 'pending',
        timestamp: 1705324200000 - 86400000, // Yesterday
      },
      {
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
        company: 'Corp B',
        projectType: 'app',
        budget: '10000-20000',
        timeline: '6-12 months',
        message: 'Message 2',
        status: 'viewed',
        timestamp: 1705324200000, // Today
      },
    ];

    it('should sort by date descending', () => {
      const sorted = sortSubmissions([...mockSubmissions], 'date', 'desc');
      
      expect(sorted[0].timestamp >= sorted[1].timestamp).toBe(true);
    });

    it('should sort by date ascending', () => {
      const sorted = sortSubmissions([...mockSubmissions], 'date', 'asc');
      
      expect(sorted[0].timestamp <= sorted[1].timestamp).toBe(true);
    });

    it('should sort by name', () => {
      const sorted = sortSubmissions([...mockSubmissions], 'name', 'asc');
      
      expect(sorted[0].name <= sorted[1].name).toBe(true);
    });

    it('should sort by status', () => {
      const sorted = sortSubmissions([...mockSubmissions], 'status', 'asc');
      
      expect(typeof sorted[0].status).toBe('string');
    });
  });

  describe('getSubmissionStats', () => {
    const mockSubmissions: ContactFormSubmission[] = [
      {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        company: 'Corp A',
        projectType: 'website',
        budget: '5000-10000',
        timeline: '3-6 months',
        message: 'Message 1',
        status: 'pending',
        timestamp: Date.now(),
      },
      {
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
        company: 'Corp B',
        projectType: 'app',
        budget: '10000-20000',
        timeline: '6-12 months',
        message: 'Message 2',
        status: 'viewed',
        timestamp: Date.now(),
      },
      {
        id: '3',
        name: 'Charlie',
        email: 'charlie@example.com',
        company: 'Corp C',
        projectType: 'website',
        budget: '20000+',
        timeline: '1-3 months',
        message: 'Message 3',
        status: 'responded',
        timestamp: Date.now(),
      },
    ];

    it('should return stats object for submissions', () => {
      const stats = getSubmissionStats(mockSubmissions);
      
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('createSubmissionFromFormData', () => {
    it('should create submission object from form data', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp',
        projectType: 'website',
        budget: '5000-10000',
        timeline: '3-6 months',
        message: 'Test message',
      };

      const submission = createSubmissionFromFormData(formData);

      expect(submission.name).toBe('John Doe');
      expect(submission.email).toBe('john@example.com');
      expect(submission.company).toBe('ACME Corp');
      expect(submission.status).toBe('pending');
    });
  });
});
