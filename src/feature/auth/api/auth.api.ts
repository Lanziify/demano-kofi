import { GetVerificationAccountApiResponse } from '@/app/api/verification/verify-account/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import axios from 'axios';
import { verifyUserPasswordAction } from '../actions/auth.actions';

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
