import type { User } from 'better-auth';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';

type ResetPasswordEmailProps = {
  user: User;
  url: string;
};

export function ResetPasswordEmail({ user, url }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>

      <Tailwind>
        <Body className="bg-slate-100 py-10 font-sans">
          <Container className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white">
            {/* Header */}
            <Section className="rounded-t-xl bg-slate-900 px-8 py-10">
              <Heading className="m-0 text-center text-3xl font-bold text-white">
                Reset your password
              </Heading>
            </Section>

            {/* Content */}
            <Section className="px-8 py-10">
              <Text className="text-base text-slate-700">Hi {user.name},</Text>

              <Text className="text-base leading-7 text-slate-700">
                We received a request to reset the password for your account.
                Click the button below to create a new password.
              </Text>

              {/* CTA */}
              <Section className="my-8 text-center">
                <Button
                  href={url}
                  className="rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white no-underline"
                >
                  Reset Password
                </Button>
              </Section>

              <Text className="text-sm leading-6 text-slate-500">
                This link will expire in <strong>30 minutes</strong>.
              </Text>

              <Text className="mt-6 text-sm leading-6 text-slate-500">
                If the button doesn't work, copy and paste this URL into your
                browser:
              </Text>

              <Text className="text-sm break-all text-slate-700">{url}</Text>

              <Hr className="my-8 border-slate-200" />

              <Text className="text-xs leading-6 text-slate-500">
                If you didn't request a password reset, you can safely ignore
                this email. Your password won't be changed unless you use the
                link above.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
