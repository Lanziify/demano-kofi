import { BadRequestError } from '@/lib/errors/app-error';
import { AuthRepository } from '../repository/auth.repository';

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async getPendingAccountVerification(email: string) {
    const verification = await this.repository.findPendingVerification(
      `email-verification-otp-${email}`
    );

    if (!verification) {
      throw new BadRequestError('Verification code is invalid or does not exist', {
        errorCode: 'OTP_NOT_REQUESTED',
      });
    }

    return verification;
  }
}
