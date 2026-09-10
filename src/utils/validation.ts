// src/utils/validation.ts

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Phone is required';
  const cleaned = phone.replace(/[\s\-()+]/g, '');
  if (!/^\d{10,15}$/.test(cleaned)) {
    return 'Phone must be 10-15 digits';
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 100) return 'Name is too long';
  if (!/^[a-zA-Z\s.'\-]+$/.test(name)) {
    return 'Name can only contain letters, spaces, dots, hyphens, and apostrophes';
  }
  return null;
}

export function validateAge(age: number | string): string | null {
  const n = typeof age === 'string' ? parseInt(age, 10) : age;
  if (isNaN(n)) return 'Age is required';
  if (n < 0) return 'Age cannot be negative';
  if (n > 120) return 'Age cannot exceed 120';
  return null;
}

export function validateRequired(value: string, field: string): string | null {
  if (!value || !value.trim()) return `${field} is required`;
  return null;
}

export function validateMinLength(
  value: string,
  min: number,
  field: string
): string | null {
  if (!value || value.trim().length < min) {
    return `${field} must be at least ${min} characters`;
  }
  return null;
}

export function validateMaxLength(
  value: string,
  max: number,
  field: string
): string | null {
  if (value && value.length > max) {
    return `${field} must be less than ${max} characters`;
  }
  return null;
}

export function validateDate(
  date: string,
  allowPast = false
): string | null {
  if (!date) return 'Date is required';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return 'Date cannot be in the past';
  }
  return null;
}

/**
 * Runs multiple validators and returns the first error.
 * Returns null if all pass.
 */
export function runValidators(
  ...validators: (() => string | null)[]
): string | null {
  for (const v of validators) {
    const err = v();
    if (err) return err;
  }
  return null;
}