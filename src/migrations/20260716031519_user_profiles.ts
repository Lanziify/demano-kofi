import { type Kysely, sql } from 'kysely';

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_profiles')
    .addColumn('user_id', 'text', (col) =>
      col.primaryKey().references('user.id').onDelete('cascade')
    )
    .addColumn('first_name', 'text')
    .addColumn('last_name', 'text')
    .addColumn('bio', 'text')
    .addColumn('phone', 'text')
    .addColumn('date_of_birth', 'date')

    // Address
    .addColumn('building', 'text')
    .addColumn('street', 'text')
    .addColumn('region', 'text')
    .addColumn('province', 'text')
    .addColumn('municipality', 'text')
    .addColumn('barangay', 'text')

    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

// `any` is required here since migrations should be frozen in time.
// Alternatively, keep a "snapshot" DB interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_profiles').execute();
}
