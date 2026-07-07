import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

export default new DataSource({
  type: "mariadb",
  url: process.env.DATABASE_URL,
  entities: [__dirname + "/entities/*.ts"],
  migrations: [__dirname + "/migrations/*.ts"],
});
