import z from 'zod';
import { SignInEmailBody, SignUpEmailBody } from '../actions/auth.actions';

export const signUpUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  image: z.string().optional(),
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<SignUpEmailBody>;

export type SignUpEmailValues = z.infer<typeof signUpUserSchema>;

export const signInUserSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<SignInEmailBody>;

export type SignInEmailPasswordValues = z.infer<typeof signInUserSchema>;
