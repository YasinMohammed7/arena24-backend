import { User } from "@prisma/client";

/**
 * A `User` with sensitive/internal fields stripped — the shape returned in
 * auth responses (`register`, `login`). Mirrors the fields removed when
 * destructuring the Prisma `user` in `AuthService`.
 */
export type SafeUser = Omit<
  User,
  "password" | "ownerId" | "isActive" | "deletedAt"
>;
