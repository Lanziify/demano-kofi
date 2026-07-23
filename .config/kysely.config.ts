import { defineConfig, getKnexTimestampPrefix } from "kysely-ctl";

import { db } from "../src/utils/db";

export default defineConfig({
  kysely: db,
  destroyOnExit: true,
  migrations: {
    migrationFolder: "../src/migrations",
    getMigrationPrefix: getKnexTimestampPrefix,
  },
  seeds: {
    seedFolder: "../src/seeds",
  },
});
