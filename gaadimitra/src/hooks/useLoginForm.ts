import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { validateIndianPhoneNumber, validatePassword, formatPhoneNumber } from '../utils/validation';
import { AuthResponse, ValidationError } from '../types/auth';

interface UseLoginFormProps {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (errorMessage: string) => void;
}

export const useLoginForm = ({ onSuccess, onError }: UseLoginFormProps = {}) => {
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});
  const [isLoading, setIsLoading] = useState(false);

  // Update phone number with real-time formatting and validation clearing
  const handlePhoneChange = useCallback((rawText: string) => {
    // Strip non-digits
    const numeric = rawText.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(numeric);

    setErrors(prev => {
      if (!prev.phoneNumber) return prev;
      return { ...prev, phoneNumber: undefined };
    });
  }, []);

  // Update password and clear error if typing
  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setErrors(prev => {
      if (!prev.password) return prev;
      return { ...prev, password: undefined };
    });
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  // Validate form fields
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationError = {};

    const phoneValidation = validateIndianPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phoneNumber = phoneValidation.error;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [phoneNumber, password]);

  // Submit login credentials
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.loginWithPhone({
        countryCode,
        phoneNumber,
        password,
      });

      if (response.success) {
        onSuccess?.(response);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed. Please check your credentials and try again.';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode, phoneNumber, password, validateForm, onSuccess, onError]);

  // Social login submission
  const handleSocialLogin = useCallback(async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.loginWithSocial(provider);
      if (response.success) {
        onSuccess?.(response);
      }
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to sign in with ${provider}`;
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  return {
    countryCode,
    setCountryCode,
    phoneNumber,
    formattedPhoneNumber: formatPhoneNumber(phoneNumber),
    password,
    isPasswordVisible,
    errors,
    isLoading,
    handlePhoneChange,
    handlePasswordChange,
    togglePasswordVisibility,
    handleSubmit,
    handleSocialLogin,
  };
};
