import { auth } from '@/utils/auth';
import { NextRequest, NextResponse } from 'next/server';
import { apiErrorParser } from './errors/api-error-parser';
import { BadRequestError } from './errors/app-error';

type Context = { params: Promise<Record<string, string | string[]>> };

type ApiRouteHandler = (
  req: NextRequest,
  context: Context
) => Promise<NextResponse>;

type ApiGuard = (req: NextRequest, context: Context) => Promise<void>;

interface ApiHandlerOptions {
  guards?: ApiGuard[];
}

export const apiErrorHandler = (
  handler: ApiRouteHandler,
  options?: ApiHandlerOptions
): ApiRouteHandler => {
  return async (req: NextRequest, context: Context) => {
    try {
      if (options?.guards) {
        for (const guard of options.guards) {
          await guard(req, context);
        }
      }
      return await handler(req, context);
    } catch (error) {
      return apiErrorParser(error);
    }
  };
};


export const requiredSession: ApiGuard = async (req) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    throw new BadRequestError('Cannot perform request without active session.');
  }
};
