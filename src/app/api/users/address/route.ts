import { AuthRepository } from '@/feature/auth/repository/auth.repository';
import { addressSchemaWithUserId } from '@/feature/auth/schema/profile.schema';
import { AuthService } from '@/feature/auth/service/auth.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';
import { ServerError } from '@/lib/errors/app-error';
import { auth } from '@/utils/auth';
import { NextResponse } from 'next/server';

const repository = new AuthRepository();
const service = new AuthService(repository);

export const GET = apiErrorHandler(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new ServerError('No user ID provided');
    }

    const user = await service.getUserProfile(userId);

    const result = await service.getUserAddress(user?.id as string);

    return NextResponse.json(result, { status: 200 });
  },
  {
    guards: [requiredSession],
  }
);

export const POST = apiErrorHandler(
  async (req) => {
    const values = await req.json()

    const parsedValues = addressSchemaWithUserId.parse(values)

    const result = await service.createNewUserAddress(parsedValues)

    return NextResponse.json(result, { status: 200 });
  },
  {
    guards: [requiredSession],
  }
);
