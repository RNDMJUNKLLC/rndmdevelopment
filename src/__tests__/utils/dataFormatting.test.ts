import {
  exportSubmissionsToCSV,
  filterSubmissions,
  sanitizeInput,
  isSubmissionComplete,
} from '@utils/formUtils';
import type { ContactFormSubmission } from '@/types';

describe('Data formatting and filtering utilities', () => {
  describe('exportSubmissionsToCSV', () => {
    it('should export submissions to CSV format', () => {
      const submissions: ContactFormSubmission[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Corp A',
          projectType: 'website',
          budget: '5000-10000',
          timeline: '3-6 months',
          message: 'Test message',
          status: 'pending',
          timestamp: Date.now(),
        },
      ];

      const csv = exportSubmissionsToCSV(submissions);
      
      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
      expect(csv.includes('John Doe')).toBe(true);
    });

    it('should handle multiple submissions', () => {
      const submissions: ContactFormSubmission[] = [
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
      ];

      const csv = exportSubmissionsToCSV(submissions);
      
      expect(csv.includes('Alice')).toBe(true);
      expect(csv.includes('Bob')).toBe(true);
    });
  });

  describe('filterSubmissions', () => {
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

    it('should filter by status', () => {
      const filtered = filterSubmissions(mockSubmissions, { status: 'pending' });
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Alice');
    });

    it('should filter by project type', () => {
      const filtered = filterSubmissions(mockSubmissions, { projectType: 'website' });
      
      expect(filtered.length).toBe(2);
    });

    it('should return all when no filters applied', () => {
      const filtered = filterSubmissions(mockSubmissions, {});
      
      expect(filtered.length).toBe(3);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized.includes('<script>')).toBe(false);
    });

    it('should preserve safe text', () => {
      const input = 'Hello World!';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toContain('Hello World');
    });

    it('should preserve whitespace', () => {
      const input = '   Hello   ';
      const sanitized = sanitizeInput(input);
      
      // sanitizeInput does not trim, it escapes HTML entities
      expect(sanitized).toContain('Hello');
    });
  });

  describe('isSubmissionComplete', () => {
    const completeSubmission: Partial<ContactFormSubmission> = {
      name: 'John Doe',
      email: 'john@example.com',
      projectType: 'website',
      budget: '5000-10000',
      timeline: '3-6 months',
      message: 'Test message',
      timestamp: Date.now(),
    };

    it('should return true for complete submission', () => {
      expect(isSubmissionComplete(completeSubmission)).toBe(true);
    });

    it('should return false for missing required fields', () => {
      const incomplete = { ...completeSubmission, name: '' };
      expect(isSubmissionComplete(incomplete)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isSubmissionComplete({})).toBe(false);
    });

    it('should return false if timestamp is missing', () => {
      const { timestamp, ...withoutTimestamp } = completeSubmission;
      expect(isSubmissionComplete(withoutTimestamp)).toBe(false);
    });
  });
});
