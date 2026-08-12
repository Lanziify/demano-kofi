import { type Kysely, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Categories
  await db.schema
    .createTable('categories')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('category_name_unique', ['name'])
    .execute();

  // Products
  await db.schema
    .createTable('products')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('category_id', 'uuid', (col) =>
      col.references('categories.id').onDelete('set null')
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('is_available', 'boolean', (col) =>
      col.defaultTo(true).notNull()
    )
    .addColumn('is_featured', 'boolean', (col) =>
      col.defaultTo(false).notNull()
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('product_name_unique', ['name'])
    .execute();

  // Product Images
  await db.schema
    .createTable('product_images')
    .addColumn('media_id', 'uuid', (col) =>
      col.references('media.id').onDelete('cascade').notNull()
    )
    .addColumn('product_id', 'uuid', (col) =>
      col.references('products.id').onDelete('cascade').notNull()
    )
    .addColumn('alt_text', 'varchar(255)')
    .addColumn('sort_order', 'integer')
    .addPrimaryKeyConstraint('product_images_pk', ['product_id', 'media_id'])
    .execute();

  // Variants
  await db.schema
    .createTable('variants')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('product_id', 'uuid', (col) =>
      col.references('products.id').onDelete('cascade').notNull()
    )
    .addColumn('sku', 'varchar(50)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('price_amount', 'integer', (col) => col.notNull())
    .addColumn('sort_order', 'integer')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('variants_sku_unique', ['sku'])
    .execute();

  // Modifiers Groups
  await db.schema
    .createTable('modifier_groups')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('selection_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Category Modifiers
  await db.schema
    .createTable('category_modifier_groups')
    .addColumn('category_id', 'uuid', (col) =>
      col.references('categories.id').onDelete('cascade').notNull()
    )
    .addColumn('modifier_group_id', 'uuid', (col) =>
      col.references('modifier_groups.id').onDelete('cascade').notNull()
    )
    .addColumn('is_required', 'boolean', (col) =>
      col.defaultTo(false).notNull()
    )
    .addColumn('sort_order', 'integer')
    .addPrimaryKeyConstraint('category_modifier_group_pk', [
      'category_id',
      'modifier_group_id',
    ])
    .execute();

  // Product Modifiers
  await db.schema
    .createTable('product_modifier_groups')
    .addColumn('product_id', 'uuid', (col) =>
      col.references('products.id').onDelete('cascade').notNull()
    )
    .addColumn('modifier_group_id', 'uuid', (col) =>
      col.references('modifier_groups.id').onDelete('cascade').notNull()
    )
    .addColumn('is_required', 'boolean', (col) =>
      col.defaultTo(false).notNull()
    )
    .addColumn('sort_order', 'integer')
    .addPrimaryKeyConstraint('product_modifier_groups_pk', [
      'product_id',
      'modifier_group_id',
    ])
    .execute();

  // Modifiers Options
  await db.schema
    .createTable('modifier_group_options')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('modifier_group_id', 'uuid', (col) =>
      col.references('modifier_groups.id').onDelete('cascade').notNull()
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('price_adjustment', 'integer', (col) =>
      col.defaultTo(0).notNull()
    )
    .addColumn('sort_order', 'integer')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('modifier_options_name_unique', [
      'modifier_group_id',
      'name',
    ])
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('product_images').execute();
  await db.schema.dropTable('product_modifier_groups').execute();
  await db.schema.dropTable('category_modifier_groups').execute();
  await db.schema.dropTable('modifier_group_options').execute();
  await db.schema.dropTable('modifier_groups').execute();
  await db.schema.dropTable('variants').execute();
  await db.schema.dropTable('products').execute();
  await db.schema.dropTable('categories').execute();
}
