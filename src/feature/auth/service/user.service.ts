import { DatabaseError } from '@/lib/errors/app-error';
import { auth } from '@/utils/auth';
import { db } from '@/utils/db';
import { toDate } from 'date-fns';
import { headers } from 'next/headers';
import { UserRepository } from '../repository/user.repository';
import { ChangeEmailSchemaValues } from '../schema/account.schema';
import { ProfileSchemaValues } from '../schema/profile.schema';

export class UserService {
  constructor(private repository: UserRepository) {}

  async getUserProfile(userId: string) {
    const profile = await this.repository.findUserProfile(userId);

    return profile;
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
      params: {
        type: 'email-change',
      },
      headers: await headers(),
    });
  }
  //#endregion

  async verifyUserPassword(password: string) {
    return auth.api.verifyPassword({
      body: {
        password,
      },
      headers: await headers(),
    });
  }
}
