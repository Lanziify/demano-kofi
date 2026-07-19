import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '../api/user.api';

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['me'],
      });
    },
  });
};
