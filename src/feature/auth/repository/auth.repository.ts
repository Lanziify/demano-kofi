import { db } from '@/utils/db';

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
}
