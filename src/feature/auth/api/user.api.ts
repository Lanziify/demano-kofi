import { UserProfileApiResponse } from '@/app/api/users/me/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import axios from 'axios';
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
//#endregion
