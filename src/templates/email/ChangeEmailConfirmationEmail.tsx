import { User } from 'better-auth';
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

type ChangeEmailConfirmationEmailProps = {
  user: User | null;
  newEmail: string;
  url: string | null;
};

export function ChangeEmailConfirmationEmail({
  user,
  newEmail,
  url,
}: ChangeEmailConfirmationEmailProps) {
  return (
    <Html>
      <Head />

      <Preview>Confirm your new email address</Preview>

      <Tailwind>
        <Body className="bg-slate-100 py-10 font-sans">
          <Container className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white">
            <Section className="rounded-t-xl bg-slate-900 px-8 py-10">
              <Heading className="m-0 text-center text-3xl font-bold text-white">
                Confirm email change
              </Heading>
            </Section>

            <Section className="px-8 py-10">
              <Text className="text-base text-slate-700">Hi {user?.name},</Text>

              <Text className="text-base leading-7 text-slate-700">
                We received a request to change the email address associated
                with your account.
              </Text>

              <Text className="text-base leading-7 text-slate-700">
                Your new email address will be:
              </Text>

              <Section className="my-6 rounded-lg bg-slate-100 px-4 py-3 text-center">
                <Text className="m-0 text-base font-semibold text-slate-800">
                  {newEmail}
                </Text>
              </Section>

              <Text className="text-base leading-7 text-slate-700">
                Please confirm this email address by clicking the button below.
                Your email address will only be updated after verification.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={url ?? ''}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white no-underline">
                  Confirm New Email
                </Button>
              </Section>

              <Text className="text-sm text-slate-500">
                This link expires in <strong>30 minutes</strong>.
              </Text>

              <Hr className="my-8 border-slate-200" />

              <Text className="text-xs text-slate-500">
                If you did not request this email change, you can safely ignore
                this message. Your current email address will remain unchanged.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
