import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks';
import {
  validateEmail,
  validatePasswordStrength,
  validateFieldMatch,
} from '@/utils/formValidation';
import { createErrorNotification, formatErrorMessage } from '@/utils/formUtils';
import { uiActions } from '@store/slices/uiSlice';

interface SignupFormProps {
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isSubmitting: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  errors: Record<string, string>;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { signup } = useAuth();

  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isSubmitting: false,
    showPassword: false,
    showConfirmPassword: false,
    errors: {},
  });

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: '',
      },
    }));
  }, []);

  /**
   * Validate form
   */
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!formState.name.trim()) {
      errors.name = 'Name is required';
    } else if (formState.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Validate email
    const emailError = validateEmail(formState.email);
    if (emailError) {
      errors.email = emailError.message;
    }

    // Validate password strength
    const passwordError = validatePasswordStrength(formState.password);
    if (passwordError) {
      errors.password = passwordError.message;
    }

    // Validate password match
    const matchError = validateFieldMatch(
      formState.password,
      formState.confirmPassword,
      'Password'
    );
    if (matchError) {
      errors.confirmPassword = matchError.message;
    }

    setFormState((prev) => ({
      ...prev,
      errors,
    }));

    return Object.keys(errors).length === 0;
  }, [formState.name, formState.email, formState.password, formState.confirmPassword]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
      }));

      try {
        const result = await signup(formState.email, formState.password, formState.name);

        if (!result.success) {
          throw new Error(result.error || 'Sign up failed');
        }

        dispatch(
          uiActions.addNotification({
            id: `signup-${Date.now()}`,
            type: 'success',
            message: 'Account created successfully!',
            duration: 5000,
          })
        );

        onSuccess?.();
      } catch (err) {
        const errorMessage = formatErrorMessage(err instanceof Error ? err : new Error('Sign up failed'));

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
    [validateForm, formState.email, formState.password, formState.name, signup, dispatch, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formState.name}
          onChange={handleInputChange}
          className={`input-field ${formState.errors.name ? 'ring-2 ring-red-500' : ''}`}
          placeholder="John Doe"
          disabled={formState.isSubmitting}
          autoComplete="name"
        />
        {formState.errors.name && (
          <p className="mt-1 text-sm text-red-500">{formState.errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formState.email}
          onChange={handleInputChange}
          className={`input-field ${formState.errors.email ? 'ring-2 ring-red-500' : ''}`}
          placeholder="your@email.com"
          disabled={formState.isSubmitting}
          autoComplete="email"
        />
        {formState.errors.email && (
          <p className="mt-1 text-sm text-red-500">{formState.errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={formState.showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
            className={`input-field pr-10 ${formState.errors.password ? 'ring-2 ring-red-500' : ''}`}
            placeholder="••••••••"
            disabled={formState.isSubmitting}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                showPassword: !prev.showPassword,
              }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {formState.showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {formState.errors.password && (
          <p className="mt-1 text-sm text-red-500">{formState.errors.password}</p>
        )}
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          At least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={formState.showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleInputChange}
            className={`input-field pr-10 ${formState.errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`}
            placeholder="••••••••"
            disabled={formState.isSubmitting}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                showConfirmPassword: !prev.showConfirmPassword,
              }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {formState.showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {formState.errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{formState.errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default SignupForm;
