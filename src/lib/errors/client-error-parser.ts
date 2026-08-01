import axios from "axios";
import type { ApiErrorResponse } from "./api-error-parser";
import { AppError } from "./app-error";
import type { ErrorCode } from "./error-codes";

export interface ClientErrorOptions extends ErrorOptions {
  errorCode: ErrorCode;
  statusCode: number;
  details?: Record<string, unknown> | unknown;
}

export class ClientRequestError extends Error {
  readonly errorCode: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown> | unknown;

  constructor(message: string, options: ClientErrorOptions) {
    super(message, {
      cause: options?.cause,
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

export function withClientErrorHandling<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        throw new ClientRequestError(
          error.response?.data?.message ?? error.message,
          {
            errorCode: error.response?.data?.errorCode ?? "UNEXPECTED_ERROR",
            statusCode: error.response?.status ?? 500,
            details: error.response?.data?.details,
            cause: error,
          },
        );
      }

      throw error;
    }
  };
}
