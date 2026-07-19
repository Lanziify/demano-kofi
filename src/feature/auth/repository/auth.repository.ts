import { db } from '@/utils/db';
import { ProfileInfoSchemaValues } from '../schema/profile.schema';
import { Updateable, type Kysely, type Transaction } from 'kysely';
import { DB, UserProfile } from '@/types/db';

type Dastabase = Kysely<DB> | Transaction<DB>;

export class AuthRepository {
  constructor(private readonly database: Dastabase = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new AuthRepository(trx);
  }

  async adminExists() {
    return this.database
      .selectFrom('user')
      .selectAll()
      .where('role', '=', 'admin')
      .executeTakeFirst();
  }

  async setUserRole(userId: string, role: string) {
    return this.database
      .updateTable('user')
      .set({
        role: role,
      })
      .where('id', '=', userId)
      .executeTakeFirstOrThrow();
  }

  async createUserProfile(
    userId: string,
    values: Omit<ProfileInfoSchemaValues, 'username' | 'image'>
  ) {
    return this.database
      .insertInto('userProfile')
      .values({
        userId,
        ...values,
      })
      .executeTakeFirst();
  }

  async findUserById(userId: string) {
    return this.database
      .selectFrom('user')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();
  }

  async findUserProfile(userId: string) {
    return this.database
      .selectFrom('user')
      .leftJoin('userProfile', 'user.id', 'userProfile.userId')
      .select([
        'userProfile.firstName',
        'userProfile.lastName',
        'userProfile.bio',
        'userProfile.phone',
        'userProfile.dateOfBirth',
      ])
      .where('user.id', '=', userId)
      .executeTakeFirst();
  }

  async updateUserProfile(
    userId: string,
    values: Omit<Updateable<UserProfile>, 'userId' | 'createdAt' | 'updatedAt'>
  ) {
    return this.database
      .updateTable('userProfile')
      .set(values)
      .where('userId', '=', userId)
      .execute();
  }
}
