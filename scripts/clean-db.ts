import 'dotenv/config';
import { sql } from 'kysely';

async function run() {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '❌ CRITICAL ERROR: Cannot wipe database in production mode!'
    );
    process.exit(1);
  }

  const { db } = await import('../src/utils/db');

  console.log('⏳ Wiping all data from database tables...');

  try {
    await sql`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `.execute(db);

    // await db
    //   .insertInto('platform')
    //   .values({
    //     id: 1,
    //     initialized: false,
    //   })
    //   .execute();

    console.log('✅ Database data cleared successfully.');
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
  } finally {
    // Always destroy the pool connection so the terminal script exits immediately
    await db.destroy();
  }
}

run();
