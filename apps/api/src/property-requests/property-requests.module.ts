import { Module } from "@nestjs/common";
import { PropertyRequestsService } from "./property-requests.service";
import { PropertyRequestsController } from "./property-requests.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [PropertyRequestsService],
  controllers: [PropertyRequestsController],
})
export class PropertyRequestsModule {}
