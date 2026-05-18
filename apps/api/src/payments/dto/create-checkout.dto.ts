import { IsEnum } from "class-validator";
import { SubscriptionPlan, BillingCycle } from "@prisma/client";

export class CreateCheckoutDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}
