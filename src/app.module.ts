import { UsersModule } from "./users/users.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
import { TestingModule } from "@/testing.module";
import { CommonModule } from "@/common/common.module";
import { RolesModule } from "@/auth/roles/roles.module";
import { MailModule } from "./mail/mail.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SmsModule } from "./sms/sms.module";
import { BusinessModule } from "./business/business.module";
import { MediaService } from "./media/media.service";
import { MediaController } from "./media/media.controller";
import { MediaModule } from "./media/media.module";
import { ClientModule } from "./client/client.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseService } from "./database/database.service";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "public", "uploads"),
      serveRoot: "/uploads",
    }),
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available app-wide
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "mariadb",
        url: config.get<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    PrismaModule,
    AuthModule,
    RolesModule,
    MailModule,
    SmsModule,
    MediaModule,
    UsersModule,
    CommonModule,
    BusinessModule,
    TestingModule,
    ClientModule,
  ],
  controllers: [MediaController],
  providers: [DatabaseService, MediaService],
})
export class AppModule {}
