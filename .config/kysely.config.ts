import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl';

import { db } from '../src/core/db/db';

export default defineConfig({
  kysely: db,
  destroyOnExit: true,
  migrations: {
    migrationFolder: '../src/migrations',
    getMigrationPrefix: getKnexTimestampPrefix,
  },
  seeds: {
    seedFolder: '../src/seeds',
  },
});
