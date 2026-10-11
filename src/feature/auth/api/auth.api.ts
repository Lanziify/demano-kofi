import axios from 'axios';
import { withClientErrorHandling } from '@/core/errors/client-error-parser';
import { verifyUserPasswordAction } from '../actions/auth.actions';
import type { GetVerificationAccountApiResponse } from '../types/api.types';

export const getUserVerification = withClientErrorHandling(
  async (email: string) => {
    const { data } = await axios.get<GetVerificationAccountApiResponse>(
      `/api/verification/verify-account?email=${email}`
    );

    return data;
  }
);

export const verifyUserPassword = withClientErrorHandling(
  async (value: string) => {
    return await verifyUserPasswordAction(value);
  }
);
