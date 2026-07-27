import { queryOptions } from "@tanstack/react-query";
import { getUserVerification } from "../api/auth.api";

export const authQueries = {
  verification: (email: string) => {
    return queryOptions({
      queryKey: ["user-verification", email],
      queryFn: () => getUserVerification(email),
      enabled: !!email,
    });
  },
};
