import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserAddress, updateUserProfile } from '../api/user.api';

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

export const useCreateUserAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserAddress,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['addresses'],
      });
    },
  });
};
