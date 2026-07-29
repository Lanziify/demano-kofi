'use server';

import { actionErrorParser } from '@/lib/errors/action-error-parser';
import { safeCatch } from '@/lib/errors/safe-catch';
import { UserRepository } from '../repository/user.repository';
import {
  ChangeEmailSchemaValues,
  changePasswordApiSchema,
  ChangePasswordApiSchemaValues,
} from '../schema/account.schema';
import { UserService } from '../service/user.service';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export async function updateUsernameAction(username: string) {
  const result = await safeCatch(
    async () => {
      return await userService.updateUsername(username);
    },
    { parser: actionErrorParser }
  );

  return result;
}

export async function updateEmailAddressAction(
  values: ChangeEmailSchemaValues
) {
  const result = await safeCatch(
    async () => {
      return await userService.updateEmail(values);
    },
    { parser: actionErrorParser }
  );

  return result;
}

export async function updateUserPasswordAction(values: ChangePasswordApiSchemaValues) {
  const parsedValues = changePasswordApiSchema.parse(values);

  const result = await safeCatch(
    async () => {
      return await userService.updateUserPassword(parsedValues);
    },
    { parser: actionErrorParser }
  );

  return result
}

export async function verifyUserPasswordAction(password: string) {
  const result = await safeCatch(
    async () => {
      return await userService.verifyUserPassword(password);
    },
    { parser: actionErrorParser }
  );

  return result;
}
