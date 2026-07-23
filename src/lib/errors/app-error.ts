import { ErrorCode } from "./error-codes";

interface AppErrorOptions extends ErrorOptions {
  errorCode: ErrorCode;
  statusCode: number;
  details?: Record<string, unknown>;
}

export abstract class AppError extends Error {
  readonly errorCode: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

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
    message = "Cannot perform action. Bad request.",
    options?: {
      cause?: unknown;
      details?: Record<string, unknown>;
    },
  ) {
    super(message, {
      errorCode: "BAD_REQUEST",
      statusCode: 400,
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}

export class UnAuthorizedError extends AppError {
  constructor(
    message = "Cannot perform action without authorization.",
    options?: {
      cause?: unknown;
      details?: Record<string, unknown>;
    },
  ) {
    super(message, {
      errorCode: "UNAUTHORIZED",
      statusCode: 401,
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}
export class ServerError extends AppError {
  constructor(
    message = "Something went wrong with the server",
    options?: {
      cause?: unknown;
      details?: Record<string, unknown>;
    },
  ) {
    super(message, {
      errorCode: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(
    message = "Database operation failed",
    options?: {
      cause?: unknown;
      details?: Record<string, unknown>;
    },
  ) {
    super(message, {
      errorCode: "DATABASE_ERROR",
      statusCode: 500,
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}
