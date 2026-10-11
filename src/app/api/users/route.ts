import { NextResponse } from 'next/server';
import { apiErrorHandler } from '@/core/http/api-handler';
import { UserService } from '@/feature/auth/server';

const service = new UserService();

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
