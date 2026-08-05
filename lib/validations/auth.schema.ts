import { z } from 'zod';

/**
 * Mirrors the backend rules in sentinel-backend/src/validations/auth.validation.js.
 * Keep the two in step — the server is the authority, this only saves a round trip.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  });

export const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ValidationResult<T> =
  | { success: true; data: T; errors: Record<string, string> }
  | { success: false; data: null; errors: Record<string, string> };

/** Returns the first message per field, which is all the inputs can show. */
export function validateForm<T>(
  schema: z.ZodType<T>,
  formData: unknown
): ValidationResult<T> {
  const result = schema.safeParse(formData);

  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '');
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { success: false, data: null, errors };
}
