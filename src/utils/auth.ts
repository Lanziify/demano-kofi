import { betterAuth } from 'better-auth';
import { admin, organization, username } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
import { platformAccessControl, appRoles } from '@/lib/auth/permissions';
import { transporter } from './email';
import { render } from "react-email";
import { VerificationEmail } from '@/templates/email'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const verificationEmail = await render(VerificationEmail({user, url}));

      await transporter.sendMail({
        from: process.env.ADMIN_FROM!,
        to: user.email,
        subject: 'Verify your email',
        html: verificationEmail,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorizationParams: {
        prompt: 'select_account',
      },
    },
  },
  database: {
    db: db,
    type: 'postgres',
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session if older than this
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - cache the session lookup for 5 minutes
    },
  },
  plugins: [
    admin({
      ac: platformAccessControl,
      roles: appRoles,
    }),
    organization({}),
    username(),
    nextCookies(),
  ],
});

export type AuthType = typeof auth.$Infer;
