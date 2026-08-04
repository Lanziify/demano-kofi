import { type Kysely, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Categories
  await db.schema
    .createTable('product_categories')
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
    .addUniqueConstraint('products_category_unique', ['name'])
    .execute();

  // Products
  await db.schema
    .createTable('products')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('category_id', 'uuid', (col) =>
      col.references('product_categories.id').onDelete('set null')
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
    .addUniqueConstraint('products_name_unique', ['name'])
    .execute();

  // Product Images
  await db.schema
    .createTable('product_images')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('product_id', 'uuid', (col) =>
      col.references('products.id').onDelete('cascade').notNull()
    )
    .addColumn('image_url', 'text', (col) => col.notNull())
    .execute();

  // Product Variants
  await db.schema
    .createTable('product_variants')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('product_id', 'uuid', (col) =>
      col.references('products.id').onDelete('cascade').notNull()
    )
    .addColumn('sku', 'varchar(50)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('price', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('product_variants_sku_unique', ['sku'])
    .execute();

  // Modifier Groups
  await db.schema
    .createTable('modifier_groups')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('selection_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('is_required', 'boolean', (col) =>
      col.defaultTo(false).notNull()
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Product Modifier Groups
  await db.schema
    .createTable('product_modifier_groups')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('product_id', 'uuid', (col) =>
      col.references('products.id').onDelete('cascade').notNull()
    )
    .addColumn('modifier_group_id', 'uuid', (col) =>
      col.references('modifier_groups.id').onDelete('cascade').notNull()
    )
    .addUniqueConstraint('product_modifier_groups_unique', [
      'product_id',
      'modifier_group_id',
    ])
    .execute();

  // Product Modifiers
  await db.schema
    .createTable('product_modifiers')
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
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('product_modifiers').execute();
  await db.schema.dropTable('product_modifier_groups').execute();
  await db.schema.dropTable('modifier_groups').execute();
  await db.schema.dropTable('product_variants').execute();
  await db.schema.dropTable('product_images').execute();
  await db.schema.dropTable('products').execute();
  await db.schema.dropTable('product_categories').execute();
}
