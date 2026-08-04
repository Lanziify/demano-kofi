import type { Kysely, Transaction, Updateable } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import type { DB, UserProfiles } from '@/types/db';
import { db } from '@/utils/db';

type Database = Kysely<DB> | Transaction<DB>;

export class UserRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new UserRepository(trx);
  }

  async setUserRole(userId: string, role: string) {
    return this.database
      .updateTable('user')
      .set({
        role: role,
      })
      .where('id', '=', userId)
      .execute();
  }

  async findUserById(userId: string) {
    return this.database
      .selectFrom('user')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();
  }

  async findUserByEmail(email: string) {
    return this.database
      .selectFrom('user')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();
  }

  async createUserProfile(
    userId: string,
    values: Omit<Updateable<UserProfiles>, 'username' | 'image'>
  ) {
    return this.database
      .insertInto('userProfiles')
      .values({
        userId,
        ...values,
      })
      .executeTakeFirst();
  }

  async findUserProfile(userId: string) {
    return this.database
      .selectFrom('user')
      .selectAll()
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom('userProfiles')
            .select([
              'firstName',
              'lastName',
              'bio',
              'phone',
              'dateOfBirth',
              'building',
              'street',
              'region',
              'province',
              'municipality',
              'barangay',
            ])
            .whereRef('userProfiles.userId', '=', 'user.id')
        ).as('profile'),
      ])
      .where('user.id', '=', userId)
      .executeTakeFirst();
  }

  async updateUserProfile(
    userId: string,
    values: Omit<Updateable<UserProfiles>, 'userId' | 'createdAt' | 'updatedAt'>
  ) {
    return this.database
      .updateTable('userProfiles')
      .set(values)
      .where('userId', '=', userId)
      .executeTakeFirst();
  }
}
