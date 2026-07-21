import { UserProfileApiResponse } from '@/app/api/users/me/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import axios from 'axios';
import {
  AddressSchemaWithUserIdValues,
  ProfileSchemaWithUserIdValues,
} from '../schema/profile.schema';
import { AuthRepository } from '../repository/auth.repository';

export const getUserProfile = withClientErrorHandling(async () => {
  const { data } = await axios.get<UserProfileApiResponse>('/api/users/me');

  return data;
});

export const getUserAddresses = withClientErrorHandling(
  async (userId: string) => {
    const { data } = await axios.get<
      Awaited<ReturnType<AuthRepository['findUserAddresses']>>
    >(`/api/users/address?userId=${userId}`);

    return data;
  }
);

//#region Mutations
export const updateUserProfile = withClientErrorHandling(
  async (values: ProfileSchemaWithUserIdValues) => {
    const { data } = await axios.patch('/api/users/me', values);

    return data;
  }
);

export const createUserAddress = withClientErrorHandling(
  async (values: AddressSchemaWithUserIdValues) => {
    const { data } = await axios.post('/api/users/address', values);

    return data;
  }
);
//#endregion
