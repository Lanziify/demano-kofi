import { APIError, isAPIError } from 'better-auth/api';
import { NoResultError } from 'kysely';
import z, { ZodError } from 'zod';
import { AppError } from './app-error';

export type ActionErrorResponse = {
  errorCode?: string;
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
      errorCode: error.body?.code ?? 'UNEXPECTED_ERROR',
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

  if (error instanceof NoResultError) {
    return {
      errorCode: error.name,
      message: error.message,
      details: error.stack,
    };
  }

  return {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  };
}
