import { faker } from '@faker-js/faker';
import type { Kysely } from 'kysely';
import type { DB } from '@/types/db';

function makeProductCategory() {
  return {
    name: faker.commerce.department(),
    description: faker.lorem.sentence(),
  };
}

// replace `any` with your database interface.
export async function seed(db: Kysely<DB>): Promise<void> {
  const categories = faker.helpers.multiple(makeProductCategory, {
    count: 5,
  });

  await db.insertInto('productCategories').values(categories).execute();
}
