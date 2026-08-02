import { APIError, isAPIError } from 'better-auth/api';
import { NextResponse } from 'next/server';
import z, { ZodError } from 'zod';
import { AppError } from './app-error';
import { isPostgresError, parsePostgresError } from './db-error-parser';
import { type ErrorCode, isErrorCode } from './error-codes';

export type ApiErrorResponse = {
  errorCode?: ErrorCode;
  message?: string;
  details?: Record<string, unknown> | unknown;
};

export function apiErrorParser(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: z.flattenError(error),
      },
      { status: 400 }
    );
  }

  if (error instanceof APIError || isAPIError(error)) {
    return NextResponse.json(
      {
        errorCode:
          error.body?.code && isErrorCode(error.body?.code)
            ? error.body?.code
            : 'UNEXPECTED_ERROR',
        message: error.body?.message,
        details: error.cause,
      },
      { status: error.statusCode }
    );
  }

  if (isPostgresError(error)) {
    const parsed = parsePostgresError(error);

    return NextResponse.json(
      {
        errorCode: parsed.errorCode,
        message: parsed.message,
        details: parsed.details,
      },
      { status: parsed.statusCode }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        errorCode: error.errorCode,
        message: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        status: 500,
        errorCode: 'UNEXPECTED_ERROR',
        message: error.message,
        details: error.cause,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      errorCode: 'UNEXPECTED_ERROR',
      message: 'Something went wrong',
    },
    { status: 500 }
  );
}
