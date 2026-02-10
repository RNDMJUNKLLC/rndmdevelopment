import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks';
import { validateEmail } from '@/utils/formValidation';
import { createErrorNotification, formatErrorMessage } from '@/utils/formUtils';
import { uiActions } from '@store/slices/uiSlice';

interface LoginFormProps {
  onSuccess?: () => void;
}

interface FormState {
  email: string;
  password: string;
  isSubmitting: boolean;
  showPassword: boolean;
  errors: Record<string, string>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { signin } = useAuth();

  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    isSubmitting: false,
    showPassword: false,
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

    const emailError = validateEmail(formState.email);
    if (emailError) {
      errors.email = emailError.message;
    }

    if (!formState.password) {
      errors.password = 'Password is required';
    }

    setFormState((prev) => ({
      ...prev,
      errors,
    }));

    return Object.keys(errors).length === 0;
  }, [formState.email, formState.password]);

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
        const result = await signin(formState.email, formState.password);

        if (!result.success) {
          throw new Error(result.error || 'Sign in failed');
        }

        dispatch(
          uiActions.addNotification({
            id: `signin-${Date.now()}`,
            type: 'success',
            message: 'Signed in successfully',
            duration: 5000,
          })
        );

        onSuccess?.();
      } catch (err) {
        const errorMessage = formatErrorMessage(err instanceof Error ? err : new Error('Sign in failed'));

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
    [validateForm, formState.email, formState.password, signin, dispatch, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>

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
            autoComplete="current-password"
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
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState.isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
