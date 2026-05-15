import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserRole, UserTitle } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterVisitorDto } from "./dto/register-visitor.dto";
import { RegisterAgencyDto } from "./dto/register-agency.dto";
import { RegisterAgentDto } from "./dto/register-agent.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

// Token reset password valido 1 ora
const RESET_EXPIRY_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        agencyProfile: {
          select: { id: true, slug: true, name: true, logo: true, isVerified: true },
        },
        agentProfile: {
          select: { id: true, slug: true, isVerified: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Credenziali non valide");
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException("Credenziali non valide");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const { password: _p, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  // ─── Register Visitor ───────────────────────────────────────────────────────

  async registerVisitor(dto: RegisterVisitorDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Le password non coincidono");
    }
    await this.checkEmailAvailable(dto.email);

    const hashed = await bcrypt.hash(dto.password, 12);
    const username = await this.uniqueUsername(dto.firstName, dto.lastName);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username,
        password: hashed,
        role: UserRole.VISITOR,
        title: dto.title as UserTitle,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: `${dto.firstName} ${dto.lastName}`,
        country: dto.country,
        phone: dto.phone,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const { password: _p, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  // ─── Register Agency ────────────────────────────────────────────────────────

  async registerAgency(dto: RegisterAgencyDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Le password non coincidono");
    }
    await this.checkEmailAvailable(dto.email);

    const hashed = await bcrypt.hash(dto.password, 12);
    const username = await this.uniqueUsername(dto.agencyName);
    const slug = await this.uniqueAgencySlug(dto.agencyName);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username,
        password: hashed,
        role: UserRole.AGENCY,
        displayName: dto.agencyName,
        country: dto.country,
        phone: dto.phone,
        agencyProfile: {
          create: {
            name: dto.agencyName,
            slug,
            taxNumber: dto.taxNumber,
            licenses: dto.license,
            phone: dto.phone,
            email: dto.email.toLowerCase(),
          },
        },
        subscription: {
          create: {
            plan: dto.plan as any,
            status: "TRIALING" as any,
            billingCycle: dto.billingCycle as any,
            basePrice: 29.9,
            badgeAddon: dto.badgeAddon ?? false,
            featuredCount: dto.featuredCount ?? 0,
            totalPrice: this.calcTotal(dto),
          },
        },
      },
      include: {
        agencyProfile: { select: { id: true, slug: true, name: true, isVerified: true } },
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const { password: _p, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  // ─── Register Agent ─────────────────────────────────────────────────────────

  async registerAgent(dto: RegisterAgentDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Le password non coincidono");
    }
    await this.checkEmailAvailable(dto.email);

    const hashed = await bcrypt.hash(dto.password, 12);
    const username = await this.uniqueUsername(dto.firstName, dto.lastName);
    const slug = await this.uniqueAgentSlug(`${dto.firstName} ${dto.lastName}`);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username,
        password: hashed,
        role: UserRole.AGENT,
        title: dto.title as UserTitle,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: `${dto.firstName} ${dto.lastName}`,
        country: dto.country,
        phone: dto.phone,
        agentProfile: {
          create: {
            slug,
            license: dto.license,
            taxNumber: dto.taxNumber,
            mobile: dto.phone,
            email: dto.email.toLowerCase(),
          },
        },
        subscription: {
          create: {
            plan: dto.plan as any,
            status: "TRIALING" as any,
            billingCycle: dto.billingCycle as any,
            basePrice: 29.9,
            badgeAddon: dto.badgeAddon ?? false,
            featuredCount: dto.featuredCount ?? 0,
            totalPrice: this.calcTotal(dto),
          },
        },
      },
      include: {
        agentProfile: { select: { id: true, slug: true, isVerified: true } },
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const { password: _p, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  // ─── Refresh tokens ─────────────────────────────────────────────────────────

  async refreshTokens(userId: string, email: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException();
    return this.generateTokens(userId, email, role);
  }

  // ─── Me ─────────────────────────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        title: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatar: true,
        phone: true,
        country: true,
        isVerified: true,
        createdAt: true,
        agencyProfile: {
          select: {
            id: true, slug: true, name: true, logo: true,
            isVerified: true, taxNumber: true, licenses: true,
          },
        },
        agentProfile: {
          select: {
            id: true, slug: true, isVerified: true,
            agencyId: true, license: true, taxNumber: true,
          },
        },
        subscription: {
          select: { plan: true, status: true, billingCycle: true, currentPeriodEnd: true },
        },
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  // ─── Forgot password ────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // risposta neutra: non rivelare se l'email esiste
    if (!user) {
      return {
        message: "Se l'email è registrata riceverai le istruzioni a breve.",
      };
    }

    // Genera token casuale e scadenza 1h
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + RESET_EXPIRY_MS);

    // Salvo il token hashed nello username temporaneo (campo reused per semplicità)
    // In produzione usare un modello PasswordResetToken dedicato
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // usiamo displayName come storage temporaneo per il token reset
        // (in FASE 19 aggiungeremo la tabella dedicata e l'invio email via Resend)
      },
    });

    // TODO FASE 19: inviare email via Resend con link reset
    console.log(`[DEV] Reset link: /reset-password?token=${token}&expiry=${expiry.toISOString()}`);

    return {
      message: "Se l'email è registrata riceverai le istruzioni a breve.",
    };
  }

  // ─── Reset password ─────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Le password non coincidono");
    }
    // TODO FASE 19: validare token dalla tabella dedicata
    throw new BadRequestException("Funzionalità disponibile nella FASE 19 (Email transazionali)");
  }

  // ─── Gate foto profilo ──────────────────────────────────────────────────────

  async checkPhotoGate(userId: string): Promise<{ hasPhoto: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        avatar: true,
        agencyProfile: { select: { logo: true } },
      },
    });
    if (!user) throw new NotFoundException("Utente non trovato");

    const hasPhoto =
      user.role === "AGENCY"
        ? !!user.agencyProfile?.logo
        : !!user.avatar;

    return { hasPhoto };
  }

  // ─── Gate pubblicazione ─────────────────────────────────────────────────────

  async checkPublishGate(userId: string): Promise<{ canPublish: boolean; missing: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        avatar: true,
        agencyProfile: { select: { logo: true, taxNumber: true, licenses: true } },
        agentProfile: { select: { license: true, taxNumber: true } },
      },
    });
    if (!user) throw new NotFoundException("Utente non trovato");

    const missing: string[] = [];

    if (user.role === "AGENCY") {
      if (!user.agencyProfile?.logo) missing.push("Logo agenzia");
      if (!user.agencyProfile?.taxNumber) missing.push("Partita IVA");
      if (!user.agencyProfile?.licenses) missing.push("N° Licenza");
    } else if (user.role === "AGENT") {
      if (!user.avatar) missing.push("Foto profilo");
      if (!user.agentProfile?.taxNumber) missing.push("Partita IVA");
      if (!user.agentProfile?.license) missing.push("N° Licenza");
    }

    return { canPublish: missing.length === 0, missing };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get("JWT_SECRET"),
        expiresIn: this.config.get("JWT_EXPIRES_IN") ?? "15m",
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get("JWT_REFRESH_EXPIRES_IN") ?? "7d",
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async checkEmailAvailable(email: string) {
    const exists = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (exists) throw new ConflictException("Email già registrata");
  }

  private slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  private async uniqueUsername(first: string, last?: string) {
    const base = this.slugify(last ? `${first} ${last}` : first);
    let candidate = base;
    let i = 1;
    while (await this.prisma.user.findUnique({ where: { username: candidate } })) {
      candidate = `${base}-${i++}`;
    }
    return candidate;
  }

  private async uniqueAgencySlug(name: string) {
    const base = this.slugify(name);
    let candidate = base;
    let i = 1;
    while (await this.prisma.agencyProfile.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${i++}`;
    }
    return candidate;
  }

  private async uniqueAgentSlug(name: string) {
    const base = this.slugify(name);
    let candidate = base;
    let i = 1;
    while (await this.prisma.agentProfile.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${i++}`;
    }
    return candidate;
  }

  private calcTotal(dto: {
    plan: string;
    billingCycle: string;
    badgeAddon?: boolean;
    featuredCount?: number;
  }): number {
    const base = 29.9;
    const badge = (dto.badgeAddon ?? false) ? 4.9 : 0;
    const featured = (dto.featuredCount ?? 0) * 7.9;
    const monthly = base + badge + featured;
    if (dto.billingCycle === "YEARLY") {
      const discount = dto.plan === "SIGNATURE" ? 0.12 : 0.1;
      return parseFloat((monthly * 12 * (1 - discount)).toFixed(2));
    }
    return parseFloat(monthly.toFixed(2));
  }
}
