import { z } from 'zod';
import type { ApiBody } from '@/types/api';
import type { auth } from '@/utils/auth';
import {
  nameSchema,
  passwordSchema,
  passwordWithConfirmationSchema,
} from './shared.schema';
/**
 * Signup Email
 */
export const signUpEmailSchema = z.object({
  name: z.string(),
  email: z.email(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters'),
  password: passwordSchema,
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<ApiBody<typeof auth.api.signUpEmail>>;

export type SignUpEmailSchemaValues = z.infer<typeof signUpEmailSchema>;

/**
 * Signup
 */
export const signUpSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
  })
  .extend(signUpEmailSchema.shape)
  .extend(passwordWithConfirmationSchema.shape)
  .transform((data) => ({
    ...data,
    name: `${data.firstName} ${data.lastName}`.trim(),
  }));

export type SignUpSchemaValues = z.infer<typeof signUpSchema>;

/**
 * Signin
 */
export const signInSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<ApiBody<typeof auth.api.signInUsername>>;

export type SignInSchemaValues = z.infer<typeof signInSchema>;

/**
 * Verify OTP
 */
export const verifyEmailOTPSchema = z.object({
  email: z.email('Please enter a valid email address'),
  otp: z.string().length(6, 'Enter the 6-digit verification code'),
}) satisfies z.ZodType<ApiBody<typeof auth.api.verifyEmailOTP>>;

export type VerifyEmailOTPSchemaValues = z.infer<typeof verifyEmailOTPSchema>;

/**
 * Send Verify OTP
 */
export const sendVerificationOTPSchema = z.object({
  email: z.email('Please enter a valid email address'),
  type: z.enum({
    'sign-in': 'sign-in',
    'change-email': 'change-email',
    'email-verification': 'email-verification',
    'forget-password': 'forget-password',
  }),
}) satisfies z.ZodType<ApiBody<typeof auth.api.sendVerificationOTP>>;

export type SendVerificationOTPSchemaValues = z.infer<
  typeof sendVerificationOTPSchema
>;

/**
 * Change Password (authenticated user)
 */
export const changePasswordApiSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  revokeOtherSessions: z.boolean().optional(),
}) satisfies z.ZodType<ApiBody<typeof auth.api.changePassword>>;

export type ChangePasswordApiSchemaValues = z.infer<
  typeof changePasswordApiSchema
>;

/**
 * Request Change Password (unauthenticated user)
 */
export const requestPasswordResetSchema = z.object({
  email: z.email('Invalid email address'),
  redirectTo: z.string().optional(),
}) satisfies z.ZodType<ApiBody<typeof auth.api.requestPasswordReset>>;

export type RequestPasswordResetSchemaValues = z.infer<
  typeof requestPasswordResetSchema
>;

/**
 * Reset Password
 */
export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  token: z.string().optional(),
}) satisfies z.ZodType<ApiBody<typeof auth.api.resetPassword>>;

export type ResetPasswordSchemaValues = z.infer<typeof resetPasswordSchema>;

/**
 * Reauthenticate
 */
export const reauthenticateSchema = z.object({
  password: passwordSchema,
});

export type ReauthenticateSchemaValues = z.infer<typeof reauthenticateSchema>;
