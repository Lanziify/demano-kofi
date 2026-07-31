import { useMutation } from '@tanstack/react-query';
import { verifyUserPassword } from '../api/auth.api';

export const useVerifyUserPassword = () => {
  return useMutation({
    mutationFn: verifyUserPassword,
  });
};
