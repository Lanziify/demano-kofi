type ApiOptions<T extends (...args: any[]) => any> = NonNullable<
  Parameters<T>[0]
>;

export type ApiBody<T extends (...args: any[]) => any> = ApiOptions<T> extends {
  body: infer B;
}
  ? B
  : never;

export type ApiQuery<T extends (...args: any[]) => any> =
  ApiOptions<T> extends { query: infer Q } ? Q : never;
