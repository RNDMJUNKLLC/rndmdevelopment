import { useCallback, useEffect } from 'react';
import type { reCAPTCHAConfig, ServiceResponse } from '@/types';

/**
 * Load Google reCAPTCHA v3 script
 */
const loadRecaptchaScript = (siteKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script already loaded
    if (typeof window !== 'undefined' && (window as any).grecaptcha) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));

    document.head.appendChild(script);
  });
};

/**
 * Get reCAPTCHA configuration from environment variables
 */
const getRecaptchaConfig = (): reCAPTCHAConfig => {
  return {
    siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
    minimumScore: parseFloat(import.meta.env.VITE_RECAPTCHA_MINIMUM_SCORE || '0.5'),
    enabled: import.meta.env.VITE_RECAPTCHA_ENABLED === 'true',
  };
};

/**
 * Custom hook for Google reCAPTCHA v3 operations
 * Handles spam detection and bot protection for forms
 */
export const useRecaptcha = () => {
  const config = getRecaptchaConfig();

  /**
   * Initialize reCAPTCHA on component mount
   */
  useEffect(() => {
    if (!config.enabled || !config.siteKey) {
      console.warn('reCAPTCHA is not enabled or siteKey is missing. Spam protection disabled.');
      return;
    }

    loadRecaptchaScript(config.siteKey).catch((err) => {
      console.error('Failed to load reCAPTCHA:', err);
    });
  }, [config]);

  /**
   * Execute reCAPTCHA verification
   * Returns a token and the score (0-1, higher = more likely to be human)
   */
  const executeRecaptcha = useCallback(
    async (action: string = 'submit'): Promise<ServiceResponse<{ token: string; score: number }>> => {
      try {
        if (!config.enabled) {
          // Return a dummy token if reCAPTCHA is disabled
          return {
            success: true,
            data: {
              token: 'disabled',
              score: 1.0,
            },
            message: 'reCAPTCHA is disabled',
          };
        }

        if (typeof window === 'undefined' || !(window as any).grecaptcha) {
          throw new Error('reCAPTCHA not loaded');
        }

        // Execute reCAPTCHA v3
        const token = await (window as any).grecaptcha.execute(config.siteKey, { action });

        // Note: Score is not returned by v3 client-side.
        // You need to verify the token server-side to get the score.
        return {
          success: true,
          data: {
            token,
            score: 0.5, // Default score - should be verified server-side
          },
          message: 'reCAPTCHA token generated successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'reCAPTCHA verification failed';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [config.enabled, config.siteKey]
  );

  /**
   * Verify reCAPTCHA token server-side
   * This should be called from your backend
   */
  const verifyToken = useCallback(
    async (token: string, secretKey: string): Promise<ServiceResponse<{ score: number; action: string }>> => {
      try {
        if (token === 'disabled') {
          // Skip verification if reCAPTCHA is disabled
          return {
            success: true,
            data: {
              score: 1.0,
              action: 'submit',
            },
            message: 'reCAPTCHA verification skipped (disabled)',
          };
        }

        // This is a client-side function that calls your backend
        // In real implementation, this should be handled server-side
        const response = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            secretKey,
          }),
        });

        if (!response.ok) {
          throw new Error('Server verification failed');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Token verification failed');
        }

        return {
          success: true,
          data: {
            score: data.score,
            action: data.action,
          },
          message: 'reCAPTCHA token verified successfully',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'reCAPTCHA verification failed';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    []
  );

  /**
   * Check if a score passes the minimum threshold
   */
  const isScoreValid = useCallback(
    (score: number): boolean => {
      return score >= config.minimumScore;
    },
    [config.minimumScore]
  );

  /**
   * Check if reCAPTCHA is properly configured
   */
  const isConfigured = useCallback((): boolean => {
    return config.enabled && !!config.siteKey;
  }, [config.enabled, config.siteKey]);

  return {
    // State
    config,

    // Actions
    executeRecaptcha,
    verifyToken,
    isScoreValid,
    isConfigured,
  };
};

export default useRecaptcha;
