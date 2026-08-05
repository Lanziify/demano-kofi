import { auth } from '@/utils/auth';
import { authClient } from '@/utils/auth-client';

export const appApiErrorCodes = {
  BAD_REQUEST: 'BAD_REQUEST',
  REQUEST_NOT_FOUND: 'REQUEST_NOT_FOUND',
  UNAUTHORIZED_REQUEST: 'UNAUTHORIZED_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CLIENT_REQUEST_ERROR: 'CLIENT_REQUEST_ERROR',
  // Auth
  OTP_NOT_REQUESTED: 'OTP_NOT_REQUESTED',
  // User
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  // Product
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_IMAGE_NOT_FOUND: 'PRODUCT_IMAGE_NOT_FOUND',
  PRODUCT_VARIANT_NOT_FOUND: 'PRODUCT_VARIANT_NOT_FOUND',
  MODIFIER_GROUP_NOT_FOUND: 'MODIFIER_GROUP_NOT_FOUND',
  PRODUCT_MODIFIER_NOT_FOUND: 'PRODUCT_MODIFIER_NOT_FOUND',
  PRODUCT_MODIFIER_GROUP_NOT_FOUND: 'PRODUCT_MODIFIER_GROUP_NOT_FOUND',
} as const;

export type AppApiErrorCodes = keyof typeof appApiErrorCodes;

export const appDbErrorCodes = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  INVALID_TEXT_REPRESENTATION: '22P02',
  DATABASE_ERROR: 'fallback',
} as const;

export type AppDbErrorCodes = keyof typeof appDbErrorCodes;

const ERROR_CODES = {
  ...appApiErrorCodes,
  ...appDbErrorCodes,
  ...authClient.$ERROR_CODES,
  ...auth.$ERROR_CODES,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export function isErrorCode(code: string): code is ErrorCode {
  return code in appApiErrorCodes;
}
