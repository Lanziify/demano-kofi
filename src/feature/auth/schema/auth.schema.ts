import { z } from "zod";
import { SignInBody, SignUpBody } from "../actions/auth.actions";

const nameSchema = z
  .string()
  .min(2, "Must be at least 2 characters")
  .max(50, "Must be at most 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Can only contain letters, spaces, hyphens, and apostrophes",
  );

export const signUpUserSchema = z
  .object({
    name: z.string(),
    firstName: nameSchema,
    lastName: nameSchema,
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters"),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((val) => /[A-Z]/.test(val), "Must contain an uppercase letter")
      .refine((val) => /[a-z]/.test(val), "Must contain a lowercase letter")
      .refine((val) => /[0-9]/.test(val), "Must contain a number")
      .refine(
        (val) => /[!@#$%^&*]/.test(val),
        "Must contain a special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    image: z.string().optional(),
    callbackURL: z.string().optional(),
    rememberMe: z.boolean().optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignUpUserValues = z.input<typeof signUpUserSchema>;

export const signInUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  callbackURL: z.string().optional(),
  rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<SignInBody>;

export type SignInUserValues = z.infer<typeof signInUserSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit verification code"),
});

export type OTPSchemaValues = z.infer<typeof otpSchema>;
