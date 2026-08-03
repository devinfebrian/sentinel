import { z } from 'zod';

export const staffLoginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Username or Email is required')
    .min(3, 'Username or Email must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 4 characters'),
});

export const adminLoginSchema = staffLoginSchema;

export const teacherLoginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Username or Email is required')
    .min(3, 'Username or Email must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 4 characters'),
});

export const studentLoginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'NISN or System Username is required')
    .min(3, 'Must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 4 characters'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Validate form data using Zod schema
 * Returns { success: boolean, data?: object, errors: Record<string, string> }
 */
export function validateForm(schema, formData) {
  const result = schema.safeParse(formData);
  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0];
    if (fieldName && !errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  });

  return { success: false, errors };
}
