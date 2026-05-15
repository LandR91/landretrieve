import { Module } from "@nestjs/common";
import { OffersService } from "./offers.service";
import { OffersController } from "./offers.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { MessagingModule } from "../messaging/messaging.module";

@Module({
  imports: [PrismaModule, MessagingModule],
  providers: [OffersService],
  controllers: [OffersController],
})
export class OffersModule {}
