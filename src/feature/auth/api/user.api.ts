import { UserProfileApiResponse } from '@/app/api/users/me/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import axios from 'axios';
import { updateEmailAddressAction, updateUsernameAction, verifyUserPasswordAction } from '../actions/user.actions';
import { ChangeEmailSchemaValues, UsernameUpdateSchemaValues } from '../schema/account.schema';
import { ProfileSchemaWithUserIdValues } from '../schema/profile.schema';

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
    const { data } = await updateUsernameAction(value.username);
    
    return data;
  }
);

export const updateEmailAddress = withClientErrorHandling(
  async (values: ChangeEmailSchemaValues) => {
    const { data } = await updateEmailAddressAction(values);
    
    return data;
  }
);

export const verifyUserPassword = withClientErrorHandling(
  async (value: string) => {
    const { data } = await verifyUserPasswordAction(value);
    
    return data;
  }
);
//#endregion
