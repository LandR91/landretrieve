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
import { CrmModule } from "./crm/crm.module";
import { PaymentsModule } from "./payments/payments.module";
import { AdminModule } from "./admin/admin.module";

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
    CrmModule,
    PaymentsModule,
    AdminModule,
  ],
})
export class AppModule {}
