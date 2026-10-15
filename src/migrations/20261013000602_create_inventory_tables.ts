import { type Kysely, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('inventory_locations')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable('inventory_items')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('base_unit', 'varchar(10)', (col) => col.notNull())
    .addColumn('archived_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addCheckConstraint('inventory_items_base_unit_check', sql`base_unit IN ('g', 'ml', 'pc')`)
    .execute();

  await db.schema
    .createTable('stock_suppliers')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('contact_number', 'varchar(255)', (col) => col.notNull())
    .addColumn('archived_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // Stock purchases: one delivery/receipt. Completing it writes one `purchase` transaction per line
  // (reference_type = 'stock_purchase'). `merchant_name` covers ad-hoc buys from a store with no supplier record.
  await db.schema
    .createTable('stock_purchases')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('inventory_location_id', 'uuid', (col) =>
      col.references('inventory_locations.id').onDelete('restrict').notNull()
    )
    .addColumn('supplier_id', 'uuid', (col) => col.references('stock_suppliers.id').onDelete('restrict'))
    .addColumn('merchant_name', 'varchar(255)')
    .addColumn('receipt_number', 'varchar(255)')
    .addColumn('status', 'varchar(30)', (col) => col.defaultTo('pending').notNull())
    .addColumn('note', 'text')
    .addColumn('created_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('completed_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addCheckConstraint('stock_purchases_status_check', sql`status IN ('pending', 'completed', 'canceled')`)
    .execute();

  // Stock purchase items: the lines of a purchase. `quantity` is in the item's base unit.
  await db.schema
    .createTable('stock_purchase_items')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('stock_purchase_id', 'uuid', (col) => col.references('stock_purchases.id').onDelete('cascade').notNull())
    .addColumn('inventory_item_id', 'uuid', (col) =>
      col.references('inventory_items.id').onDelete('restrict').notNull()
    )
    .addColumn('quantity', 'integer', (col) => col.notNull())
    .addColumn('total_cost', 'integer')
    .addCheckConstraint('stock_purchase_items_quantity_check', sql`quantity > 0`)
    .addCheckConstraint('stock_purchase_items_total_cost_check', sql`total_cost >= 0`)
    .execute();

  // Inventory transactions: append-only ledger. Rows are never updated or deleted - mistakes are fixed with a
  // correcting transaction. The sum of `quantity_delta` per item and location is the source of truth for stock.
  await db.schema
    .createTable('inventory_transactions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('inventory_item_id', 'uuid', (col) =>
      col.references('inventory_items.id').onDelete('restrict').notNull()
    )
    .addColumn('inventory_location_id', 'uuid', (col) =>
      col.references('inventory_locations.id').onDelete('restrict').notNull()
    )
    .addColumn('quantity_delta', 'integer', (col) => col.notNull())
    .addColumn('transaction_type', 'varchar(30)', (col) => col.notNull())
    .addColumn('total_cost', 'integer')
    .addColumn('reference_type', 'varchar(50)')
    .addColumn('reference_id', 'uuid')
    .addColumn('note', 'text')
    .addColumn('created_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addCheckConstraint('inventory_transactions_quantity_delta_check', sql`quantity_delta <> 0`)
    .addCheckConstraint(
      'inventory_transactions_transaction_type_check',
      sql`transaction_type IN ('purchase', 'sale', 'waste', 'adjustment', 'count')`
    )
    .execute();

  await db.schema
    .createIndex('idx_inventory_transactions_item_location_created_at')
    .on('inventory_transactions')
    .columns(['inventory_item_id', 'inventory_location_id', 'created_at'])
    .execute();

  // Stock levels: current balance per item per location, updated in the same transaction as every inventory
  // transaction (and rebuildable from the ledger). Locking its row serializes concurrent deductions of the same item.
  // No `quantity >= 0` check - negative stock is allowed until sale blocking is introduced.
  await db.schema
    .createTable('stock_levels')
    .addColumn('inventory_item_id', 'uuid', (col) =>
      col.references('inventory_items.id').onDelete('restrict').notNull()
    )
    .addColumn('inventory_location_id', 'uuid', (col) =>
      col.references('inventory_locations.id').onDelete('restrict').notNull()
    )
    .addColumn('quantity', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('stock_levels_pk', ['inventory_item_id', 'inventory_location_id'])
    .execute();

  // Recipe items: what one serving of a product variant uses, in each item's base unit.
  await db.schema
    .createTable('recipe_items')
    .addColumn('variant_id', 'uuid', (col) => col.references('variants.id').onDelete('cascade').notNull())
    .addColumn('inventory_item_id', 'uuid', (col) =>
      col.references('inventory_items.id').onDelete('restrict').notNull()
    )
    .addColumn('quantity', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('recipe_items_pk', ['variant_id', 'inventory_item_id'])
    .addCheckConstraint('recipe_items_quantity_check', sql`quantity > 0`)
    .execute();

  // Option recipe items: how choosing an option changes the recipe. Negative removes, positive adds
  // (e.g. "Oat milk" = milk -200, oat milk +200; "Extra shot" = beans +18).
  await db.schema
    .createTable('option_recipe_items')
    .addColumn('option_id', 'uuid', (col) => col.references('options.id').onDelete('cascade').notNull())
    .addColumn('inventory_item_id', 'uuid', (col) =>
      col.references('inventory_items.id').onDelete('restrict').notNull()
    )
    .addColumn('quantity_delta', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('option_recipe_items_pk', ['option_id', 'inventory_item_id'])
    .addCheckConstraint('option_recipe_items_quantity_delta_check', sql`quantity_delta <> 0`)
    .execute();

  // Stock counts: a physical count session at one location. Applying it writes one `count` transaction per item
  // with a non-zero variance (reference_type = 'stock_count').
  await db.schema
    .createTable('stock_counts')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('inventory_location_id', 'uuid', (col) =>
      col.references('inventory_locations.id').onDelete('restrict').notNull()
    )
    .addColumn('status', 'varchar(30)', (col) => col.defaultTo('draft').notNull())
    .addColumn('note', 'text')
    .addColumn('created_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('applied_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('applied_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addCheckConstraint('stock_counts_status_check', sql`status IN ('draft', 'applied', 'canceled')`)
    .execute();

  // Stock count items: one row per item counted, including items that matched (variance 0).
  // `expected_quantity` is the system stock when the item was counted; `variance` is derived so it can't disagree.
  await db.schema
    .createTable('stock_count_items')
    .addColumn('stock_count_id', 'uuid', (col) => col.references('stock_counts.id').onDelete('cascade').notNull())
    .addColumn('inventory_item_id', 'uuid', (col) =>
      col.references('inventory_items.id').onDelete('restrict').notNull()
    )
    .addColumn('expected_quantity', 'integer', (col) => col.notNull())
    .addColumn('counted_quantity', 'integer', (col) => col.notNull())
    .addColumn('variance', 'integer', (col) =>
      col.generatedAlwaysAs(sql`counted_quantity - expected_quantity`).stored().notNull()
    )
    .addColumn('counted_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('stock_count_items_pk', ['stock_count_id', 'inventory_item_id'])
    .addCheckConstraint('stock_count_items_counted_quantity_check', sql`counted_quantity >= 0`)
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('stock_count_items').execute();
  await db.schema.dropTable('stock_counts').execute();
  await db.schema.dropTable('option_recipe_items').execute();
  await db.schema.dropTable('recipe_items').execute();
  await db.schema.dropTable('stock_levels').execute();
  await db.schema.dropTable('inventory_transactions').execute();
  await db.schema.dropTable('stock_purchase_items').execute();
  await db.schema.dropTable('stock_purchases').execute();
  await db.schema.dropTable('stock_suppliers').execute();
  await db.schema.dropTable('inventory_items').execute();
  await db.schema.dropTable('inventory_locations').execute();
}
