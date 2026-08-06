import { z } from 'zod';

/** Mirrors createUserSchema's body in sentinel-backend/src/validations/user.validation.js. */
export const registerMemberSchema = z.object({
  fullname: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be at most 100 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});
