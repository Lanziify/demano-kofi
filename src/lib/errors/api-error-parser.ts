import { APIError, isAPIError } from 'better-auth/api';
import { NextResponse } from 'next/server';
import z, { ZodError } from 'zod';
import type { ApiRErrorResponse } from '@/types/api';
import { AppError } from './app-error';
import { isPostgresError, parsePostgresError } from './db-error-parser';
import { isErrorCode } from './error-codes';

export function apiErrorParser(error: unknown): NextResponse<ApiRErrorResponse> {
  let errorData: ApiRErrorResponse & { status: number } = {
    success: false,
    data: null,
    error: {},
    status: 404,
  };

  if (error instanceof ZodError) {
    errorData = {
      ...errorData,
      error: {
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: z.flattenError(error),
      },
      status: 400,
    };
  }

  if (error instanceof APIError || isAPIError(error)) {
    errorData = {
      ...errorData,
      error: {
        errorCode: error.body?.code && isErrorCode(error.body?.code) ? error.body?.code : 'UNEXPECTED_ERROR',
        message: error.body?.message,
        details: error.cause,
      },
      status: error.statusCode,
    };
  }

  if (isPostgresError(error)) {
    const parsed = parsePostgresError(error);

    errorData = {
      ...errorData,
      error: {
        errorCode: parsed.errorCode,
        message: parsed.message,
        details: parsed.details,
      },
      status: parsed.statusCode,
    };
  }

  if (error instanceof AppError) {
    errorData = {
      ...errorData,
      error: {
        errorCode: error.errorCode,
        message: error.message,
        details: error.details,
      },
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    errorData = {
      ...errorData,
      error: {
        errorCode: 'UNEXPECTED_ERROR',
        message: error.message,
        details: error.cause,
      },
      status: 500,
    };
  }

  const { status, ...result } = errorData;

  return NextResponse.json<ApiRErrorResponse>(result, { status });
}
