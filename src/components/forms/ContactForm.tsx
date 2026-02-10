import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth, useDatabase, useEmail, useRecaptcha } from '@/hooks';
import {
  validateContactForm,
  getFieldError,
  hasErrors,
} from '@/utils/formValidation';
import {
  createSubmissionFromFormData,
  createSuccessNotification,
  createErrorNotification,
  formatErrorMessage,
} from '@/utils/formUtils';
import type { FormValidationError } from '@/types';
import { uiActions } from '@store/slices/uiSlice';

interface FormData {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  phone?: string;
}

interface FormState {
  data: FormData;
  errors: FormValidationError[];
  isSubmitting: boolean;
  touched: Record<string, boolean>;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  company: '',
  projectType: '',
  budget: '',
  timeline: '',
  message: '',
  phone: '',
};

export const ContactForm: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { addSubmission } = useDatabase();
  const { sendSubmissionEmail, sendConfirmationEmail } = useEmail();
  const { executeRecaptcha } = useRecaptcha();

  const [formState, setFormState] = useState<FormState>({
    data: initialFormData,
    errors: [],
    isSubmitting: false,
    touched: {},
  });

  /**
   * Handle input change with real-time validation
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: value,
      },
      touched: {
        ...prev.touched,
        [name]: true,
      },
    }));
  }, []);

  /**
   * Handle field blur (mark as touched for validation display)
   */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;

    setFormState((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [name]: true,
      },
    }));
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const errors = validateContactForm({
      name: formState.data.name,
      email: formState.data.email,
      message: formState.data.message,
      company: formState.data.company,
      phone: formState.data.phone,
    });

    setFormState((prev) => ({
      ...prev,
      errors,
      touched: {
        name: true,
        email: true,
        company: true,
        projectType: true,
        budget: true,
        timeline: true,
        message: true,
      },
    }));

    return errors.length === 0;
  }, [formState.data]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validate form
      if (!validateForm()) {
        dispatch(
          uiActions.addNotification(
            createErrorNotification('Please fix the errors in the form')
          )
        );
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
      }));

      try {
        // Execute reCAPTCHA
        const recaptchaResult = await executeRecaptcha('contact_form_submit');
        if (!recaptchaResult.success) {
          throw new Error('reCAPTCHA verification failed');
        }

        // Create submission object
        const submission = createSubmissionFromFormData(
          {
            ...formState.data,
            recaptchaToken: recaptchaResult.data?.token,
          },
          user?.uid
        );

        // Add to database
        const dbResult = await addSubmission(submission);
        if (!dbResult.success) {
          throw new Error(dbResult.error || 'Failed to save submission');
        }

        // Send confirmation email to user
        const confirmationResult = await sendConfirmationEmail({
          id: dbResult.data?.id,
          ...submission,
          timestamp: Date.now(),
        });

        if (!confirmationResult.success) {
          console.warn('Failed to send confirmation email:', confirmationResult.error);
        }

        // Send admin notification
        const adminResult = await sendSubmissionEmail({
          id: dbResult.data?.id,
          ...submission,
          timestamp: Date.now(),
        });

        if (!adminResult.success) {
          console.warn('Failed to send admin notification:', adminResult.error);
        }

        // Show success message
        dispatch(
          uiActions.addNotification(
            createSuccessNotification(
              'Thank you! Your inquiry has been submitted successfully. We\'ll get back to you within 24 hours.'
            )
          )
        );

        // Reset form
        setFormState({
          data: initialFormData,
          errors: [],
          isSubmitting: false,
          touched: {},
        });
      } catch (err) {
        const errorMessage = formatErrorMessage(err instanceof Error ? err : new Error('Submission failed'));

        dispatch(
          uiActions.addNotification(
            createErrorNotification(errorMessage)
          )
        );

        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
        }));
      }
    },
    [
      validateForm,
      formState.data,
      user?.uid,
      dispatch,
      executeRecaptcha,
      addSubmission,
      sendSubmissionEmail,
      sendConfirmationEmail,
    ]
  );

  /**
   * Get error message for field
   */
  const getFieldErrorMessage = (fieldName: string): string | undefined => {
    if (!formState.touched[fieldName]) {
      return undefined;
    }
    const error = getFieldError(formState.errors, fieldName);
    return error?.message;
  };

  /**
   * Check if field has error
   */
  const hasFieldError = (fieldName: string): boolean => {
    return formState.touched[fieldName] && !!getFieldError(formState.errors, fieldName);
  };

  return (
    <div className="section container-max">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Let's Build Something Amazing</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-12">
          Fill out the form below and we'll get back to you within 24 hours with a personalized proposal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.data.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field ${hasFieldError('name') ? 'ring-2 ring-red-500' : ''}`}
              placeholder="John Doe"
              disabled={formState.isSubmitting}
            />
            {hasFieldError('name') && (
              <p className="mt-1 text-sm text-red-500">{getFieldErrorMessage('name')}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formState.data.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field ${hasFieldError('email') ? 'ring-2 ring-red-500' : ''}`}
              placeholder="john@example.com"
              disabled={formState.isSubmitting}
            />
            {hasFieldError('email') && (
              <p className="mt-1 text-sm text-red-500">{getFieldErrorMessage('email')}</p>
            )}
          </div>

          {/* Phone Field (Optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formState.data.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field ${hasFieldError('phone') ? 'ring-2 ring-red-500' : ''}`}
              placeholder="(555) 123-4567"
              disabled={formState.isSubmitting}
            />
            {hasFieldError('phone') && (
              <p className="mt-1 text-sm text-red-500">{getFieldErrorMessage('phone')}</p>
            )}
          </div>

          {/* Company Field */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-2">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formState.data.company}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="input-field"
              placeholder="Your Company"
              disabled={formState.isSubmitting}
            />
          </div>

          {/* Project Type Field */}
          <div>
            <label htmlFor="projectType" className="block text-sm font-medium mb-2">
              Project Type *
            </label>
            <select
              id="projectType"
              name="projectType"
              value={formState.data.projectType}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field ${hasFieldError('projectType') ? 'ring-2 ring-red-500' : ''}`}
              disabled={formState.isSubmitting}
            >
              <option value="">Select a project type...</option>
              <option value="website">Website</option>
              <option value="mobile">Mobile App</option>
              <option value="software">Custom Software</option>
              <option value="other">Other</option>
            </select>
            {hasFieldError('projectType') && (
              <p className="mt-1 text-sm text-red-500">{getFieldErrorMessage('projectType')}</p>
            )}
          </div>

          {/* Budget Field */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium mb-2">
              Budget Range *
            </label>
            <select
              id="budget"
              name="budget"
              value={formState.data.budget}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field ${hasFieldError('budget') ? 'ring-2 ring-red-500' : ''}`}
              disabled={formState.isSubmitting}
            >
              <option value="">Select a budget range...</option>
              <option value="0-1000">Under $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000-50000">$10,000 - $50,000</option>
              <option value="50000+">$50,000+</option>
            </select>
            {hasFieldError('budget') && (
              <p className="mt-1 text-sm text-red-500">{getFieldErrorMessage('budget')}</p>
            )}
          </div>

          {/* Timeline Field */}
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium mb-2">
              Project Timeline *
            </label>
            <select
              id="timeline"
              name="timeline"
              value={formState.data.timeline}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field ${hasFieldError('timeline') ? 'ring-2 ring-red-500' : ''}`}
              disabled={formState.isSubmitting}
            >
              <option value="">Select a timeline...</option>
              <option value="asap">ASAP (1-2 weeks)</option>
              <option value="month">Within a month</option>
              <option value="quarter">Within 3 months</option>
              <option value="flexible">Flexible</option>
            </select>
            {hasFieldError('timeline') && (
              <p className="mt-1 text-sm text-red-500">{getFieldErrorMessage('timeline')}</p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Project Details *
            </label>
            <textarea
              id="message"
              name="message"
              value={formState.data.message}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`input-field min-h-32 ${hasFieldError('message') ? 'ring-2 ring-red-500' : ''}`}
              placeholder="Tell us about your project, goals, and any specific requirements..."
              disabled={formState.isSubmitting}
              rows={6}
            />
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formState.data.message.length} / 5000 characters
            </p>
            {hasFieldError('message') && (
              <p className="mt-1 text-sm text-red-500">{getFieldErrorMessage('message')}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={formState.isSubmitting || hasErrors(formState.errors)}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formState.isSubmitting ? 'Submitting...' : 'Send Inquiry'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormState({
                  data: initialFormData,
                  errors: [],
                  isSubmitting: false,
                  touched: {},
                });
              }}
              disabled={formState.isSubmitting}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>

          {/* reCAPTCHA Notice */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
            This site is protected by reCAPTCHA and the Google
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline ml-1">
              Privacy Policy
            </a>
            and
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline ml-1">
              Terms of Service
            </a>
            apply.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
