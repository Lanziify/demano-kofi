'use server';

import { safeCatch } from '@/lib/errors/safe-catch';
import { auth } from '@/utils/auth';
import { AuthRepository } from '../repository/auth.repository';
import { APP_ROLES } from '@/lib/auth/roles';
import { actionErrorParser } from '@/lib/errors/action-error-parser';
import { ApiBody } from '@/types/api';
import { headers } from 'next/headers';
import { SignUpUserValues } from '../schema/auth.schema';

export type SignUpBody = ApiBody<typeof auth.api.signUpEmail>;
export type SignInBody = ApiBody<typeof auth.api.signInUsername>;

export const getSessionAction = async () => {
  return await safeCatch(
    async () => {
      return await auth.api.getSession({ headers: await headers() });
    },
    {
      parser: actionErrorParser,
    }
  );
};

export async function signUpAdminAction(values: SignUpBody) {
  return await safeCatch(
    async () => {
      const response = await auth.api.signUpEmail({
        body: values,
      });

      const authRepository = new AuthRepository();
      await authRepository.setUserRole(response.user.id, APP_ROLES.admin);

      return response;
    },
    { parser: actionErrorParser }
  );
}

export const singUpUserAction = async (values: SignUpUserValues) => {
  const { firstName, lastName, confirmPassword, ...transformedValues } = values;

  const result = await safeCatch(
    async () => {
      return await auth.api.signUpEmail({
        body: {
          ...transformedValues,
          name: `${firstName} ${lastName}`,
        },
      });
    },
    { parser: actionErrorParser }
  );

  if (result.error) {
    // TODO: or maybe throw the custom error?
    return result;
  }

  const repository = new AuthRepository();
  await repository.createUserProfile(result.data?.user.id, values);

  return result;
};

export const signInUserAction = async (values: SignInBody) => {
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

export const getUserProfile = async (userId: string) => {
  return await safeCatch(
    async () => {
      const repository = new AuthRepository();
      return await repository.findUserProfile(userId);
    },
    { parser: actionErrorParser }
  );
};
