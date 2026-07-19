import { db } from '@/utils/db';
import { AuthRepository } from '../repository/auth.repository';
import { ProfileSchemaValues } from '../schema/profile.schema';
import { auth } from '@/utils/auth';
import { toDate } from '@/lib/date';
import { DatabaseError } from '@/lib/errors/app-error';
import { headers } from 'next/headers';

export class AuthService {
  constructor(private repository: AuthRepository) {}

  async getUserProfile(userId: string) {
    const profile = await this.repository.findUserProfile(userId);

    return profile;
  }

  async updateUserProfile(values: ProfileSchemaValues & { userId: string }) {
    const { userId, image, username, address, ...profile } = values;

    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw new DatabaseError('Could not find user');
    }

    const authUpdates: {
      image?: string;
      username?: string;
      name?: string;
    } = {};

    if (image && image !== user.image) {
      authUpdates.image = image;
    }

    if (username !== user.displayUsername) {
      authUpdates.username = username;
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
          headers: await headers()
        });
      }

      return await repo.findUserProfile(userId)
    });
  }
}
