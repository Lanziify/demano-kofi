import type { RawBuilder, SelectQueryBuilder, Simplify } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export type CastDatesExact<O> = {
  [K in keyof O]: O[K] extends Date ? Date : O[K];
};

export function typeSafeJsonArrayFrom<DB, TB extends keyof DB, O>(
  expr: SelectQueryBuilder<DB, TB, O>
): RawBuilder<CastDatesExact<Simplify<O>>[]> {
  // @ts-expect-error Kysely's jsonArrayFrom date inference
  return jsonArrayFrom(expr);
}
