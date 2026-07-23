import { db } from "@/utils/db";
import { Updateable, type Kysely, type Transaction } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { DB, UserProfile } from "@/types/db";

type Dastabase = Kysely<DB> | Transaction<DB>;

export class AuthRepository {
  constructor(private readonly database: Dastabase = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new AuthRepository(trx);
  }

  async adminExists() {
    return this.database
      .selectFrom("user")
      .selectAll()
      .where("role", "=", "admin")
      .executeTakeFirst();
  }

  async setUserRole(userId: string, role: string) {
    return this.database
      .updateTable("user")
      .set({
        role: role,
      })
      .where("id", "=", userId)
      .executeTakeFirstOrThrow();
  }

  async findUserById(userId: string) {
    return this.database
      .selectFrom("user")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();
  }

  async createUserProfile(
    userId: string,
    values: Omit<Updateable<UserProfile>, "username" | "image">,
  ) {
    return this.database
      .insertInto("userProfile")
      .values({
        userId,
        ...values,
      })
      .executeTakeFirst();
  }

  async findUserProfile(userId: string) {
    return this.database
      .selectFrom("user")
      .selectAll()
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("userProfile")
            .select([
              "firstName",
              "lastName",
              "bio",
              "phone",
              "dateOfBirth",
              "building",
              "street",
              "region",
              "province",
              "municipality",
              "barangay",
            ])
            .whereRef("userProfile.userId", "=", "user.id"),
        ).as("profile"),
      ])
      .where("user.id", "=", userId)
      .executeTakeFirst();
  }

  async updateUserProfile(
    userId: string,
    values: Omit<Updateable<UserProfile>, "userId" | "createdAt" | "updatedAt">,
  ) {
    return this.database
      .updateTable("userProfile")
      .set(values)
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow();
  }
}
