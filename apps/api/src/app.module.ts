import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MessagingModule } from "./messaging/messaging.module";
import { OffersModule } from "./offers/offers.module";
import { PropertyRequestsModule } from "./property-requests/property-requests.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PropertiesModule } from "./properties/properties.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MessagingModule,
    OffersModule,
    PropertyRequestsModule,
    NotificationsModule,
    PropertiesModule,
  ],
})
export class AppModule {}
