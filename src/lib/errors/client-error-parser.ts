import { AxiosError } from 'axios';
import { AppError } from './app-error';

export class ClientRequestError extends AppError {
  constructor(
    message: string,
    options?: {
      statusCode?: number;
      details?: Record<string, unknown>;
      cause?: unknown;
    }
  ) {
    super(message, {
      errorCode: 'CLIENT_REQUEST_ERROR',
      statusCode: options?.statusCode ?? 500,
      details: options?.details,
      cause: options?.cause,
    });
  }
}

export function withClientErrorHandling<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const axiosError = error as AxiosError<{ message?: string }>;

      const message =
        axiosError.response?.data?.message ??
        (error instanceof Error
          ? error.message
          : 'Unexpected error');

      throw new ClientRequestError(message, {
        statusCode: axiosError.response?.status ?? 500,
        cause: error,
      });
    }
  };
}