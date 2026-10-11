export type BaseError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type Success<T> = { data: T; error: null };
export type Error<E> = { data: null; error: E };
export type Result<T, E extends BaseError> = Success<T> | Error<E>;

export async function safeCatch<T, E = BaseError>(
  fn: () => Promise<T>,
  options?: {
    parser: (error: E) => E;
  }
) {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    return {
      data: null,
      error: options ? options.parser(error as E) : error,
    };
  }
}
