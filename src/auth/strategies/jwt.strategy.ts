import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "@/prisma/prisma.service";
import { JwtPayload } from "@/auth/interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
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
    // Fetch user with roles and permissions from the database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!user) return null;
    // Attach roles as array of role names
    const roles = user.userRoles.map((ur) => ur.role.name);

    // Flatten permissions from all roles
    const rolePermissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name)
    );

    // Get direct user permissions
    const directPermissions = user.userPermissions.map(
      (up) => up.permission.name
    );

    // Combine and deduplicate all permissions
    const permissions = [
      ...new Set([...rolePermissions, ...directPermissions]),
    ];

    return {
      ...user,
      roles,
      permissions,
    };
  }
}
