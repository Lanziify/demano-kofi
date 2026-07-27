import { User } from "better-auth";
import { UserWithRole } from "better-auth/plugins";
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
} from "react-email";

type VerificationEmailProps = {
  otp: string;
  email: string;
};

export function VerificationEmail({ otp, email }: VerificationEmailProps) {
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
              <Text className="text-base text-slate-700">Hi!,</Text>

              <Text className="text-base leading-7 text-slate-700">
                Thanks for creating your account. Please enter the verification
                code below to continue.
              </Text>

              {/* OTP Code Display */}
              <Section className="my-8 text-center">
                <Text className="mb-2 text-xs tracking-widest text-slate-500 uppercase">
                  Your Verification Code
                </Text>
                <div className="mx-auto w-fit rounded-lg bg-slate-100 px-6 py-4 font-mono text-4xl font-bold tracking-[0.2em] text-slate-900">
                  {otp}
                </div>
              </Section>

              <Text className="text-sm text-slate-500">
                This code expires in <strong>30 minutes</strong>.
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
}
