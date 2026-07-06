import { Request } from "express";
import { AuthUser } from "./auth-user.interface";

export interface AuthScope {
  roles: string[];
  permissions?: string[];
  grantedPermission: string | null;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}

export interface RequestWithAuthScope extends RequestWithUser {
  authScope?: AuthScope;
}
