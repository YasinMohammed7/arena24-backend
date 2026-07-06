import type { User } from "@/database/entities/user";

/**
 * A `User` with sensitive/internal fields stripped — the shape returned in
 * auth responses (`register`, `login`). Mirrors the fields removed when
 * destructuring the `user` in `AuthService`.
 */
export type SafeUser = Pick<
  User,
  "id" | "email" | "name" | "phone" | "createdAt" | "updatedAt" | "imageUrl"
>;
