import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppGraphService } from "./common/services/app-graph.service";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as os from "os";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  // Generate app graph if enabled
  const appGraphService = app.get(AppGraphService);
  if (appGraphService.isGraphGenerationEnabled()) {
    const graph = appGraphService.generateAppGraph(app, "app.module_v4.mmd");
    if (graph) {
      logger.log("App graph generated successfully");
      logger.log(graph);
    }
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // Enable transformation to DTO classes
    })
  );
  app.enableCors({
    // origin: ['https://dashboard.arena-24.ro'],
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    exposedHeaders: ["X-Access-Token", "X-Refresh-Token"],
  });

  // Static files are served by ServeStaticModule in AppModule

  // Set global prefix for API routes only
  app.setGlobalPrefix("api");

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Arena 24 API")
    .setDescription("API documentation for Arena 24")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      "access-token"
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "UUID",
      },
      "refresh-token"
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  const ip =
    Object.values(os.networkInterfaces())
      .flat()
      .find((n) => n?.family === "IPv4" && !n.internal)?.address ?? "127.0.0.1";
  logger.log(`App running on: http://localhost:${port}`);
  logger.log(`Network access:  http://${ip}:${port}`);
  logger.log(`Documentation found on: http://localhost:${port}/api/docs`);
}
void bootstrap();
