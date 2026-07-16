import { sql, type Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('userAddress')
    .addColumn('userId', 'text', (col) =>
      col.primaryKey().references('user.id').onDelete('cascade')
    )
	.addColumn('active', 'boolean', (col) => col.defaultTo(false))
    .addColumn('building', 'text')
    .addColumn('street', 'text')
    .addColumn('barangay', 'text')
    .addColumn('city', 'text')
    .addColumn('province', 'text')
    .addColumn('region', 'text')
    .addColumn('postalCode', 'text')
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('userAddress').execute();
}
