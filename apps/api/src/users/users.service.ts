import { Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { Readable } from "stream";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
        agencyProfile: true,
        agentProfile: true,
        subscription: true,
      },
    });
    if (!user) throw new NotFoundException("Utente non trovato");
    return user;
  }

  async hasPhoto(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true, role: true, agencyProfile: { select: { logo: true } } },
    });
    if (!user) return false;
    if (user.role === "AGENCY") return !!user.agencyProfile?.logo;
    return !!user.avatar;
  }

  async deleteMe(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async exportUserData(userId: string): Promise<StreamableFile> {
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
        phone: true,
        country: true,
        isVerified: true,
        createdAt: true,
        agencyProfile: true,
        agentProfile: true,
        subscription: {
          select: { plan: true, status: true, billingCycle: true, currentPeriodEnd: true },
        },
        violations: {
          select: { reason: true, createdAt: true },
        },
      },
    });
    if (!user) throw new NotFoundException("Utente non trovato");
    const json = JSON.stringify(user, null, 2);
    const stream = Readable.from(Buffer.from(json, "utf-8"));
    return new StreamableFile(stream, {
      type: "application/json",
      disposition: `attachment; filename="landretrieve-data-${userId}.json"`,
    });
  }

  async hasPublishRequirements(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        avatar: true,
        agencyProfile: { select: { logo: true, taxNumber: true, licenses: true } },
        agentProfile: { select: { license: true, taxNumber: true } },
      },
    });
    if (!user) return false;
    if (user.role === "AGENCY") {
      return !!(
        user.agencyProfile?.logo &&
        user.agencyProfile?.taxNumber &&
        user.agencyProfile?.licenses
      );
    }
    if (user.role === "AGENT") {
      return !!(
        user.avatar &&
        user.agentProfile?.license &&
        user.agentProfile?.taxNumber
      );
    }
    return false;
  }
}
