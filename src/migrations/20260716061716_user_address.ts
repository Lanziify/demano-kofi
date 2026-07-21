import { sql, type Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('userAddress')
    .addColumn('id', 'text', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('userId', 'text', (col) =>
      col.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('active', 'boolean', (col) => col.defaultTo(false))
    .addColumn('label', 'text')
    .addColumn('building', 'text')
    .addColumn('street', 'text')
    .addColumn('barangay', 'text')
    .addColumn('city', 'text')
    .addColumn('province', 'text')
    .addColumn('region', 'text')
    .addColumn('postalCode', 'text')
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('userAddress').execute();
}
