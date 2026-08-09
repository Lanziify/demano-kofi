import axios from 'axios';
import type { ApiErrorResponse } from './api-error-parser';
import { AppError } from './app-error';
import type { ErrorCode } from './error-codes';

export class ClientRequestError extends AppError {
  constructor(
    message: string,
    options: {
      errorCode?: ErrorCode;
      cause?: unknown;
      details?: Record<string, unknown>;
    }
  ) {
    super(message, {
      statusCode: 400,
      errorCode: options?.errorCode ?? 'CLIENT_REQUEST_ERROR',
      cause: options?.cause instanceof Error ? options.cause : undefined,
      details: options?.details,
    });
  }
}

// export function withServerActionErrorHandling<TArgs extends unknown[], TResult>(
//   fn: (...args: TArgs) => Promise<TResult>
// ) {
//   return async (...args: TArgs): Promise<TResult> => {
//     try {
//       return await fn(...args);
//     } catch (error) {
//       const parsedError = actionErrorParser(error);

//       throw new ClientRequestError(
//         parsedError.message ?? "Oops! Something wen't wrong.",
//         {
//           errorCode: parsedError.errorCode ?? 'UNEXPECTED_ERROR',
//           statusCode: 500,
//           details: parsedError.details,
//           cause: error,
//         }
//       );
//     }
//   };
// }

export function withClientErrorHandling<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        throw new ClientRequestError(
          error.response?.data?.message ?? error.message,
          {
            // errorCode: error.response?.data?.errorCode ?? 'UNEXPECTED_ERROR',
            // // statusCode: error.response?.status ?? 500,
            // // details: error.response?.data?.details,
            // cause: error,
          }
        );
      }

      throw error;
    }
  };
}
