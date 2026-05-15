import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterVisitorDto } from "./dto/register-visitor.dto";
import { RegisterAgencyDto } from "./dto/register-agency.dto";
import { RegisterAgentDto } from "./dto/register-agent.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // ─── Login ──────────────────────────────────────────────────────────────────

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie("refresh_token", result.refreshToken, COOKIE_OPTIONS);
    return { user: result.user, accessToken: result.accessToken };
  }

  // ─── Register ───────────────────────────────────────────────────────────────

  @Post("register/visitor")
  @HttpCode(HttpStatus.CREATED)
  async registerVisitor(
    @Body() dto: RegisterVisitorDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerVisitor(dto);
    res.cookie("refresh_token", result.refreshToken, COOKIE_OPTIONS);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post("register/agency")
  @HttpCode(HttpStatus.CREATED)
  async registerAgency(
    @Body() dto: RegisterAgencyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerAgency(dto);
    res.cookie("refresh_token", result.refreshToken, COOKIE_OPTIONS);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post("register/agent")
  @HttpCode(HttpStatus.CREATED)
  async registerAgent(
    @Body() dto: RegisterAgentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerAgent(dto);
    res.cookie("refresh_token", result.refreshToken, COOKIE_OPTIONS);
    return { user: result.user, accessToken: result.accessToken };
  }

  // ─── Refresh / Logout / Me ──────────────────────────────────────────────────

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(user.sub, user.email, user.role);
    res.cookie("refresh_token", result.refreshToken, COOKIE_OPTIONS);
    return { accessToken: result.accessToken };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("refresh_token", { path: "/" });
    return { message: "Logout effettuato" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser("id") userId: string) {
    return this.authService.getMe(userId);
  }

  // ─── Password reset ─────────────────────────────────────────────────────────

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password/:token")
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param("token") token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword({ ...dto, token });
  }

  // ─── Gates ──────────────────────────────────────────────────────────────────

  @Get("gate/photo")
  @UseGuards(JwtAuthGuard)
  async checkPhotoGate(@CurrentUser("id") userId: string) {
    return this.authService.checkPhotoGate(userId);
  }

  @Get("gate/publish")
  @UseGuards(JwtAuthGuard)
  async checkPublishGate(@CurrentUser("id") userId: string) {
    return this.authService.checkPublishGate(userId);
  }
}
