import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IsString, IsArray, IsOptional } from "class-validator";
import { CrmService } from "./crm.service";

interface AuthRequest extends Express.Request {
  user: { id: string; email: string; role: string };
}

class BulkDeleteDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

class UpdateLeadDto {
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() firstName?: string;
  @IsString() @IsOptional() lastName?: string;
  @IsString() @IsOptional() mobile?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() country?: string;
}

class UpdateEnquiryDto {
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() agentId?: string;
}

@Controller("crm")
@UseGuards(AuthGuard("jwt"))
export class CrmController {
  constructor(private crmService: CrmService) {}

  // ── Leads ──────────────────────────────────────────────────────────────────

  @Get("leads")
  getLeads(@Request() req: AuthRequest) {
    return this.crmService.getLeads(req.user.id);
  }

  @Patch("leads/:id")
  updateLead(
    @Param("id") id: string,
    @Body() dto: UpdateLeadDto,
    @Request() req: AuthRequest,
  ) {
    return this.crmService.updateLead(id, req.user.id, dto);
  }

  @Delete("leads")
  bulkDeleteLeads(@Body() dto: BulkDeleteDto, @Request() req: AuthRequest) {
    return this.crmService.bulkDeleteLeads(dto.ids, req.user.id);
  }

  // ── Enquiries ──────────────────────────────────────────────────────────────

  @Get("enquiries")
  getEnquiries(@Request() req: AuthRequest) {
    return this.crmService.getEnquiries(req.user.id);
  }

  @Patch("enquiries/:id")
  updateEnquiry(
    @Param("id") id: string,
    @Body() dto: UpdateEnquiryDto,
    @Request() req: AuthRequest,
  ) {
    return this.crmService.updateEnquiry(id, req.user.id, dto);
  }

  @Delete("enquiries")
  bulkDeleteEnquiries(@Body() dto: BulkDeleteDto, @Request() req: AuthRequest) {
    return this.crmService.bulkDeleteEnquiries(dto.ids, req.user.id);
  }

  // ── Activities ─────────────────────────────────────────────────────────────

  @Get("activities")
  getActivities(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Request() req: AuthRequest,
  ) {
    return this.crmService.getActivities(
      req.user.id,
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(50, parseInt(limit, 10) || 10),
    );
  }

  @Delete("activities")
  bulkDeleteActivities(@Body() dto: BulkDeleteDto, @Request() req: AuthRequest) {
    return this.crmService.bulkDeleteActivities(dto.ids, req.user.id);
  }
}
