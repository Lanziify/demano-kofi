"use server";

import { APP_ROLES } from "@/lib/auth/roles";
import { actionErrorParser } from "@/lib/errors/action-error-parser";
import { safeCatch } from "@/lib/errors/safe-catch";
import { ApiBody } from "@/types/api";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { AuthRepository } from "../repository/auth.repository";
import { UserRepository } from "../repository/user.repository";
import { SignUpUserValues } from "../schema/auth.schema";
import { AuthService } from "../service/auth.service";

export type SignUpBody = ApiBody<typeof auth.api.signUpEmail>;
export type SignInBody = ApiBody<typeof auth.api.signInUsername>;

export async function signUpAdminAction(values: SignUpBody) {
  const repository = new UserRepository();

  return await safeCatch(
    async () => {
      const response = await auth.api.signUpEmail({
        body: values,
      });

      await repository.setUserRole(response.user.id, APP_ROLES.admin);

      return response;
    },
    { parser: actionErrorParser },
  );
}

export const signUpUserAction = async (values: SignUpUserValues) => {
  const repository = new UserRepository();

  const { firstName, lastName, confirmPassword, ...transformedValues } = values;

  const userResult = await safeCatch(
    async () => {
      return await auth.api.signUpEmail({
        body: {
          ...transformedValues,
          name: `${firstName} ${lastName}`,
        },
      });
    },
    { parser: actionErrorParser },
  );

  // if (!userResult.data || userResult.error) {
  //   // TODO: or maybe throw the custom error?
  //   return userResult;
  // }

  if (userResult.data?.user.id) {
    const userProfileResult = await safeCatch(
      async () => {
        const result = await repository.createUserProfile(
          userResult.data.user.id,
          { firstName, lastName },
        );

        console.log(result);

        return result;
      },
      { parser: actionErrorParser },
    );

    console.log(userProfileResult);
  }

  // if (userProfileResult.error) {
  //   await auth.api.removeUser({ body: { userId: userResult.data.user.id } });
  // }

  return userResult;
};

export const signInUserAction = async (values: SignInBody) => {
  return await safeCatch(
    async () => {
      return await auth.api.signInUsername({
        body: values,
      });
    },
    { parser: actionErrorParser },
  );
};

export const signOutUserAction = async () => {
  return await safeCatch(
    async () => {
      return await auth.api.signOut({
        headers: await headers(),
      });
    },
    { parser: actionErrorParser },
  );
};

export const verifyEmailOTPExistenceAction = async (email: string) => {
  const repository = new AuthRepository();
  const service = new AuthService(repository);

  return await safeCatch(
    async () => {
      const result = await service.getPendingAccountVerification(email);

      console.log(result);

      return result;
    },
    { parser: actionErrorParser },
  );
};

export type VerifyEmailOTPBody = ApiBody<typeof auth.api.checkVerificationOTP>;

export const verifyEmailOTPAction = async (values: VerifyEmailOTPBody) => {
  return await safeCatch(
    async () => {
      const checkResult = await auth.api.checkVerificationOTP({ body: values });

      if (checkResult.success) {
        return await auth.api.verifyEmailOTP({
          body: {
            email: values.email,
            otp: values.otp,
          },
        });
      }
    },
    { parser: actionErrorParser },
  );
};

export type SendVerificationOTPBody = ApiBody<
  typeof auth.api.sendVerificationOTP
>;

export const sendVerificationOTPAction = async (
  values: SendVerificationOTPBody,
) => {
  return await safeCatch(
    async () => {
      return await auth.api.sendVerificationOTP({ body: values });
    },
    { parser: actionErrorParser },
  );
};
