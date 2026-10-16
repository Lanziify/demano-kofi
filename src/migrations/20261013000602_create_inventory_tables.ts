import { type Kysely, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Units of measure. `to_base_factor` converts a unit into the base unit of its type (the unit with factor 1),
  // e.g. kg = 1000 g. Inventory items always use a factor-1 unit as their base unit so quantities stay whole integers.
  await db.schema
    .createTable('unit_of_measure')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(50)', (col) => col.notNull())
    .addColumn('symbol', 'varchar(10)', (col) => col.notNull())
    .addColumn('unit_type', 'varchar(20)', (col) => col.notNull())
    .addColumn('to_base_factor', 'integer', (col) => col.notNull())
    .addUniqueConstraint('unit_of_measure_symbol_unique', ['symbol'])
    .addCheckConstraint('unit_of_measure_type_check', sql`unit_type IN ('weight', 'volume', 'count')`)
    .addCheckConstraint('unit_of_measure_to_base_factor_check', sql`to_base_factor > 0`)
    .execute();

  await db
    .insertInto('unit_of_measure')
    .values([
      { name: 'Gram', symbol: 'g', unit_type: 'weight', to_base_factor: 1 },
      { name: 'Kilogram', symbol: 'kg', unit_type: 'weight', to_base_factor: 1000 },
      { name: 'Milliliter', symbol: 'ml', unit_type: 'volume', to_base_factor: 1 },
      { name: 'Liter', symbol: 'L', unit_type: 'volume', to_base_factor: 1000 },
      { name: 'Piece', symbol: 'pc', unit_type: 'count', to_base_factor: 1 },
    ])
    .execute();

  // Locations: where stock is kept. One row for the shop today; another row per branch if one ever opens.
  await db.schema
    .createTable('locations')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable('suppliers')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('contact_person', 'varchar(255)')
    .addColumn('phone', 'varchar(50)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)')
    .addColumn('address', 'text')
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable('inventory_categories')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('inventory_categories_name_unique', ['name'])
    .execute();

  // Inventory items: anything that is stocked. Every quantity for an item is stored in its base unit.
  await db.schema
    .createTable('inventory_items')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('category_id', 'uuid', (col) => col.references('inventory_categories.id').onDelete('restrict').notNull())
    .addColumn('base_unit_id', 'uuid', (col) => col.references('unit_of_measure.id').onDelete('restrict').notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('sku', 'varchar(50)', (col) => col.notNull())
    .addColumn('pack_description', 'varchar(255)')
    .addColumn('archived_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('inventory_items_sku_unique', ['sku'])
    .execute();

  // Inventory item suppliers: which supplier sells an item, in what pack, at what price.
  // `pack_quantity` is the pack size in the item's base unit (e.g. "1 kg bag" = 1000), `unit_cost` is per pack.
  await db.schema
    .createTable('inventory_item_suppliers')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('item_id', 'uuid', (col) => col.references('inventory_items.id').onDelete('cascade').notNull())
    .addColumn('supplier_id', 'uuid', (col) => col.references('suppliers.id').onDelete('cascade').notNull())
    .addColumn('pack_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('pack_quantity', 'integer', (col) => col.notNull())
    .addColumn('unit_cost', 'integer')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('inventory_item_suppliers_unique', ['item_id', 'supplier_id', 'pack_name'])
    .addCheckConstraint('inventory_item_suppliers_pack_quantity_check', sql`pack_quantity > 0`)
    .addCheckConstraint('inventory_item_suppliers_unit_cost_check', sql`unit_cost >= 0`)
    .execute();

  // Inventory stocks: current balance per item per location, updated in the same transaction as every stock
  // movement (and rebuildable from them). No `quantity_on_hand >= 0` check - negative stock is allowed for now.
  await db.schema
    .createTable('inventory_stocks')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('item_id', 'uuid', (col) => col.references('inventory_items.id').onDelete('restrict').notNull())
    .addColumn('location_id', 'uuid', (col) => col.references('locations.id').onDelete('restrict').notNull())
    .addColumn('quantity_on_hand', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('reorder_threshold', 'integer')
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('inventory_stocks_item_location_unique', ['item_id', 'location_id'])
    .addCheckConstraint('inventory_stocks_reorder_threshold_check', sql`reorder_threshold >= 0`)
    .execute();

  // Purchase orders: draft -> ordered -> partially_received / received (or canceled). Each delivery writes
  // `receipt` stock movements with reference_type = 'purchase_order'.
  await db.schema
    .createTable('purchase_orders')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('supplier_id', 'uuid', (col) => col.references('suppliers.id').onDelete('restrict').notNull())
    .addColumn('location_id', 'uuid', (col) => col.references('locations.id').onDelete('restrict').notNull())
    .addColumn('status', 'varchar(30)', (col) => col.defaultTo('draft').notNull())
    .addColumn('reference_number', 'varchar(100)')
    .addColumn('notes', 'text')
    .addColumn('ordered_at', 'timestamptz')
    .addColumn('expected_at', 'timestamptz')
    .addColumn('received_at', 'timestamptz')
    .addColumn('created_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addCheckConstraint(
      'purchase_orders_status_check',
      sql`status IN ('draft', 'ordered', 'partially_received', 'received', 'canceled')`
    )
    .execute();

  // Purchase order items: quantities are in packs. `pack_name`, `pack_quantity` and `unit_cost` are copied from
  // the supplier's item when ordering, so later price or pack changes don't rewrite past orders.
  // Stock added on receipt = received packs * pack_quantity (in the item's base unit).
  await db.schema
    .createTable('purchase_order_items')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('purchase_order_id', 'uuid', (col) => col.references('purchase_orders.id').onDelete('cascade').notNull())
    .addColumn('item_id', 'uuid', (col) => col.references('inventory_items.id').onDelete('restrict').notNull())
    .addColumn('pack_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('pack_quantity', 'integer', (col) => col.notNull())
    .addColumn('quantity_ordered', 'integer', (col) => col.notNull())
    .addColumn('quantity_received', 'integer', (col) => col.defaultTo(0).notNull())
    .addColumn('unit_cost', 'integer', (col) => col.notNull())
    .addUniqueConstraint('purchase_order_items_unique', ['purchase_order_id', 'item_id', 'pack_name'])
    .addCheckConstraint('purchase_order_items_pack_quantity_check', sql`pack_quantity > 0`)
    .addCheckConstraint('purchase_order_items_quantity_ordered_check', sql`quantity_ordered > 0`)
    .addCheckConstraint('purchase_order_items_quantity_received_check', sql`quantity_received >= 0`)
    .addCheckConstraint('purchase_order_items_unit_cost_check', sql`unit_cost >= 0`)
    .execute();

  // Stock movements: append-only ledger and the source of truth for stock. Rows are never updated or deleted -
  // mistakes are fixed with a correcting movement. `consumption` is negative for a sale and positive when a sale
  // is voided. `reason` is an optional detail (e.g. 'expired', 'spilled' for waste).
  await db.schema
    .createTable('stock_movements')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('item_id', 'uuid', (col) => col.references('inventory_items.id').onDelete('restrict').notNull())
    .addColumn('location_id', 'uuid', (col) => col.references('locations.id').onDelete('restrict').notNull())
    .addColumn('quantity_delta', 'integer', (col) => col.notNull())
    .addColumn('type', 'varchar(30)', (col) => col.notNull())
    .addColumn('total_cost', 'integer')
    .addColumn('reference_type', 'varchar(50)')
    .addColumn('reference_id', 'uuid')
    .addColumn('reason', 'varchar(50)')
    .addColumn('note', 'text')
    .addColumn('created_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addCheckConstraint('stock_movements_quantity_delta_check', sql`quantity_delta <> 0`)
    .addCheckConstraint(
      'stock_movements_type_check',
      sql`type IN ('receipt', 'consumption', 'waste', 'adjustment', 'count')`
    )
    .execute();

  await db.schema
    .createIndex('idx_stock_movements_item_location_created_at')
    .on('stock_movements')
    .columns(['item_id', 'location_id', 'created_at'])
    .execute();

  await db.schema
    .createIndex('idx_stock_movements_reference')
    .on('stock_movements')
    .columns(['reference_type', 'reference_id'])
    .execute();

  // Recipe items: what one serving of a product variant uses, in each item's base unit.
  await db.schema
    .createTable('recipe_items')
    .addColumn('variant_id', 'uuid', (col) => col.references('variants.id').onDelete('cascade').notNull())
    .addColumn('item_id', 'uuid', (col) => col.references('inventory_items.id').onDelete('restrict').notNull())
    .addColumn('quantity', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('recipe_items_pk', ['variant_id', 'item_id'])
    .addCheckConstraint('recipe_items_quantity_check', sql`quantity > 0`)
    .execute();

  // Option recipe items: how choosing an option changes the recipe. Negative removes, positive adds
  // (e.g. "Oat milk" = milk -200, oat milk +200; "Extra shot" = beans +18).
  await db.schema
    .createTable('option_recipe_items')
    .addColumn('option_id', 'uuid', (col) => col.references('options.id').onDelete('cascade').notNull())
    .addColumn('item_id', 'uuid', (col) => col.references('inventory_items.id').onDelete('restrict').notNull())
    .addColumn('quantity_delta', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('option_recipe_items_pk', ['option_id', 'item_id'])
    .addCheckConstraint('option_recipe_items_quantity_delta_check', sql`quantity_delta <> 0`)
    .execute();

  // Stock counts: a physical count session at one location, covering all items or a selected few. Applying it
  // writes one `count` movement per item with a non-zero variance (reference_type = 'stock_count').
  await db.schema
    .createTable('stock_counts')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('location_id', 'uuid', (col) => col.references('locations.id').onDelete('restrict').notNull())
    .addColumn('scope', 'varchar(30)', (col) => col.defaultTo('all').notNull())
    .addColumn('status', 'varchar(30)', (col) => col.defaultTo('draft').notNull())
    .addColumn('note', 'text')
    .addColumn('counted_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('applied_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('applied_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addCheckConstraint('stock_counts_scope_check', sql`scope IN ('all', 'selected')`)
    .addCheckConstraint('stock_counts_status_check', sql`status IN ('draft', 'applied', 'canceled')`)
    .execute();

  // Stock count items: one row per item counted, including items that matched (variance 0).
  // `expected_quantity` is the system stock when the item was counted; `variance` is derived so it can't disagree.
  await db.schema
    .createTable('stock_count_items')
    .addColumn('stock_count_id', 'uuid', (col) => col.references('stock_counts.id').onDelete('cascade').notNull())
    .addColumn('item_id', 'uuid', (col) => col.references('inventory_items.id').onDelete('restrict').notNull())
    .addColumn('expected_quantity', 'integer', (col) => col.notNull())
    .addColumn('counted_quantity', 'integer', (col) => col.notNull())
    .addColumn('variance', 'integer', (col) =>
      col.generatedAlwaysAs(sql`counted_quantity - expected_quantity`).stored().notNull()
    )
    .addColumn('counted_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addPrimaryKeyConstraint('stock_count_items_pk', ['stock_count_id', 'item_id'])
    .addCheckConstraint('stock_count_items_counted_quantity_check', sql`counted_quantity >= 0`)
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('stock_count_items').execute();
  await db.schema.dropTable('stock_counts').execute();
  await db.schema.dropTable('option_recipe_items').execute();
  await db.schema.dropTable('recipe_items').execute();
  await db.schema.dropTable('stock_movements').execute();
  await db.schema.dropTable('purchase_order_items').execute();
  await db.schema.dropTable('purchase_orders').execute();
  await db.schema.dropTable('inventory_stocks').execute();
  await db.schema.dropTable('inventory_item_suppliers').execute();
  await db.schema.dropTable('inventory_items').execute();
  await db.schema.dropTable('inventory_categories').execute();
  await db.schema.dropTable('suppliers').execute();
  await db.schema.dropTable('locations').execute();
  await db.schema.dropTable('unit_of_measure').execute();
}
