import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  updateEmailAddress,
  updateUsername,
  updateUserProfile,
} from '../api/user.api';
import { useAuthStore } from '../store/auth-store';

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['me'],
      });
      useAuthStore.getState().updateAuthSession();
    },
  });
};

export const useUpdateUsername = () => {
  return useMutation({
    mutationFn: updateUsername,
    onSuccess() {
      useAuthStore.getState().updateAuthSession();
    },
  });
};

export const useUpdateEmailAddress = () => {
  return useMutation({
    mutationFn: updateEmailAddress,
    onSuccess() {
      useAuthStore.getState().updateAuthSession();
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
