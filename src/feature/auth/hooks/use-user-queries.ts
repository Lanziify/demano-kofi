import { useQueries } from '@tanstack/react-query';
import { userQueries } from '../queries/user.queries';

type UserQueriesHookProps = {
  userId?: string;
  query?: Record<string, unknown>;
};

export const useUserQueries = (options?: UserQueriesHookProps) => {
  const [userProfile, userAddresses] = useQueries({
    queries: [userQueries.profile(), userQueries.addresses(options?.userId!)],
  });

  return {
    userProfile,
    userAddresses
  };
};
