import { useQueries, useQuery } from "@tanstack/react-query";
import { authQueries } from "../queries/auth.queries";

type AuthQueriesHookProps = {
  email: string;
  query?: Record<string, unknown>;
};

export const useAuthQueries = (options: AuthQueriesHookProps) => {
  const verification = useQuery(authQueries.verification(options.email));

  return {
    verification,
  };
};
