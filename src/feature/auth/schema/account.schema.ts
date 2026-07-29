import { ApiBody } from '@/types/api';
import { auth } from '@/utils/auth';
import { z } from 'zod';

export const usernameUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters'),
});

export type UsernameUpdateSchemaValues = z.infer<typeof usernameUpdateSchema>;

export const emailUpdateSchema = z
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

export type EmailUpdateSchemaValues = z.infer<typeof emailUpdateSchema>;

export const changeEmailSchema = z.object({
  newEmail: z.email('Please enter a valid email address'),
  callbackURL: z.string().optional(),
}) satisfies z.ZodType<ApiBody<typeof auth.api.changeEmail>>;

export type ChangeEmailSchemaValues = z.infer<typeof changeEmailSchema>;

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((val) => /[A-Z]/.test(val), 'Must contain an uppercase letter')
  .refine((val) => /[a-z]/.test(val), 'Must contain a lowercase letter')
  .refine((val) => /[0-9]/.test(val), 'Must contain a number')
  .refine((val) => /[!@#$%^&*]/.test(val), 'Must contain a special character');

export const passwordUpdateSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your password'),
  })
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
      });
    }
  });

export type PasswordUpdateSchemaValues = z.infer<typeof passwordUpdateSchema>;

export const reauthenticateSchema = z.object({
  password: passwordSchema,
});

export type ReauthenticateSchemaValues = z.infer<typeof reauthenticateSchema>;

export const changePasswordApiSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  revokeOtherSessions: z.boolean().optional(),
}) as z.ZodType<ApiBody<typeof auth.api.changePassword>>;

export type ChangePasswordApiSchemaValues = z.infer<typeof changePasswordApiSchema>
