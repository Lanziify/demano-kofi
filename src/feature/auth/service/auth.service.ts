import { headers } from 'next/headers';
import { auth } from '@/core/auth/auth';
import { BadRequestError, NotFoundError } from '@/core/errors/app-error';
import { AuthRepository } from '../repository/auth.repository';
import { UserRepository } from '../repository/user.repository';
import type {
  RequestPasswordResetSchemaValues,
  ResetPasswordSchemaValues,
} from '../schema/auth.schema';

export class AuthService {
  constructor(
    private readonly authRepository = new AuthRepository(),
    private readonly userRepository = new UserRepository()
  ) {}

  async getPendingAccountVerification(email: string) {
    const verification = await this.authRepository.findPendingVerification(
      `email-verification-otp-${email}`
    );

    if (!verification) {
      throw new BadRequestError(
        'Verification code is invalid or does not exist',
        {
          errorCode: 'OTP_NOT_REQUESTED',
        }
      );
    }

    return verification;
  }

  async requestPasswordReset(values: RequestPasswordResetSchemaValues) {
    const user = await this.userRepository.findUserByEmail(values.email);

    if (!user) {
      throw new NotFoundError('Email is invalid or does not exist', {
        errorCode: 'USER_NOT_FOUND',
      });
    }

    return await auth.api.requestPasswordReset({
      body: values,
    });
  }

  async resetPassword(values: ResetPasswordSchemaValues) {
    if (!values.token) {
      throw new NotFoundError('Token not found');
    }

    return await auth.api.resetPassword({
      body: values,
    });
  }

  async verifyUserPassword(password: string) {
    return auth.api.verifyPassword({
      body: {
        password,
      },
      headers: await headers(),
    });
  }
}
