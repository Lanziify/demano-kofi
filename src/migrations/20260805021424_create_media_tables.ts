import { type Kysely, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Media: one row per uploaded file. `storage_key` points at the original.
  await db.schema
    .createTable('media')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('storage_key', 'text', (col) => col.notNull())
    .addColumn('mime_type', 'varchar(100)', (col) => col.notNull())
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('file_size', 'integer')
    .addColumn('status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('pending').check(sql`status in ('pending', 'ready', 'failed')`)
    )
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('media_storage_key_unique', ['storage_key'])
    .execute();

  // Media variants: resized copies generated from a media's original (e.g. thumbnail, large).
  await db.schema
    .createTable('media_variants')
    .addColumn('media_id', 'uuid', (col) => col.references('media.id').onDelete('cascade').notNull())
    .addColumn('name', 'varchar(50)', (col) => col.notNull())
    .addColumn('storage_key', 'text', (col) => col.notNull())
    .addColumn('mime_type', 'varchar(100)', (col) => col.notNull())
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('file_size', 'integer')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('media_variants_pk', ['media_id', 'name'])
    .addUniqueConstraint('media_variants_storage_key_unique', ['storage_key'])
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('media_variants').execute();
  await db.schema.dropTable('media').execute();
}
