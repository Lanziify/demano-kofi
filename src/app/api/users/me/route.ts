import { UserRepository } from "@/feature/auth/repository/user.repository";
import { profileSchemaWithUserId } from "@/feature/auth/schema/profile.schema";
import { UserService } from "@/feature/auth/service/user.service";
import { apiErrorHandler, requiredSession } from "@/lib/api-handler";
import { auth } from "@/utils/auth";
import { NextResponse } from "next/server";

const repository = new UserRepository();
const service = new UserService(repository);

export type UserProfileApiResponse = Awaited<
  ReturnType<UserService["getUserProfile"]>
>;

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
  },
);

export const PATCH = apiErrorHandler(
  async (req) => {
    const values = await req.json();

    const parsedValues = profileSchemaWithUserId.parse(values);

    const result = await service.updateUserProfile(parsedValues);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] },
);
