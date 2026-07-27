import { User } from "better-auth";
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

type ChangeEmailVerificationProps = {
  user: User | null;
  url: string | null;
};

export function ChangeEmailVerification({
  user,
  url,
}: ChangeEmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your new email address</Preview>

      <Tailwind>
        <Body className="bg-slate-100 py-10 font-sans">
          <Container className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white">
            <Section className="rounded-t-xl bg-slate-900 px-8 py-10">
              <Heading className="m-0 text-center text-3xl font-bold text-white">
                Verify your new email
              </Heading>
            </Section>

            <Section className="px-8 py-10">
              <Text className="text-base text-slate-700">Hi {user?.name},</Text>

              <Text className="text-base leading-7 text-slate-700">
                We received a request to change the email address associated
                with your account.
              </Text>

              <Text className="text-base leading-7 text-slate-700">
                To complete the change, please verify that you own this email
                address by clicking the button below.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={url ?? ""}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white no-underline"
                >
                  Verify New Email
                </Button>
              </Section>

              <Text className="text-sm text-slate-500">
                This verification link expires in <strong>30 minutes</strong>.
              </Text>

              <Hr className="my-8 border-slate-200" />

              <Text className="text-xs leading-6 text-slate-500">
                If you requested this email change, no further action is needed
                after verifying your new email address.
              </Text>

              <Text className="mt-4 text-xs leading-6 text-slate-500">
                If you didn't request this change, you can safely ignore this
                email. Your account's email address will remain unchanged unless
                this verification is completed.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
