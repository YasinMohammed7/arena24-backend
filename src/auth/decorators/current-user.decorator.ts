import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

/**
 * Shape of the user object attached to the request by the JWT strategy's
 * `validate()` method. Keep this in sync with `JwtStrategy.validate`.
 */
export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface RequestWithUser extends Request {
  user: AuthUser;
}

/**
 * Extracts the authenticated user (or a single property of it) from the request.
 *
 * Examples:
 *   @CurrentUser() user: AuthUser
 *   @CurrentUser("id") userId: string
 */
export const CurrentUser = createParamDecorator(
  <K extends keyof AuthUser>(
    data: K | undefined,
    ctx: ExecutionContext
  ): AuthUser | AuthUser[K] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return data ? request.user[data] : request.user;
  }
);
