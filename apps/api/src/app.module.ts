import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MessagingModule } from "./messaging/messaging.module";
import { OffersModule } from "./offers/offers.module";

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
  ],
})
export class AppModule {}
