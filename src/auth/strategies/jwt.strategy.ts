import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "@/auth/interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/database/entities/user";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        (() => {
          throw new Error("JWT_SECRET is not defined");
        })(),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepo
      .createQueryBuilder("user")
      .leftJoin("user.userRoles", "userRole")
      .leftJoin("userRole.role", "role")
      .leftJoin("role.rolePermissions", "rolePermission")
      .leftJoin("rolePermission.permission", "permissionFromRole")
      .leftJoin("user.userPermissions", "userPermission")
      .leftJoin("userPermission.permission", "directPermission")
      .select([
        "user.id AS id",
        "user.email AS email",
        "user.name AS name",
        "user.phone AS phone",
        "user.ownerId AS ownerId",
        "user.isActive AS isActive",
        "user.deletedAt AS deletedAt",
        "user.createdAt AS createdAt",
        "user.updatedAt AS updatedAt",
      ])
      .addSelect("GROUP_CONCAT(DISTINCT role.name)", "roles")
      .addSelect(
        "CONCAT_WS(',', GROUP_CONCAT(DISTINCT permissionFromRole.name), GROUP_CONCAT(DISTINCT directPermission.name))",
        "permissions"
      )
      .where("user.id = :id", { id: payload.sub })
      .groupBy("user.id")
      .getRawOne<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        ownerId: string | null;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        roles: string | null;
        permissions: string | null;
      }>();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      ownerId: user.ownerId,
      isActive: user.isActive,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles ? user.roles.split(",") : [],
      permissions: user.permissions
        ? [...new Set(user.permissions.split(","))]
        : [],
    };
  }
}
