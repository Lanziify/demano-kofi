import { AuthRepository } from '@/feature/auth/repository/auth.repository';
import {
  profileSchema,
  profileSchemaWithUserId,
} from '@/feature/auth/schema/profile.schema';
import { AuthService } from '@/feature/auth/service/auth.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';
import { auth, AuthType } from '@/utils/auth';
import { NextResponse } from 'next/server';

const repository = new AuthRepository();
const service = new AuthService(repository);

export type UserProfileApiResponse = AuthType['Session']['user'] & {
  profile: Awaited<ReturnType<AuthService['getUserProfile']>>;
};

export const GET = apiErrorHandler(
  async (req) => {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const profile = await service.getUserProfile(session?.user.id!);

    const response = {
      profile,
      ...session?.user,
    };

    return NextResponse.json(response, { status: 200 });
  },
  {
    guards: [requiredSession],
  }
);

export const PATCH = apiErrorHandler(
  async (req) => {
    const values = await req.json();

    const parsedValues = profileSchemaWithUserId.parse(values);

    const result = await service.updateUserProfile(parsedValues);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
