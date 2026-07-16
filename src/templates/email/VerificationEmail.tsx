import { AuthType } from '@/utils/auth';
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

type VerificationEmailProps = {
  user: AuthType['Session']['user'] | null;
  url: string | null;
};

export function VerificationEmail ({ user, url }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>

      <Tailwind>
        <Body className="bg-slate-100 py-10 font-sans">
          <Container className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white">
            <Section className="rounded-t-xl bg-slate-900 px-8 py-10">
              <Heading className="m-0 text-center text-3xl font-bold text-white">
                Verify your email
              </Heading>
            </Section>

            <Section className="px-8 py-10">
              <Text className="text-base text-slate-700">Hi {user?.name},</Text>

              <Text className="text-base leading-7 text-slate-700">
                Thanks for creating your account. Please verify your email
                address to continue using our platform.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={url ?? ''}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white no-underline">
                  Verify Email
                </Button>
              </Section>

              <Text className="text-sm text-slate-500">
                This link expires in <strong>30 minutes</strong>.
              </Text>

              <Hr className="my-8 border-slate-200" />

              <Text className="text-xs text-slate-500">
                If you didn't create an account, you can safely ignore this
                email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};