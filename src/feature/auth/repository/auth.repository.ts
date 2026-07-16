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

  async createUserProfile(userId: string, data: ProfileInfoSchemaValues) {
    const { image, username, ...values } = data;

    return db.insertInto('userProfile').values({
      userId,
      ...values,
    });
  }

  async findUserProfile(userId: string) {
    return db
      .selectFrom('user')
      .leftJoin('userProfile', 'user.id', 'userProfile.userId')
      .selectAll('userProfile')
      .where('user.id', '=', userId)
      .executeTakeFirst();
  }
}
