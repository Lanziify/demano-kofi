import { AuthRepository } from '@/feature/auth/repository/auth.repository';
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
