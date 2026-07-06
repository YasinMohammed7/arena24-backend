import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "@/auth/strategies/jwt.strategy";
import { RolesModule } from "@/auth/roles/roles.module";
import { PermissionsModule } from "@/auth/permissions/permissions.module";
import { MailModule } from "@/mail/mail.module";
import { SmsModule } from "@/sms/sms.module";
import { User } from "@/database/entities/user";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TypeOrmModule.forFeature([User]),
    RolesModule,
    PermissionsModule,
    MailModule,
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
