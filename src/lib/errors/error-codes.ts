import { auth } from '@/utils/auth';
import { authClient } from '@/utils/auth-client';

export type ClientAuthErrorCode = keyof typeof authClient.$ERROR_CODES;

export type ApiAuthErrorCodes = keyof typeof auth.$ERROR_CODES;

export type ErrorCode =
  // Generic
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DATABASE_ERROR'
  | 'INTERNAL_SERVER_ERROR'

  // Auth
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_VERIFICATION_TOKEN'
  | 'INVALID_OTP'
  | 'OTP_EXPIRED'
  | 'OTP_ALREADY_SENT'
  | 'OTP_NOT_REQUESTED'

  // User
  | 'USERNAME_TAKEN'
  | 'USER_NOT_FOUND';
