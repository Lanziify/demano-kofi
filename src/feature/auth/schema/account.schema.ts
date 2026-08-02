import { z } from 'zod';
import type { ApiBody } from '@/types/api';
import type { auth } from '@/utils/auth';
import {
  passwordSchema,
  passwordWithConfirmationSchema,
} from './shared.schema';

/**
 * Username update
 */
export const usernameUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters'),
});

export type UsernameUpdateSchemaValues = z.infer<typeof usernameUpdateSchema>;

/**
 * Base
 */
export const emailChangeFormSchema = z
  .object({
    email: z.email('Please enter a valid email address'),
    confirmEmail: z
      .email('Please enter a valid email address')
      .min(1, 'Please confirm your new email address'),
  })
  .superRefine(({ email, confirmEmail }, ctx) => {
    if (email !== confirmEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email do not match',
        path: ['confirmEmail'],
      });
    }
  });

export type EmailChangeFormSchemaValues = z.infer<typeof emailChangeFormSchema>;

export const changeEmailSchema = z.object({
  newEmail: z.email('Please enter a valid email address'),
  callbackURL: z.string().optional(),
}) satisfies z.ZodType<ApiBody<typeof auth.api.changeEmail>>;

export type ChangeEmailSchemaValues = z.infer<typeof changeEmailSchema>;

/**
 * Password change (authenticated user)
 */
export const passwordUpdateSchema = z
  .object({
    currentPassword: passwordSchema,
  })
  .extend(passwordWithConfirmationSchema.shape);

export type PasswordUpdateSchemaValues = z.infer<typeof passwordUpdateSchema>;
