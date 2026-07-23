import z, { ZodError } from "zod";
import { NextResponse } from "next/server";

import { APIError, isAPIError } from "better-auth/api";
import { AppError } from "./app-error";

export function apiErrorParser(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: z.flattenError(error),
      },
      { status: 400 },
    );
  }

  if (error instanceof APIError || isAPIError(error)) {
    return NextResponse.json(
      {
        code: error.body?.code,
        message: error.body?.message,
        details: error.cause,
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        code: error.errorCode,
        message: error.message,
        details: error.details,
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
        details: error.cause,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
    { status: 500 },
  );
}
