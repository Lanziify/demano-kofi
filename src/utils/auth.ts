import { appRoles, platformAccessControl } from "@/lib/auth/permissions";
import {
  ChangeEmailConfirmationEmail,
  ChangeEmailVerification,
  VerificationEmail,
} from "@/templates/email";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, organization, username } from "better-auth/plugins";
import { render } from "react-email";
import { db } from "./db";
import { transporter } from "./email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        const email = await render(
          ChangeEmailConfirmationEmail({
            user,
            newEmail,
            url,
          }),
        );

        await transporter.sendMail({
          from: process.env.ADMIN_FROM!,
          to: user.email,
          subject: "Confirm email change",
          html: email,
        });
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const template = ChangeEmailVerification({ user, url });

      await transporter.sendMail({
        from: process.env.ADMIN_FROM!,
        to: user.email,
        subject: "Verify your new email address",
        html: await render(template),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorizationParams: {
        prompt: "select_account",
      },
    },
  },
  database: {
    db: db,
    type: "postgres",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session if older than this
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - cache the session lookup for 5 minutes
    },
  },
  verification: {
    additionalFields: {
      resendAvailableAt: {
        type: "date",
        defaultValue: () => new Date(Date.now() + 60_000),
      },
    },
  },
  plugins: [
    admin({
      ac: platformAccessControl,
      roles: appRoles,
    }),
    organization({}),
    username(),
    emailOTP({
      sendVerificationOnSignUp: true,
      allowedAttempts: 5,
      expiresIn: 60 * 30,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const template = VerificationEmail({ email, otp });

          await transporter.sendMail({
            from: process.env.ADMIN_FROM!,
            to: email,
            subject: "Verify your account",
            html: await render(template),
          });
        }
      },
    }),
    nextCookies(),
  ],
});

export type AuthType = typeof auth.$Infer;
