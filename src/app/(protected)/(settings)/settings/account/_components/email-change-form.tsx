"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { ReauthenticateDialog } from "@/components/custom/reauthenticate-dialog";
import {
  useUpdateEmailAddress,
  useVerifyUserPassword,
} from "@/feature/auth/mutations/user.mutation";
import {
  emailUpdateSchema,
  type EmailUpdateSchemaValues,
} from "@/feature/auth/schema/account.schema";
import React from "react";
import {
  ResultDialog,
  ResultDialogProps,
} from "@/components/custom/result-dialog";

export default function AccountEmailForm() {
  const [isReauthDialogOpen, setIsReauthDialogOpen] = React.useState(false);
  const [resultDialog, setResultDialog] = React.useState<
    Omit<ResultDialogProps, "onOpenChange">
  >({
    open: false,
    variant: "idle",
    title: "",
    description: "",
    closeText: "",
  });
  const verifyUserPassword = useVerifyUserPassword();
  const updateEmailAddress = useUpdateEmailAddress();

  const form = useForm<EmailUpdateSchemaValues>({
    resolver: zodResolver(emailUpdateSchema),
    defaultValues: {
      email: "",
      confirmEmail: "",
    },
  });

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = form;

  async function onSubmit() {
    setIsReauthDialogOpen(true);
  }

  async function handleEmailChange(password: string) {
    setIsReauthDialogOpen(false);
    setResultDialog({
      open: true,
      variant: "loading",
      title: "Verifying your account",
    });

    const passwordCheckResult = await verifyUserPassword.mutateAsync(password);

    if (!passwordCheckResult?.data && passwordCheckResult.error) {
      setResultDialog({
        open: true,
        variant: "error",
        title: "Could not verify your account",
        description: `Details: ${passwordCheckResult.error.message}`,
        closeText: "Close",
      });

      return;
    }

    const emailUpdateResult = await updateEmailAddress.mutateAsync({
      newEmail: getValues("email"),
      callbackURL: "/verification/email-change-confirmation",
    });

    if (!emailUpdateResult.data && emailUpdateResult.error) {
      setResultDialog({
        open: true,
        variant: "error",
        title: "Something wen't while trying to change your email address",
        description: `Details: ${emailUpdateResult.error.message}`,
        closeText: "Close",
      });

      return;
    }

    setResultDialog({
      open: true,
      variant: "success",
      title: "Verification email sent",
      description:
        "Your email address has been updated. Please check your new email inbox and click the verification link to complete the change.",
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Update the email address associated with your account. A
            verification email may be sent to confirm your new address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="email-change-form" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      New email address
                    </FieldLabel>
                    <Input {...field} placeholder="new@example.com" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmEmail"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm new email
                    </FieldLabel>
                    <Input {...field} placeholder="new@example.com" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="submit"
              form="email-change-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              Update Email
            </Button>
          </Field>
        </CardFooter>
      </Card>
      <ReauthenticateDialog
        open={isReauthDialogOpen}
        onOpenChange={setIsReauthDialogOpen}
        onConfirm={handleEmailChange}
      />
      <ResultDialog
        onOpenChange={(open) => setResultDialog({ ...resultDialog, open })}
        {...resultDialog}
      />
    </>
  );
}
