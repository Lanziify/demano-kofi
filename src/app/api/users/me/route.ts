import { NextResponse } from 'next/server';
import { auth } from '@/core/auth/auth';
import { apiErrorHandler, requiredSession } from '@/core/http/api-handler';
import { formDataToObject } from '@/core/http/api-helpers';
import { profileSchemaWithUserId } from '@/feature/auth';
import { UserService } from '@/feature/auth/server';

const service = new UserService();

export const GET = apiErrorHandler(
  async (req) => {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const result = await service.getUserProfile(session?.user.id!);

    return NextResponse.json(result, { status: 200 });
  },
  {
    guards: [requiredSession],
  }
);

export const PATCH = apiErrorHandler(
  async (req) => {
    const formData = await req.formData();

    const values = formDataToObject(formData);
    const parsedValues = profileSchemaWithUserId.parse(values);

    const result = await service.updateUserProfile(parsedValues);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
