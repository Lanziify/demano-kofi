import { NextResponse } from 'next/server';
import { AuthRepository } from '@/feature/auth/repository/auth.repository';
import { AuthService } from '@/feature/auth/service/auth.service';
import { apiErrorHandler } from '@/lib/api-handler';

const repository = new AuthRepository();
const service = new AuthService(repository);

export type GetVerificationAccountApiResponse = Awaited<
  ReturnType<AuthService['getPendingAccountVerification']>
>;

export const GET = apiErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);

  const result = await service.getPendingAccountVerification(
    searchParams.get('email') ?? ''
  );

  return NextResponse.json(result, { status: 200 });
});
