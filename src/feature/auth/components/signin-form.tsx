"use client";

import { ScreenLoader } from "@/components/custom/screen-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { signInUserSchema, SignInUserValues } from "../schema/auth.schema";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL");
  const { isLoading, signIn } = useAuthStore();
  const { theme } = useTheme();

  const signUpLink = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL!}/signup`);

  if (callbackURL) {
    signUpLink.searchParams.append("callbackURL", callbackURL);
  }

  const { control, handleSubmit } = useForm<SignInUserValues>({
    resolver: zodResolver(signInUserSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
      callbackURL: callbackURL || "",
    },
  });

  async function onSubmit(values: SignInUserValues) {
    const { error } = await signIn(values);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed in successfully");
    router.replace(callbackURL ?? "/dashboard");
  }

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your <strong>Demano-Kofi</strong> account
                </p>
              </div>

              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      {...field}
                      placeholder="username"
                      autoComplete="new-username"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button type="submit">Sign In</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href={signUpLink.toString()}>Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:flex md:items-center md:justify-center">
            <div className="h-48 w-48">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={theme === "light" ? "#000000" : "#ffff"}
                width="100%"
                height="100%"
                viewBox="0 0 48 48"
              >
                <path d="M12.664062 4.0644531C10.733436 3.9724031 9.4312803 6.2487539 10.4375 7.8789062C10.4375 7.8789062 10.4375 7.8808594 10.4375 7.8808594L13.861328 13.673828L7.3691406 33.191406 A 1.50015 1.50015 0 0 0 7.3652344 33.205078C5.8221031 38.005535 9.463671 43 14.505859 43L33.484375 43C38.527324 43 42.168135 38.00553 40.625 33.205078 A 1.50015 1.50015 0 0 0 40.621094 33.191406L34.462891 14.650391 A 1.50015 1.50015 0 0 0 34.560547 14.560547L37.6875 11.433594C38.138623 11.785314 38.707718 12.286991 39.328125 13.0625C40.645287 14.708953 42 17.333333 42 21.5 A 1.50015 1.50015 0 1 0 45 21.5C45 16.666667 43.354713 13.291047 41.671875 11.1875C39.989037 9.083953 38.169922 8.1582031 38.169922 8.1582031 A 1.50015 1.50015 0 0 0 36.439453 8.4394531L34.011719 10.867188L34.011719 9.2695312C34.011719 7.5144483 32.688976 6.0084784 30.947266 5.7949219C21.106626 4.5881646 15.374812 4.1935848 12.664062 4.0644531 z M 13.490234 7.1523438C16.282253 7.2986664 21.327227 7.636568 30.582031 8.7714844C30.83032 8.8019284 31.011719 9.0006144 31.011719 9.2695312L31.011719 12L16.355469 12L13.490234 7.1523438 z M 16.582031 15L31.417969 15L34.40625 24L18.083984 24C17.214984 24 16.445687 24.561672 16.179688 25.388672L13.076172 35.039062C12.871172 35.675063 12.282438 36.082031 11.648438 36.082031C11.496438 36.082031 11.341453 36.058766 11.189453 36.009766C10.40369 35.756808 9.9714093 34.918034 10.21875 34.132812C10.219573 34.130198 10.219865 34.127613 10.220703 34.125L10.220703 34.123047L16.582031 15 z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
