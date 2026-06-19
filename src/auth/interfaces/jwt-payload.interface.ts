/**
 * Shape of the JWT payload signed in `AuthService` (login / refresh).
 * `sub` is the user id, per the JWT "subject" claim convention.
 */
export interface JwtPayload {
  sub: string;
  email: string;
}
