import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { OffersService } from "./offers.service";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferStatusDto } from "./dto/update-offer-status.dto";
import { CreateDealDto } from "./dto/create-deal.dto";

interface AuthRequest extends Express.Request {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatar: string | null;
    phone: string | null;
  };
}

@Controller("offers")
@UseGuards(AuthGuard("jwt"))
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  createOffer(@Body() dto: CreateOfferDto, @Request() req: AuthRequest) {
    return this.offersService.createOffer(req.user, dto);
  }

  @Get()
  getMyOffers(@Request() req: AuthRequest) {
    return this.offersService.getMyOffers(req.user.id, req.user.role);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") offerId: string,
    @Body() dto: UpdateOfferStatusDto,
    @Request() req: AuthRequest,
  ) {
    return this.offersService.updateStatus(offerId, req.user.id, dto);
  }

  @Post("deals")
  createDeal(@Body() dto: CreateDealDto, @Request() req: AuthRequest) {
    return this.offersService.createDeal(req.user.id, dto);
  }

  @Get("deals")
  getDeals(@Request() req: AuthRequest) {
    return this.offersService.getDeals(req.user.id);
  }
}
