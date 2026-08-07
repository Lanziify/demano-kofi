import { type Kysely, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Media
  await db.schema
    .createTable('media')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('type', 'varchar(50)', (col) => col.notNull())
    .addColumn('storage_key', 'text', (col) => col.notNull())
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('file_size', 'integer')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('media_variants_storage_key_unique', ['storage_key'])
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('media').execute();
}
