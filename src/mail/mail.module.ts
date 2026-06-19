import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Module({
  providers: [MailService],
  exports: [MailService], // Make it available to other modules
})
export class MailModule {}
