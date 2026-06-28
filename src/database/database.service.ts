import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      // actually hit the DB to confirm the connection is live
      await this.dataSource.query("SELECT 1");
      this.logger.log("Connected to MariaDB via TypeORM");
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error("TypeORM database connection failed", err.stack);
      }
    }
  }
}
