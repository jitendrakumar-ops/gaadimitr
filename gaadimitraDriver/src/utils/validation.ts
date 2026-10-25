/**
 * Indian mobile number format validation:
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
 */
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a given Indian mobile number string
 */
export const validateIndianPhoneNumber = (phone: string): ValidationResult => {
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  if (!cleanPhone) {
    return {
      isValid: false,
      error: 'Please enter your mobile number',
    };
  }

  if (!/^\d+$/.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Mobile number must contain digits only',
    };
  }

  if (cleanPhone.length < 10) {
    return {
      isValid: false,
      error: `Please enter 10 digits (${cleanPhone.length}/10 entered)`,
    };
  }

  if (cleanPhone.length > 10) {
    return {
      isValid: false,
      error: 'Mobile number cannot exceed 10 digits',
    };
  }

  if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Enter a valid Indian mobile number starting with 6, 7, 8, or 9',
    };
  }

  return { isValid: true };
};

/**
 * Validates password strength & requirements
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: 'Please enter your password',
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters long',
    };
  }

  return { isValid: true };
};

/**
 * Formats a 10 digit number with clean space separation: 98765 43210
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 10);
  if (cleaned.length > 5) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return cleaned;
};
