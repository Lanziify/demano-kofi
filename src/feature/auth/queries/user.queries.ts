import { queryOptions } from '@tanstack/react-query';
import { getUserProfile } from '../api/user.api';

export const userQueries = {
  profile: () => {
    return queryOptions({
      queryKey: ['me'],
      queryFn: () => getUserProfile(),
    });
  },
};
