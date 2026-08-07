import type { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/auth';
import { apiErrorParser } from './errors/api-error-parser';
import { BadRequestError } from './errors/app-error';

type Context = { params: Promise<Record<string, string | string[]>> };

type ApiRouteHandler<TContext = Context> = (
  req: NextRequest,
  context: TContext
) => Promise<NextResponse>;

type ApiGuard<TContext = Context> = (
  req: NextRequest,
  context: TContext
) => Promise<void>;

interface ApiHandlerOptions<TContext = Context> {
  guards?: ApiGuard<TContext>[];
}

export const apiErrorHandler = <TContext = Context>(
  handler: ApiRouteHandler<TContext>,
  options?: ApiHandlerOptions<TContext>
): ApiRouteHandler<TContext> => {
  return async (req: NextRequest, context: TContext) => {
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

export const requiredSession = async (req: NextRequest) => {
  // const session = await auth.api.getSession({
  //   headers: req.headers,
  // });

  // if (!session) {
  //   throw new BadRequestError('Cannot perform request without active session.');
  // }
};
