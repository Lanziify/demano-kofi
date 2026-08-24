import { type Kysely, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function up(db: Kysely<any>): Promise<void> {
  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------

  await db.schema
    .createTable('categories')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('category_name_unique', ['name'])
    .execute();

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Product Images
  // ---------------------------------------------------------------------------

  await db.schema
    .createTable('product_images')
    .addColumn('media_id', 'uuid', (col) => col.references('media.id').onDelete('cascade').notNull())
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('alt_text', 'varchar(255)')
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('product_images_pk', ['product_id', 'media_id'])
    .execute();

  // ---------------------------------------------------------------------------
  // Variants
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Modifier Groups
  //
  // These are reusable modifier templates/presets.
  //
  // Examples:
  //   Milk
  //   Syrup
  //   Extra Shot
  //   Toppings
  //
  // Ordering is NOT stored here because the same group can appear in
  // different positions depending on the category or product.
  // ---------------------------------------------------------------------------

  await db.schema
    .createTable('modifier_groups')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('selection_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('modifier_group_name_unique', ['name'])
    .execute();

  // ---------------------------------------------------------------------------
  // Modifier Group Options
  //
  // Reusable options belonging to a modifier group.
  //
  // Example:
  //
  // Milk
  //   Whole Milk
  //   Oat Milk +30
  //   Soy Milk +20
  // ---------------------------------------------------------------------------

  await db.schema
    .createTable('modifier_group_options')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('modifier_group_id', 'uuid', (col) => col.references('modifier_groups.id').onDelete('cascade').notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('price_adjustment', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('modifier_options_name_unique', ['modifier_group_id', 'name'])
    .execute();

  // ---------------------------------------------------------------------------
  // Category Modifier Groups
  //
  // Defines which modifier groups are available for a category.
  //
  // The category's sort_order is only the category's/default presentation
  // order. It does NOT determine the order of a product's modifier groups.
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Product Modifier Groups
  //
  // Defines the actual modifier groups used by a product.
  //
  // This is the source of truth for:
  //   - which groups the product uses
  //   - their order
  //   - whether each group is required
  //
  // When creating a product from category groups, the selected groups are
  // copied into this table.
  // ---------------------------------------------------------------------------

  await db.schema
    .createTable('product_modifier_groups')
    .addColumn('product_id', 'uuid', (col) => col.references('products.id').onDelete('cascade').notNull())
    .addColumn('category_modifier_group_id', 'uuid', (col) =>
      col.references('category_modifier_groups.id').onDelete('set null')
    )
    .addColumn('modifier_group_id', 'uuid', (col) => col.references('modifier_groups.id').onDelete('cascade').notNull())
    .addColumn('is_required', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('product_modifier_groups_pk', ['product_id', 'modifier_group_id'])
    .execute();

  // ---------------------------------------------------------------------------
  // Product Modifier Options
  //
  // Defines which options from a modifier group are available for a product.
  //
  // Example:
  //
  // Shared Milk group:
  //   Whole Milk
  //   Oat Milk
  //   Soy Milk
  //
  // Latte:
  //   Oat Milk
  //   Soy Milk
  //
  // Cappuccino:
  //   Whole Milk
  //   Soy Milk
  // ---------------------------------------------------------------------------

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
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
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
