import { ApiBody } from '@/types/api';
import { auth } from '@/utils/auth';
import { z } from 'zod';
import { SignInBody } from '../actions/auth.actions';
import { passwordSchema } from './shared.schema';

const nameSchema = z
  .string()
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Must be at most 50 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Can only contain letters, spaces, hyphens, and apostrophes'
  );

export const signUpUserSchema = z
  .object({
    name: z.string(),
    firstName: nameSchema,
    lastName: nameSchema,
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters'),
    email: z.email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((val) => /[A-Z]/.test(val), 'Must contain an uppercase letter')
      .refine((val) => /[a-z]/.test(val), 'Must contain a lowercase letter')
      .refine((val) => /[0-9]/.test(val), 'Must contain a number')
      .refine(
        (val) => /[!@#$%^&*]/.test(val),
        'Must contain a special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    image: z.string().optional(),
    callbackURL: z.string().optional(),
    rememberMe: z.boolean().optional(),
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

export type SignUpUserValues = z.input<typeof signUpUserSchema>;

export const signInUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<SignInBody>;

export type SignInUserValues = z.infer<typeof signInUserSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit verification code'),
});

export type OTPSchemaValues = z.infer<typeof otpSchema>;

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
 * Change Password (unauthenticated user)
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
