import { queryOptions } from '@tanstack/react-query';
import { getUserProfile } from '../api/user.api';

export const userQueries = {
  profile: () => {
    return queryOptions({
      queryKey: ['me'],
      queryFn: () => getUserProfile(),
    });
  },

  // addresses: (userId: string) => {
  //   return queryOptions({
  //     queryKey: ['addresses'],
  //     queryFn: () => getUserAddresses(userId),
  //     enabled: Boolean(userId)
  //   });
  // },
};
