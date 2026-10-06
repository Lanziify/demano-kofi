import { type Kysely, sql } from 'kysely';

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
    .createTable('option_groups')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    // min 0 = optional. max null = no limit. e.g. "pick exactly one" is 1/1.
    .addColumn('min_select', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('max_select', 'integer')
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    // Deferred so renames that swap two names within one transaction don't collide mid-way.
    .addUniqueConstraint('option_groups_product_name_unique', ['product_id', 'name'], (uc) =>
      uc.deferrable().initiallyDeferred()
    )
    .addCheckConstraint(
      'option_groups_select_range_check',
      sql`min_select >= 0 and (max_select is null or (max_select >= 1 and max_select >= min_select))`
    )
    .execute();

  await db.schema
    .createTable('options')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('option_group_id', 'uuid', (col) => col.references('option_groups.id').onDelete('cascade').notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('price_adjustment', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('is_available', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('options_group_name_unique', ['option_group_id', 'name'], (uc) =>
      uc.deferrable().initiallyDeferred()
    )
    .execute();

  // An add-on is another product (e.g. a croissant offered with a latte), sold at the link's price.
  await db.schema
    .createTable('product_add_ons')
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('add_on_product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('price_amount', 'integer', (col) => col.notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('product_add_ons_pk', ['product_id', 'add_on_product_id'])
    .addCheckConstraint('product_add_ons_not_self_check', sql`product_id <> add_on_product_id`)
    .addCheckConstraint('product_add_ons_price_check', sql`price_amount >= 0`)
    .execute();

  await db.schema
    .createIndex('product_add_ons_add_on_product_id_index')
    .on('product_add_ons')
    .column('add_on_product_id')
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('product_add_ons').execute();
  await db.schema.dropTable('options').execute();
  await db.schema.dropTable('option_groups').execute();
  await db.schema.dropTable('variants').execute();
  await db.schema.dropTable('product_images').execute();
  await db.schema.dropTable('products').execute();
  await db.schema.dropTable('categories').execute();
}
