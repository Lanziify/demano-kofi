import { NextResponse } from 'next/server';
import { apiErrorHandler } from '@/core/http/api-handler';
import { AuthService } from '@/feature/auth/server';

const service = new AuthService();

export const GET = apiErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);

  const result = await service.getPendingAccountVerification(
    searchParams.get('email') ?? ''
  );

  return NextResponse.json(result, { status: 200 });
});
