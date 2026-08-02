import { NextResponse } from 'next/server';
import { UserRepository } from '@/feature/auth/repository/user.repository';
import { UserService } from '@/feature/auth/service/user.service';
import { apiErrorHandler } from '@/lib/api-handler';

const repository = new UserRepository();
const service = new UserService(repository);

export type UserProfileApiResponse = Awaited<
  ReturnType<UserService['getUserProfile']>
>;

type UserFilters = Parameters<UserService['getUser']>[0];

const allowedFilters = ['id', 'email', 'username'] as const;

export const GET = apiErrorHandler(
  async (req) => {
    const { searchParams } = new URL(req.url);

    const filters = Object.fromEntries(
      allowedFilters
        .filter((key) => searchParams.has(key))
        .map((key) => [key, searchParams.get(key)!])
    ) satisfies UserFilters;

    const result = await service.getUser(filters);

    return NextResponse.json(result, { status: 200 });
  },
  {
    guards: [],
  }
);
