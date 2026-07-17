import { db } from '@/utils/db';
import { ProfileInfoSchemaValues } from '../schema/profile.schema';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

export class AuthRepository {
  async adminExists() {
    return db
      .selectFrom('user')
      .selectAll()
      .where('role', '=', 'admin')
      .executeTakeFirst();
  }

  async setUserRole(userId: string, role: string) {
    return db
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
    return db
      .insertInto('userProfile')
      .values({
        userId,
        ...values,
      })
      .executeTakeFirst();
  }

  async findUserProfile(userId: string) {
    return db
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
}
