import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MessagingGateway } from "./messaging.gateway";
import { MessagingService } from "./messaging.service";
import { MessagingController } from "./messaging.controller";
import { MessagingProcessor, MESSAGING_QUEUE } from "./messaging.processor";
import { UploadsModule } from "../uploads/uploads.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    UploadsModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>("REDIS_URL", "redis://localhost:6379"),
      }),
    }),
    BullModule.registerQueue({ name: MESSAGING_QUEUE }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
      }),
    }),
  ],
  providers: [MessagingGateway, MessagingService, MessagingProcessor],
  controllers: [MessagingController],
  exports: [MessagingService],
})
export class MessagingModule {}
