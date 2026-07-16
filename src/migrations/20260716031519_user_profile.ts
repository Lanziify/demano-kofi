import { sql, type Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('userProfile')
    .addColumn('userId', 'text', (col) =>
      col.primaryKey().references('user.id').onDelete('cascade')
    )
    .addColumn('firstName', 'text')
    .addColumn('lastName', 'text')
    .addColumn('bio', 'text')
    .addColumn('phone', 'text')
    .addColumn('dateOfBirth', 'date')
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
  await db.schema.dropTable('userProfile').execute();
}
