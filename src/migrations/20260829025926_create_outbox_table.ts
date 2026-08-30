import { type Kysely, type SqlBool, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('outbox')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('event_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('payload', 'text', (col) => col.notNull())
    .addColumn('attempts', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('processed_at', 'timestamptz')
    .addColumn('failed_at', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('outbox_unprocessed_idx')
    .on('outbox')
    .columns(['created_at'])
    .where(sql<SqlBool>`processed_at is null and failed_at is null`)
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('outbox').execute();
}
