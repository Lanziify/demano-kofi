import { UserProfileApiResponse } from '@/app/api/users/me/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import axios from 'axios';

export const getUserProfile = withClientErrorHandling(async () => {
  const { data } = await axios.get<UserProfileApiResponse>('/api/users/me');

  return data;
});
