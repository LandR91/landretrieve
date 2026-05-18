import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { StatsService } from "./stats.service";
import { RecordProfileViewDto } from "./dto/record-profile-view.dto";

interface AuthRequest extends Express.Request {
  user: { id: string; email: string; role: string };
}

@Controller("stats")
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get("portfolio")
  getPortfolio(
    @Query("profileType") profileType: string,
    @Query("slug") slug: string,
  ) {
    return this.statsService.getPortfolio(profileType, slug);
  }

  @Post("profile-view")
  @HttpCode(200)
  recordProfileView(
    @Body() dto: RecordProfileViewDto,
    @Req() req: Express.Request & { ip?: string },
  ) {
    return this.statsService.recordProfileView(dto.slug, dto.profileType, req.ip);
  }

  @Get("dashboard")
  @UseGuards(AuthGuard("jwt"))
  getDashboard(
    @Request() req: AuthRequest,
    @Query("period") period = "7d",
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("propertyId") propertyId?: string,
  ) {
    return this.statsService.getDashboardStats(
      req.user.id,
      period,
      startDate,
      endDate,
      propertyId,
    );
  }
}
