import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Stats ──────────────────────────────────────────────────────────────────

  async getStats(days: number) {
    const since = new Date(Date.now() - days * 86_400_000);

    const [
      totalPropertyViews,
      totalCategoryViews,
      viewsByCategoryRaw,
      insightGrouped,
      newUsers,
      revenueAgg,
      usersByRoleRaw,
      violations,
      pendingReviews,
    ] = await Promise.all([
      this.prisma.insight.count({ where: { time: { gte: since } } }),
      this.prisma.categoryView.count({ where: { createdAt: { gte: since } } }),
      this.prisma.categoryView.groupBy({
        by: ["categorySlug"],
        _count: { id: true },
        where: { createdAt: { gte: since } },
        orderBy: { _count: { id: "desc" } },
      }),
      this.prisma.insight.groupBy({
        by: ["listingId"],
        _count: { id: true },
        where: { time: { gte: since } },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.invoice.aggregate({
        where: { status: "paid", paidAt: { gte: since } },
        _sum: { amount: true },
      }),
      this.prisma.user.groupBy({
        by: ["role"],
        _count: { id: true },
      }),
      this.prisma.messageViolation.count({ where: { createdAt: { gte: since } } }),
      this.prisma.review.count({ where: { isApproved: false } }),
    ]);

    // Enrich top properties with title+slug
    const topPropertyIds = insightGrouped.map((g) => g.listingId);
    const topPropertiesData = await this.prisma.property.findMany({
      where: { id: { in: topPropertyIds } },
      select: { id: true, title: true, slug: true },
    });
    const propMap = new Map(topPropertiesData.map((p) => [p.id, p]));

    const topProperties = insightGrouped.map((g) => ({
      id: g.listingId,
      title: propMap.get(g.listingId)?.title ?? g.listingId,
      slug: propMap.get(g.listingId)?.slug ?? "",
      views: g._count.id,
    }));

    return {
      totalPropertyViews,
      totalCategoryViews,
      viewsByCategory: viewsByCategoryRaw.map((r) => ({
        slug: r.categorySlug,
        count: r._count.id,
      })),
      topProperties,
      newUsers,
      revenue: Number(revenueAgg._sum.amount ?? 0),
      usersByRole: usersByRoleRaw.map((r) => ({ role: r.role, count: r._count.id })),
      violations,
      pendingReviews,
    };
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUsers(q: string, role: string, page: number, limit: number) {
    const where = {
      AND: [
        role ? { role: role as UserRole } : {},
        q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" as const } },
                { displayName: { contains: q, mode: "insensitive" as const } },
                { firstName: { contains: q, mode: "insensitive" as const } },
                { lastName: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {},
      ],
    };

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          agentProfile: { select: { id: true, isVerified: true } },
          agencyProfile: { select: { id: true, isVerified: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Utente non trovato.");

    const data: Record<string, unknown> = {};
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.isVerified !== undefined) data.isVerified = dto.isVerified;

    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Utente non trovato.");
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  async getReviews(approvedParam?: string) {
    const isApproved = approvedParam === "true" ? true : approvedParam === "false" ? false : undefined;
    return this.prisma.review.findMany({
      where: isApproved !== undefined ? { isApproved } : {},
      include: {
        author: { select: { id: true, displayName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async approveReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException("Recensione non trovata.");
    return this.prisma.review.update({ where: { id }, data: { isApproved: true } });
  }

  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException("Recensione non trovata.");
    await this.prisma.review.delete({ where: { id } });
    return { success: true };
  }

  // ── Violations ────────────────────────────────────────────────────────────

  async getViolations(page: number, limit: number) {
    const [total, items] = await Promise.all([
      this.prisma.messageViolation.count(),
      this.prisma.messageViolation.findMany({
        include: {
          user: { select: { id: true, displayName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ── Badge (manual) ────────────────────────────────────────────────────────

  async setBadge(userId: string, verified: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        agentProfile: { select: { id: true } },
        agencyProfile: { select: { id: true } },
      },
    });
    if (!user) throw new NotFoundException("Utente non trovato.");

    if (user.agentProfile) {
      await this.prisma.agentProfile.update({
        where: { id: user.agentProfile.id },
        data: { isVerified: verified },
      });
    }
    if (user.agencyProfile) {
      await this.prisma.agencyProfile.update({
        where: { id: user.agencyProfile.id },
        data: { isVerified: verified },
      });
    }

    return { success: true };
  }

  async getBadgedProfiles() {
    const [agents, agencies] = await Promise.all([
      this.prisma.agentProfile.findMany({
        where: { isVerified: true },
        select: {
          id: true,
          isVerified: true,
          user: { select: { id: true, displayName: true, email: true } },
        },
      }),
      this.prisma.agencyProfile.findMany({
        where: { isVerified: true },
        select: {
          id: true,
          isVerified: true,
          user: { select: { id: true, displayName: true, email: true } },
        },
      }),
    ]);
    return { agents, agencies };
  }

  async searchProfessionals(q: string) {
    return this.prisma.user.findMany({
      where: {
        role: { in: [UserRole.AGENT, UserRole.AGENCY] },
        OR: q
          ? [
              { email: { contains: q, mode: "insensitive" } },
              { displayName: { contains: q, mode: "insensitive" } },
            ]
          : [{ id: { not: "" } }],
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        agentProfile: { select: { isVerified: true } },
        agencyProfile: { select: { isVerified: true } },
      },
      take: 30,
    });
  }

  // ── IPP (manual) ──────────────────────────────────────────────────────────

  async addIPP(propertyId: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, userId: true },
    });
    if (!property) throw new NotFoundException("Immobile non trovato.");

    const existing = await this.prisma.featuredListing.findFirst({
      where: { propertyId, isActive: true },
    });
    if (existing) return { success: true, alreadyActive: true };

    await this.prisma.featuredListing.create({
      data: {
        propertyId,
        userId: property.userId ?? userId,
        price: 0,
        isActive: true,
      },
    });

    return { success: true, alreadyActive: false };
  }

  async getActiveIPP() {
    const listings = await this.prisma.featuredListing.findMany({
      where: { isActive: true },
      orderBy: { startDate: "desc" },
    });

    const propertyIds = listings.map((l) => l.propertyId);
    const properties = await this.prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: { id: true, title: true, slug: true },
    });
    const propMap = new Map(properties.map((p) => [p.id, p]));

    return listings.map((l) => ({
      ...l,
      property: propMap.get(l.propertyId) ?? null,
    }));
  }

  async deactivateIPP(listingId: string) {
    await this.prisma.featuredListing.update({
      where: { id: listingId },
      data: { isActive: false, endDate: new Date() },
    });
    return { success: true };
  }

  async getProperties(q: string) {
    return this.prisma.property.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      select: { id: true, title: true, slug: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
