import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import { auth } from '@/utils/auth';
import { db } from '@/utils/db';
import { toDate } from 'date-fns';
import { headers } from 'next/headers';
import { UserRepository } from '../repository/user.repository';
import { ProfileSchemaValues } from '../schema/profile.schema';
import { ChangeEmailSchemaValues } from '../schema/account.schema';
import { ChangePasswordApiSchemaValues } from '../schema/auth.schema';

export type UserFilters = {
  id?: string;
  email?: string;
  username?: string;
};

export class UserService {
  constructor(private repository: UserRepository) {}

  async getUserProfile(userId: string) {
    const profile = await this.repository.findUserProfile(userId);

    return profile;
  }

  async getUser(filters: UserFilters) {
    const filterMap = {
      id: 'user.id',
      email: 'user.email',
      username: 'user.username',
    } as const;

    let query = db.selectFrom('user').selectAll();

    for (const [key, column] of Object.entries(filterMap)) {
      const value = filters[key as keyof UserFilters];

      if (value) {
        query = query.where(column, '=', value);
      }
    }

    const user = await query.executeTakeFirst();

    if (!user) {
      throw new NotFoundError('User not found', {
        errorCode: 'USER_NOT_FOUND',
      });
    }

    return user;
  }

  //#region UPDATES
  async updateUserProfile(values: ProfileSchemaValues & { userId: string }) {
    const { userId, image, ...profile } = values;

    const user = await this.repository.findUserProfile(userId);

    if (!user) {
      throw new DatabaseError('Could not find user');
    }

    const authUpdates: {
      image?: string;
      name?: string;
    } = {};

    if (image && image !== user.image) {
      authUpdates.image = image;
    }

    const fullName = `${profile.firstName} ${profile.lastName}`;

    if (fullName !== user.name) {
      authUpdates.name = fullName;
    }

    return await db.transaction().execute(async (trx) => {
      const repo = this.repository.withTransaction(trx);

      await repo.updateUserProfile(userId, {
        ...profile,
        dateOfBirth: profile.dateOfBirth ? toDate(profile.dateOfBirth) : null,
      });

      if (Object.keys(authUpdates).length > 0) {
        await auth.api.updateUser({
          body: authUpdates,
          headers: await headers(),
        });
      }

      return await repo.findUserProfile(userId);
    });
  }

  async updateUsername(username: string) {
    return await auth.api.updateUser({
      body: {
        username,
      },
      headers: await headers(),
    });
  }

  async updateEmail(values: ChangeEmailSchemaValues) {
    return await auth.api.changeEmail({
      body: values,
      headers: await headers(),
    });
  }

  async updateUserPassword(values: ChangePasswordApiSchemaValues) {
    return await auth.api.changePassword({
      body: values,
      headers: await headers(),
    });
  }
  //#endregion
}
