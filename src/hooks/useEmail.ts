import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import emailjs from '@emailjs/browser';
import type { ContactFormSubmission, ServiceResponse } from '@/types';
import { uiActions } from '@store/slices/uiSlice';

/**
 * Initialize EmailJS service (called once at app startup)
 */
export const initializeEmailJS = (): void => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!publicKey) {
    console.warn('EmailJS public key not found. Email notifications will not work.');
    return;
  }
  emailjs.init(publicKey);
};

/**
 * Custom hook for EmailJS email operations
 * Handles sending emails for form submissions and notifications
 */
export const useEmail = () => {
  const dispatch = useDispatch();

  /**
   * Send form submission notification email
   */
  const sendSubmissionEmail = useCallback(
    async (submission: ContactFormSubmission): Promise<ServiceResponse<null>> => {
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const toEmail = import.meta.env.VITE_EMAILJS_TO_EMAIL;

        if (!serviceId || !templateId || !toEmail) {
          console.warn(
            'EmailJS service not properly configured. ' +
            'Please check your .env.local file for VITE_EMAILJS_* variables.'
          );
          return {
            success: false,
            error: 'Email service not configured',
          };
        }

        const templateParams = {
          from_name: submission.name,
          from_email: submission.email,
          company: submission.company || 'Not specified',
          project_type: submission.projectType,
          budget: submission.budget,
          timeline: submission.timeline,
          message: submission.message,
          to_email: toEmail,
          submission_id: submission.id || 'new',
          submission_date: new Date(submission.timestamp).toLocaleDateString(),
        };

        const response = await emailjs.send(serviceId, templateId, templateParams);

        if (response.status === 200) {
          // Show success notification
          const notificationId = `email-${Date.now()}`;
          dispatch(
            uiActions.addNotification({
              id: notificationId,
              type: 'success',
              message: 'Email sent successfully',
              duration: 5000,
            })
          );

          return {
            success: true,
            message: 'Submission email sent successfully',
          };
        }

        throw new Error('Failed to send email');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send email';

        // Show error notification
        const notificationId = `email-error-${Date.now()}`;
        dispatch(
          uiActions.addNotification({
            id: notificationId,
            type: 'error',
            message: 'Failed to send email notification',
            duration: 5000,
          })
        );

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [dispatch]
  );

  /**
   * Send custom email to user
   */
  const sendCustomEmail = useCallback(
    async (
      recipientEmail: string,
      subject: string,
      message: string,
      templateVariables: Record<string, string> = {}
    ): Promise<ServiceResponse<null>> => {
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

        if (!serviceId || !templateId) {
          return {
            success: false,
            error: 'Email service not configured',
          };
        }

        const baseParams = {
          to_email: recipientEmail,
          subject,
          message,
          ...templateVariables,
        };

        const response = await emailjs.send(serviceId, templateId, baseParams);

        if (response.status === 200) {
          return {
            success: true,
            message: 'Email sent successfully',
          };
        }

        throw new Error('Failed to send email');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send email';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    []
  );

  /**
   * Send email to admin with submission details
   */
  const sendAdminNotification = useCallback(
    async (submission: ContactFormSubmission): Promise<ServiceResponse<null>> => {
      try {
        const adminResult = await sendSubmissionEmail(submission);
        if (!adminResult.success) {
          throw new Error(adminResult.error || 'Failed to send admin notification');
        }

        return {
          success: true,
          message: 'Admin notification sent successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send admin notification';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [sendSubmissionEmail]
  );

  /**
   * Send confirmation email to user
   */
  const sendConfirmationEmail = useCallback(
    async (submission: ContactFormSubmission): Promise<ServiceResponse<null>> => {
      try {
        const message = `Thank you for reaching out! We've received your inquiry and will get back to you within 24 hours.

Project Type: ${submission.projectType}
Budget Range: ${submission.budget}
Timeline: ${submission.timeline}

Best regards,
RNDM Development Team`;

        const result = await sendCustomEmail(
          submission.email,
          'We received your inquiry',
          message,
          {
            from_name: 'RNDM Development',
          }
        );

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send confirmation email';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [sendCustomEmail]
  );

  return {
    // Actions
    sendSubmissionEmail,
    sendCustomEmail,
    sendAdminNotification,
    sendConfirmationEmail,
  };
};

export default useEmail;
