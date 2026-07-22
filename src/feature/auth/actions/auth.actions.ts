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

export async function signUpAdminAction(values: SignUpBody) {
  const repository = new AuthRepository();

  return await safeCatch(
    async () => {
      const response = await auth.api.signUpEmail({
        body: values,
      });

      await repository.setUserRole(response.user.id, APP_ROLES.admin);

      return response;
    },
    { parser: actionErrorParser }
  );
}

export const signUpUserAction = async (values: SignUpUserValues) => {
  const repository = new AuthRepository();

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
    { parser: actionErrorParser }
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
          { firstName, lastName }
        );

        console.log(result);

        return result;
      },
      { parser: actionErrorParser }
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