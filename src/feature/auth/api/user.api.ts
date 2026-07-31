import { UserProfileApiResponse } from '@/app/api/users/me/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import axios from 'axios';
import {
  updateEmailAddressAction,
  updateUsernameAction,
  updateUserPasswordAction,
} from '../actions/user.actions';
import {
  ChangeEmailSchemaValues,
  UsernameUpdateSchemaValues,
} from '../schema/account.schema';
import { ChangePasswordApiSchemaValues } from '../schema/auth.schema';
import { ProfileSchemaWithUserIdValues } from '../schema/profile.schema';

export const getUser = withClientErrorHandling(async (email: string) => {
  const { data } = await axios.get<UserProfileApiResponse>(
    `/api/users?${email}`
  );

  return data;
});

export const getUserProfile = withClientErrorHandling(async () => {
  const { data } = await axios.get<UserProfileApiResponse>('/api/users/me');

  return data;
});

//#region Mutations
export const updateUserProfile = withClientErrorHandling(
  async (values: ProfileSchemaWithUserIdValues) => {
    const { data } = await axios.patch('/api/users/me', values);

    return data;
  }
);

export const updateUsername = withClientErrorHandling(
  async (value: UsernameUpdateSchemaValues) => {
    return await updateUsernameAction(value.username);
  }
);

export const updateEmailAddress = withClientErrorHandling(
  async (values: ChangeEmailSchemaValues) => {
    return await updateEmailAddressAction(values);
  }
);

export const changePassword = withClientErrorHandling(
  async (values: ChangePasswordApiSchemaValues) => {
    return await updateUserPasswordAction(values);
  }
);
//#endregion
