import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  Headers,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PaymentsService } from "./payments.service";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { BadgeAddonDto } from "./dto/badge-addon.dto";
import { IppAddonDto } from "./dto/ipp-addon.dto";

interface AuthRequest extends Express.Request {
  user: { id: string; email: string; role: string };
}

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // Webhook must be first — no JWT guard, receives raw body
  @Post("webhook")
  @HttpCode(200)
  handleWebhook(
    @Headers("stripe-signature") sig: string,
    @Req() req: Express.Request & { rawBody?: Buffer },
  ) {
    return this.paymentsService.handleWebhook(req.rawBody!, sig);
  }

  @Get("subscription")
  @UseGuards(AuthGuard("jwt"))
  getSubscription(@Request() req: AuthRequest) {
    return this.paymentsService.getSubscriptionStatus(req.user.id);
  }

  @Get("my-agents")
  @UseGuards(AuthGuard("jwt"))
  getMyAgents(@Request() req: AuthRequest) {
    return this.paymentsService.getMyAgents(req.user.id);
  }

  @Get("my-properties")
  @UseGuards(AuthGuard("jwt"))
  getMyProperties(@Request() req: AuthRequest) {
    return this.paymentsService.getMyProperties(req.user.id);
  }

  @Post("checkout")
  @UseGuards(AuthGuard("jwt"))
  createCheckout(@Request() req: AuthRequest, @Body() dto: CreateCheckoutDto) {
    return this.paymentsService.createCheckoutSession(
      req.user.id,
      req.user.email,
      dto.plan,
      dto.billingCycle,
    );
  }

  @Post("portal")
  @UseGuards(AuthGuard("jwt"))
  createPortal(@Request() req: AuthRequest) {
    return this.paymentsService.createPortalSession(req.user.id);
  }

  @Post("badge-addon")
  @UseGuards(AuthGuard("jwt"))
  addBadge(@Request() req: AuthRequest, @Body() dto: BadgeAddonDto) {
    return this.paymentsService.addBadgeAddon(req.user.id, dto.agentId);
  }

  @Post("ipp-addon")
  @UseGuards(AuthGuard("jwt"))
  addIPP(@Request() req: AuthRequest, @Body() dto: IppAddonDto) {
    return this.paymentsService.addFeaturedListing(req.user.id, dto.propertyId);
  }
}
