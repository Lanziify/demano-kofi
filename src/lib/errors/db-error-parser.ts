import { appDbErrorCodes } from './error-codes';

type PostgresError = {
  code?: (typeof appDbErrorCodes)[keyof typeof appDbErrorCodes];
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
};

export type DbErrorResponse = {
  errorCode?: keyof typeof appDbErrorCodes;
  statusCode: number;
  message?: string;
  details?: Record<string, unknown> | unknown;
};

export function isPostgresError(error: unknown): error is PostgresError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function parsePostgresError(error: PostgresError): DbErrorResponse {
  switch (error.code) {
    // unique_violation
    case '23505':
      return {
        errorCode: 'UNIQUE_VIOLATION',
        statusCode: 409,
        message: 'A resource with this value already exists',
        details: {
          constraint: error.constraint,
        },
      };

    // foreign_key_violation
    case '23503':
      return {
        errorCode: 'FOREIGN_KEY_VIOLATION',
        statusCode: 400,
        message: 'Referenced resource does not exist',
        details: {
          constraint: error.constraint,
        },
      };

    // not_null_violation
    case '23502':
      return {
        errorCode: 'NOT_NULL_VIOLATION',
        statusCode: 400,
        message: 'Required field is missing',
        details: {
          column: error.column,
        },
      };

    // check_violation
    case '23514':
      return {
        errorCode: 'CHECK_VIOLATION',
        statusCode: 400,
        message: 'Invalid value provided',
        details: {
          constraint: error.constraint,
        },
      };

    default:
      return {
        errorCode: 'DATABASE_ERROR',
        statusCode: 500,
        message: 'Database error',
      };
  }
}
