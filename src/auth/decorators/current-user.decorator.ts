import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUser } from "../interfaces/auth-user.interface";
import { RequestWithUser } from "../interfaces/authenticated-request.interface";

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
