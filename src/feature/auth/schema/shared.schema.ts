import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Must be at most 50 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Can only contain letters, spaces, hyphens, and apostrophes'
  );

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((val) => /[A-Z]/.test(val), 'Must contain an uppercase letter')
  .refine((val) => /[a-z]/.test(val), 'Must contain a lowercase letter')
  .refine((val) => /[0-9]/.test(val), 'Must contain a number')
  .refine((val) => /[!@#$%^&*]/.test(val), 'Must contain a special character');

/**
 * Password with Confirmation
 */
export const passwordWithConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export type PasswordWithConfirmationSchemaValues = z.infer<
  typeof passwordWithConfirmationSchema
>;
