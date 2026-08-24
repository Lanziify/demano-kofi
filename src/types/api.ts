import type { ErrorCode } from '@/lib/errors/error-codes';

export type ApiErrorBody = {
  errorCode?: ErrorCode;
  message?: string;
  details?: Record<string, unknown> | unknown;
};

export type ApiSuccessResponse<T> = { success: boolean; data: T; error: null };
export type ApiRErrorResponse<E  extends ApiErrorBody = ApiErrorBody> = { success: boolean; data: null; error: E };

export type ApiResponse<T, E extends ApiErrorBody = ApiErrorBody> = ApiSuccessResponse<T> | ApiRErrorResponse<E>;

type ApiOptions<T extends (...args: any[]) => any> = NonNullable<Parameters<T>[0]>;

export type ApiBody<T extends (...args: any[]) => any> = ApiOptions<T> extends {
  body: infer B;
}
  ? B
  : never;

export type ApiQuery<T extends (...args: any[]) => any> = ApiOptions<T> extends { query: infer Q } ? Q : never;
