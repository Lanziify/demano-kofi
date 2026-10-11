import type { ErrorCode } from './error-codes';

export interface AppErrorOptions extends ErrorOptions {
  errorCode: ErrorCode;
  statusCode: number;
  details?: Record<string, unknown> | unknown;
}

export abstract class AppError extends Error {
  readonly errorCode: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, unknown> | unknown;

  constructor(message: string, options: AppErrorOptions) {
    super(message, {
      cause: options.cause,
    });

    this.name = new.target.name;
    this.errorCode = options.errorCode;
    this.statusCode = options.statusCode;
    this.details = options.details;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends AppError {
  constructor(
    message = 'Cannot perform action. Bad request.',
    options?: {
      errorCode?: ErrorCode;
      cause?: unknown;
      details?: Record<string, unknown>;
    }
  ) {
    super(message, {
      statusCode: 400,
      errorCode: options?.errorCode ?? 'BAD_REQUEST',
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}
export class NotFoundError extends AppError {
  constructor(
    message = 'Not found.',
    options?: {
      errorCode?: ErrorCode;
      cause?: unknown;
      details?: Record<string, unknown>;
    }
  ) {
    super(message, {
      statusCode: 404,
      errorCode: options?.errorCode ?? 'REQUEST_NOT_FOUND',
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}

export class UnAuthorizedError extends AppError {
  constructor(
    message = 'Cannot perform action without authorization.',
    options?: {
      errorCode?: ErrorCode;
      cause?: unknown;
      details?: Record<string, unknown>;
    }
  ) {
    super(message, {
      statusCode: 401,
      errorCode: options?.errorCode ?? 'UNAUTHORIZED_REQUEST',
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed.',
    options?: {
      errorCode?: ErrorCode;
      cause?: unknown;
      details?: Record<string, unknown>;
    }
  ) {
    super(message, {
      statusCode: 422,
      errorCode: options?.errorCode ?? 'VALIDATION_ERROR',
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}

export class ServerError extends AppError {
  constructor(
    message = 'Something went wrong with the server',
    options?: {
      errorCode?: ErrorCode;
      cause?: unknown;
      details?: Record<string, unknown>;
    }
  ) {
    super(message, {
      statusCode: 500,
      errorCode: options?.errorCode ?? 'UNEXPECTED_ERROR',
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(
    message = 'Database operation failed',
    options?: {
      errorCode?: ErrorCode;
      cause?: unknown;
      details?: Record<string, unknown>;
    }
  ) {
    super(message, {
      statusCode: 500,
      errorCode: options?.errorCode ?? 'DATABASE_ERROR',
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}
