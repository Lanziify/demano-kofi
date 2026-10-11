import { APIError, isAPIError } from 'better-auth/api';
import z, { ZodError } from 'zod';
import { AppError } from './app-error';
import { type ErrorCode, isErrorCode } from './error-codes';

export type ActionErrorResponse = {
  errorCode?: ErrorCode;
  message?: string;
  details?: Record<string, unknown> | unknown;
};

export function actionErrorParser(error: unknown): ActionErrorResponse {
  if (error instanceof ZodError) {
    return {
      errorCode: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: z.flattenError(error),
    };
  }

  if (error instanceof APIError || isAPIError(error)) {
    return {
      errorCode:
        error.body?.code && isErrorCode(error.body?.code)
          ? error.body?.code
          : 'UNEXPECTED_ERROR',
      message: error.body?.message ?? 'Authentication failed',
      details: error.cause,
    };
  }

  if (error instanceof AppError) {
    return {
      errorCode: error.errorCode,
      message: error.message,
      details: error.details,
    };
  }
  
  return {
    errorCode: 'UNEXPECTED_ERROR',
    message: 'Something went wrong',
  };
}
