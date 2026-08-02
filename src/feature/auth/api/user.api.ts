import axios from 'axios';
import type {
  UpdateUserProfileApiResponse,
  UserProfileApiResponse,
} from '@/app/api/users/me/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import { safeCatch } from '@/lib/errors/safe-catch';
import {
  updateEmailAddressAction,
  updateUsernameAction,
  updateUserPasswordAction,
} from '../actions/user.actions';
import type {
  ChangeEmailSchemaValues,
  UsernameUpdateSchemaValues,
} from '../schema/account.schema';
import type { ChangePasswordApiSchemaValues } from '../schema/auth.schema';
import type { ProfileSchemaWithUserIdValues } from '../schema/profile.schema';

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
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return safeCatch(async () => {
      const result = await axios.patch<UpdateUserProfileApiResponse>(
        '/api/users/me',
        formData
      );

      return result.data;
    });
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
