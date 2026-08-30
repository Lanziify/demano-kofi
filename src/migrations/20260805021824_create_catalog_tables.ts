import { type Kysely, type SqlBool, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('categories')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('category_name_unique', ['name'])
    .execute();

  await db.schema
    .createTable('products')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('category_id', 'uuid', (col) => col.references('categories.id').onDelete('set null'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('is_available', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('is_featured', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('product_name_unique', ['name'])
    .execute();

  await db.schema
    .createTable('product_images')
    .addColumn('media_id', 'uuid', (col) => col.references('media.id').onDelete('cascade').notNull())
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('alt_text', 'varchar(255)')
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('product_images_pk', ['product_id', 'media_id'])
    .execute();

  await db.schema
    .createTable('variants')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('sku', 'varchar(50)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('price_amount', 'integer', (col) => col.notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('variants_sku_unique', ['sku'])
    .execute();

  await db.schema
    .createTable('modifier_groups')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('selection_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('modifier_group_name_unique', ['name'])
    .execute();

  await db.schema
    .createTable('modifier_group_options')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('modifier_group_id', 'uuid', (col) => col.references('modifier_groups.id').onDelete('cascade').notNull())
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('price_adjustment', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('modifier_group_options_id_group_unique', ['id', 'modifier_group_id'])
    .execute();

  await db.schema
    .createTable('category_modifier_groups')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('category_id', 'uuid', (col) => col.references('categories.id').onDelete('cascade').notNull())
    .addColumn('modifier_group_id', 'uuid', (col) => col.references('modifier_groups.id').onDelete('cascade').notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addUniqueConstraint('category_modifier_groups_category_modifier_group_unique', [
      'category_id',
      'modifier_group_id',
    ])
    .execute();

  await db.schema
    .createTable('product_modifier_groups')
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('category_modifier_group_id', 'uuid', (col) =>
      col.references('category_modifier_groups.id').onDelete('set null')
    )
    .addColumn('modifier_group_id', 'uuid', (col) => col.references('modifier_groups.id').onDelete('cascade').notNull())
    .addColumn('selection_type', 'varchar(255)')
    .addColumn('is_required', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('product_modifier_groups_pk', ['product_id', 'modifier_group_id'])
    .addForeignKeyConstraint(
      'product_modifier_groups_category_group_fk',
      ['category_modifier_group_id'],
      'category_modifier_groups',
      ['id'],
      (cb) => cb.onDelete('set null')
    )
    .execute();

  await db.schema
    .createTable('product_modifier_options')
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('modifier_group_id', 'uuid', (col) => col.references('modifier_groups.id').onDelete('cascade').notNull())
    .addColumn('modifier_option_id', 'uuid', (col) =>
      col.references('modifier_group_options.id').onDelete('cascade').notNull()
    )
    .addColumn('price_adjustment', 'integer')
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('product_modifier_options_pk', ['product_id', 'modifier_group_id', 'modifier_option_id'])
    .addForeignKeyConstraint(
      'product_modifier_options_group_fk',
      ['product_id', 'modifier_group_id'],
      'product_modifier_groups',
      ['product_id', 'modifier_group_id'],
      (cb) => cb.onDelete('cascade')
    )
    .addForeignKeyConstraint(
      'product_modifier_options_option_group_fk',
      ['modifier_option_id', 'modifier_group_id'],
      'modifier_group_options',
      ['id', 'modifier_group_id'],
      (cb) => cb.onDelete('cascade')
    )
    .execute();

  await db.schema
    .createIndex('modifier_group_options_shared_name_unique')
    .on('modifier_group_options')
    .columns(['modifier_group_id', 'name'])
    .unique()
    .where(sql<SqlBool>`product_id is null`)
    .execute();

  await db.schema
    .createIndex('modifier_group_options_product_name_unique')
    .on('modifier_group_options')
    .columns(['modifier_group_id', 'product_id', 'name'])
    .unique()
    .where(sql<SqlBool>`product_id is not null`)
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('modifier_group_options_product_name_unique').execute();
  await db.schema.dropIndex('modifier_group_options_shared_name_unique').execute();
  await db.schema.dropTable('product_modifier_options').execute();
  await db.schema.dropTable('product_modifier_groups').execute();
  await db.schema.dropTable('category_modifier_groups').execute();
  await db.schema.dropTable('modifier_group_options').execute();
  await db.schema.dropTable('modifier_groups').execute();
  await db.schema.dropTable('variants').execute();
  await db.schema.dropTable('product_images').execute();
  await db.schema.dropTable('products').execute();
  await db.schema.dropTable('categories').execute();
}
