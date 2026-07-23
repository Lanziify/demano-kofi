import "dotenv/config";
import { sql } from "kysely";

async function run() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot wipe production database");
  }

  const { db } = await import("../src/utils/db");

  try {
    console.log("⏳ Resetting schema...");

    await sql`
      DROP SCHEMA public CASCADE;
    `.execute(db);

    await sql`
      CREATE SCHEMA public;
    `.execute(db);

    console.log("✅ Schema reset complete");
  } finally {
    await db.destroy();
  }
}

run();
