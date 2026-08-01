'use server';

import { actionErrorParser } from '@/lib/errors/action-error-parser';
import { safeCatch } from '@/lib/errors/safe-catch';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';
import { AuthRepository } from '../repository/auth.repository';
import { UserRepository } from '../repository/user.repository';
import {
  requestPasswordResetSchema,
  RequestPasswordResetSchemaValues,
  resetPasswordSchema,
  ResetPasswordSchemaValues,
  sendVerificationOTPSchema,
  SendVerificationOTPSchemaValues,
  SignInSchemaValues,
  signUpEmailSchema,
  SignUpSchemaValues,
  verifyEmailOTPSchema,
  VerifyEmailOTPSchemaValues,
} from '../schema/auth.schema';
import { AuthService } from '../service/auth.service';

// export async function signUpAdminAction(values: SignUpBody) {
//   const repository = new UserRepository();

//   return await safeCatch(
//     async () => {
//       const response = await auth.api.signUpEmail({
//         body: values,
//       });

//       await repository.setUserRole(response.user.id, APP_ROLES.admin);

//       return response;
//     },
//     { parser: actionErrorParser }
//   );
// }

export const signUpUserAction = async (values: SignUpSchemaValues) => {
  const repository = new UserRepository();

  const { firstName, lastName } = values;

  const userResult = await safeCatch(
    async () => {
      const parsedValues = signUpEmailSchema.parse(values);

      const { user } = await auth.api.signUpEmail({
        body: parsedValues,
      });

      await repository.createUserProfile(user?.id, {
        firstName,
        lastName,
      });

      return user;
    },
    { parser: actionErrorParser }
  );

  return userResult;
};

export const signInUserAction = async (values: SignInSchemaValues) => {
  return await safeCatch(
    async () => {
      return await auth.api.signInUsername({
        body: values,
      });
    },
    { parser: actionErrorParser }
  );
};

export const signOutUserAction = async () => {
  return await safeCatch(
    async () => {
      return await auth.api.signOut({
        headers: await headers(),
      });
    },
    { parser: actionErrorParser }
  );
};

export const verifyEmailOTPExistenceAction = async (email: string) => {
  const repository = new AuthRepository();
  const service = new AuthService(repository);

  return await safeCatch(
    async () => {
      const result = await service.getPendingAccountVerification(email);

      return result;
    },
    { parser: actionErrorParser }
  );
};

export const verifyEmailOTPAction = async (
  values: VerifyEmailOTPSchemaValues
) => {
  return await safeCatch(
    async () => {
      const parsedValues = verifyEmailOTPSchema.parse(values);

      const checkResult = await auth.api.checkVerificationOTP({
        body: {
          ...parsedValues,
          type: 'email-verification',
        },
      });

      if (checkResult.success) {
        return await auth.api.verifyEmailOTP({
          body: parsedValues,
        });
      }
    },
    { parser: actionErrorParser }
  );
};

export const sendVerificationOTPAction = async (
  values: SendVerificationOTPSchemaValues
) => {
  return await safeCatch(
    async () => {
      const parsedValues = sendVerificationOTPSchema.parse(values);

      return await auth.api.sendVerificationOTP({ body: parsedValues });
    },
    { parser: actionErrorParser }
  );
};

export const requestPasswordResetAction = async (
  values: RequestPasswordResetSchemaValues
) => {
  return await safeCatch(
    async () => {
      const authRepository = new AuthRepository();
      const userRepository = new UserRepository();
      const service = new AuthService(authRepository, userRepository);

      const parsedValues = requestPasswordResetSchema.parse(values);
      return await service.requestPasswordReset(parsedValues);
    },
    { parser: actionErrorParser }
  );
};

export const resetPasswordAction = async (
  values: ResetPasswordSchemaValues
) => {
  return await safeCatch(
    async () => {
      const repository = new AuthRepository();
      const service = new AuthService(repository);

      const parsedValues = resetPasswordSchema.parse(values);

      return await service.resetPassword(parsedValues);
    },
    { parser: actionErrorParser }
  );
};

export async function verifyUserPasswordAction(password: string) {
  const result = await safeCatch(
    async () => {
      const repository = new AuthRepository();
      const service = new AuthService(repository);

      return await service.verifyUserPassword(password);
    },
    { parser: actionErrorParser }
  );

  return result;
}
