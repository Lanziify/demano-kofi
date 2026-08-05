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
    .addColumn('storage_key', 'text', (col) => col.notNull())
    .addColumn('mime_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('file_size', 'integer', (col) => col.notNull())
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('media_storage_key_unique', ['storage_key'])
    .execute();

  // Media Variants
  await db.schema
    .createTable('media_variants')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('media_id', 'uuid', (col) =>
      col.references('media.id').onDelete('cascade').notNull()
    )
    .addColumn('type', 'varchar(50)', (col) => col.notNull())
    .addColumn('storage_key', 'text', (col) => col.notNull())
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('file_size', 'integer')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('media_variants_storage_key_unique', [
      'storage_key',
    ])
    .addUniqueConstraint('media_variants_type_unique', [
      'media_id',
      'type',
    ])
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('media_variants').execute();
  await db.schema.dropTable('media').execute();
}