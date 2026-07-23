import { auth } from "@/utils/auth";
import { authClient } from "@/utils/auth-client";

export type ClientAuthErrorCode = keyof typeof authClient.$ERROR_CODES;

export type ApiAuthErrorCodes = keyof typeof auth.$ERROR_CODES;

export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DATABASE_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "CLIENT_REQUEST_ERROR";
