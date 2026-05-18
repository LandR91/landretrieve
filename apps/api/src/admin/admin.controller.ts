import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AdminBadgeDto } from "./dto/admin-badge.dto";
import { AdminIppDto } from "./dto/admin-ipp.dto";

interface AuthRequest extends Express.Request {
  user: { id: string; email: string; role: string };
}

@Controller("admin")
@UseGuards(AuthGuard("jwt"), AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ── Stats ──────────────────────────────────────────────────────────────────

  @Get("stats")
  getStats(@Query("days", new DefaultValuePipe(7), ParseIntPipe) days: number) {
    return this.adminService.getStats(days);
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  @Get("users")
  getUsers(
    @Query("q") q = "",
    @Query("role") role = "",
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getUsers(q, role, page, limit);
  }

  @Patch("users/:id")
  updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete("users/:id")
  deleteUser(@Param("id") id: string) {
    return this.adminService.deleteUser(id);
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  @Get("reviews")
  getReviews(@Query("approved") approved?: string) {
    return this.adminService.getReviews(approved);
  }

  @Patch("reviews/:id/approve")
  approveReview(@Param("id") id: string) {
    return this.adminService.approveReview(id);
  }

  @Delete("reviews/:id")
  deleteReview(@Param("id") id: string) {
    return this.adminService.deleteReview(id);
  }

  // ── Violations ────────────────────────────────────────────────────────────

  @Get("violations")
  getViolations(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getViolations(page, limit);
  }

  // ── Badge ─────────────────────────────────────────────────────────────────

  @Get("badge")
  getBadged() {
    return this.adminService.getBadgedProfiles();
  }

  @Get("badge/search")
  searchProfessionals(@Query("q") q = "") {
    return this.adminService.searchProfessionals(q);
  }

  @Post("badge")
  setBadge(@Body() dto: AdminBadgeDto) {
    return this.adminService.setBadge(dto.userId, true);
  }

  @Delete("badge/:userId")
  removeBadge(@Param("userId") userId: string) {
    return this.adminService.setBadge(userId, false);
  }

  // ── IPP ───────────────────────────────────────────────────────────────────

  @Get("ipp")
  getIPP() {
    return this.adminService.getActiveIPP();
  }

  @Get("properties")
  getProperties(@Query("q") q = "") {
    return this.adminService.getProperties(q);
  }

  @Post("ipp")
  addIPP(@Body() dto: AdminIppDto, @Request() req: AuthRequest) {
    return this.adminService.addIPP(dto.propertyId, req.user.id);
  }

  @Delete("ipp/:id")
  deactivateIPP(@Param("id") id: string) {
    return this.adminService.deactivateIPP(id);
  }
}
