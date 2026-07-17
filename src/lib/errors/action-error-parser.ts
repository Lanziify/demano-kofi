import z, { ZodError } from 'zod';

import { APIError, isAPIError } from 'better-auth/api';
import { AppError } from './app-error';

type ParsedActionError = {
  code: string;
  message: string;
  details?: Record<string, unknown> | unknown;
};

export function actionErrorParser(error: unknown): ParsedActionError {
  if (error instanceof ZodError) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: z.flattenError(error),
    };
  }

  if (error instanceof APIError || isAPIError(error)) {
    return {
      code: error.body?.code ?? 'AUTH_ERROR',
      message: error.body?.message ?? 'Authentication failed',
      details: error.cause,
    };
  }

  if (error instanceof AppError) {
    return {
      code: error.errorCode,
      message: error.message,
      details: error.details,
    };
  }

  console.log(error)

  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  };
}
