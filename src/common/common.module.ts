import { Module } from "@nestjs/common";
import { AppGraphService } from "./services/app-graph.service";

@Module({
  providers: [AppGraphService],
  exports: [AppGraphService],
})
export class CommonModule {}
