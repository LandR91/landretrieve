import { Injectable } from "@nestjs/common";
import { PropertyStatus, PropertyTypeParent } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type DonutItem = { label: string; value: number; color: string };
const CHART_COLORS = ["#26A55B", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899", "#e5e7eb"];

const TYPE_LABELS: Partial<Record<PropertyTypeParent, string>> = {
  VILLE: "Ville",
  AGRITURISMI: "Agriturismi",
  AZIENDE_AGRICOLE: "Az. Agricole",
  CASALE: "Casali",
  TERRENO: "Terreni",
};

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  // ── Public: portfolio data for donut charts ────────────────────────────────

  async getPortfolio(profileType: string, slug: string) {
    let profileId: string | null = null;
    let propertyFilter: Record<string, unknown>;

    if (profileType === "agent") {
      const agent = await this.prisma.agentProfile.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!agent) return null;
      profileId = agent.id;
      propertyFilter = { agentId: agent.id, status: PropertyStatus.PUBLISHED };
    } else {
      const agency = await this.prisma.agencyProfile.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!agency) return null;
      profileId = agency.id;
      propertyFilter = { agencyId: agency.id, status: PropertyStatus.PUBLISHED };
    }

    const properties = await this.prisma.property.findMany({
      where: propertyFilter,
      select: { propertyTypeParent: true, propertyType: true, listingType: true, comune: true },
    });

    // Group by property type
    const typeMap = new Map<string, number>();
    for (const p of properties) {
      const label =
        (p.propertyTypeParent ? TYPE_LABELS[p.propertyTypeParent] : null) ??
        p.propertyType ??
        "Altro";
      typeMap.set(label, (typeMap.get(label) ?? 0) + 1);
    }
    const byType: DonutItem[] = [...typeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: CHART_COLORS[i % CHART_COLORS.length] }));

    // Group by listing type
    const listingMap = new Map<string, number>();
    for (const p of properties) {
      const label = p.listingType === "RENT" ? "In affitto" : "In vendita";
      listingMap.set(label, (listingMap.get(label) ?? 0) + 1);
    }
    const byListingType: DonutItem[] = [...listingMap.entries()].map(([label, value], i) => ({
      label, value, color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    // Top 4 comuni + altri
    const comuneMap = new Map<string, number>();
    for (const p of properties) {
      if (p.comune) comuneMap.set(p.comune, (comuneMap.get(p.comune) ?? 0) + 1);
    }
    const sortedComuni = [...comuneMap.entries()].sort((a, b) => b[1] - a[1]);
    const topComuni = sortedComuni.slice(0, 4);
    const othersCount = sortedComuni.slice(4).reduce((sum, [, c]) => sum + c, 0);
    if (othersCount > 0) topComuni.push(["Altri", othersCount]);
    const byComune: DonutItem[] = topComuni.map(([label, value], i) => ({
      label: label as string,
      value: value as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    return { profileId, byType, byListingType, byComune, total: properties.length };
  }

  // ── Public: record profile view ────────────────────────────────────────────

  async recordProfileView(slug: string, profileType: string, ip?: string) {
    let profileId: string | null = null;

    if (profileType === "agent") {
      const agent = await this.prisma.agentProfile.findUnique({
        where: { slug },
        select: { id: true },
      });
      profileId = agent?.id ?? null;
    } else {
      const agency = await this.prisma.agencyProfile.findUnique({
        where: { slug },
        select: { id: true },
      });
      profileId = agency?.id ?? null;
    }

    if (!profileId) return { recorded: false };

    await this.prisma.profileView.create({
      data: { profileId, profileType, ipAddress: ip },
    });

    return { recorded: true };
  }

  // ── Private: dashboard time-series stats ───────────────────────────────────

  async getDashboardStats(
    userId: string,
    period: string,
    startDate?: string,
    endDate?: string,
    propertyId?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        agentProfile: { select: { id: true } },
        agencyProfile: { select: { id: true } },
      },
    });

    const { since, until } = this.parsePeriod(period, startDate, endDate);

    // Profile views for this professional's profile page
    const profileId = user?.agentProfile?.id ?? user?.agencyProfile?.id;
    const profileViewRecords = profileId
      ? await this.prisma.profileView.findMany({
          where: { profileId, createdAt: { gte: since, lte: until } },
          select: { createdAt: true },
        })
      : [];

    // Property views (Insight) — filtered to this professional's properties
    const propertyOwnerFilter = propertyId
      ? { id: propertyId }
      : user?.agentProfile
        ? { agentId: user.agentProfile.id }
        : user?.agencyProfile
          ? { agencyId: user.agencyProfile.id }
          : { userId };

    const insights = await this.prisma.insight.findMany({
      where: { time: { gte: since, lte: until }, property: propertyOwnerFilter },
      select: { time: true },
    });

    // Properties list for the selector dropdown
    const propFilter = user?.agentProfile
      ? { agentId: user.agentProfile.id }
      : user?.agencyProfile
        ? { agencyId: user.agencyProfile.id }
        : { userId };

    const myProperties = await this.prisma.property.findMany({
      where: propFilter,
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const series = this.buildTimeSeries(
      period,
      since,
      until,
      profileViewRecords.map((r) => r.createdAt),
      insights.map((r) => r.time),
    );

    return {
      series,
      totalProfileViews: profileViewRecords.length,
      totalPropertyViews: insights.length,
      myProperties,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private parsePeriod(period: string, startDate?: string, endDate?: string) {
    const until = endDate ? new Date(endDate) : new Date();
    let since: Date;
    switch (period) {
      case "24h":  since = new Date(Date.now() - 24 * 3_600_000); break;
      case "7d":   since = new Date(Date.now() - 7  * 86_400_000); break;
      case "30d":  since = new Date(Date.now() - 30 * 86_400_000); break;
      case "custom": since = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86_400_000); break;
      default:     since = new Date(Date.now() - 7  * 86_400_000);
    }
    return { since, until };
  }

  private buildTimeSeries(
    period: string,
    since: Date,
    until: Date,
    profileTimes: Date[],
    propertyTimes: Date[],
  ): { date: string; profileViews: number; propertyViews: number }[] {
    if (period === "24h") {
      const buckets = Array.from({ length: 24 }, (_, h) => ({
        date: `${String(h).padStart(2, "0")}:00`,
        profileViews: 0,
        propertyViews: 0,
      }));
      profileTimes.forEach((t) => { buckets[new Date(t).getHours()].profileViews++; });
      propertyTimes.forEach((t) => { buckets[new Date(t).getHours()].propertyViews++; });
      return buckets;
    }

    const days = Math.ceil((until.getTime() - since.getTime()) / 86_400_000) + 1;
    const cursor = new Date(since);
    cursor.setHours(0, 0, 0, 0);
    const buckets: { date: string; profileViews: number; propertyViews: number }[] = [];

    for (let d = 0; d < days; d++) {
      buckets.push({
        date: `${String(cursor.getDate()).padStart(2, "0")}/${String(cursor.getMonth() + 1).padStart(2, "0")}`,
        profileViews: 0,
        propertyViews: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const key = (t: Date) =>
      `${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")}`;

    const bmap = new Map(buckets.map((b) => [b.date, b]));
    profileTimes.forEach((t) => { const b = bmap.get(key(new Date(t))); if (b) b.profileViews++; });
    propertyTimes.forEach((t) => { const b = bmap.get(key(new Date(t))); if (b) b.propertyViews++; });

    return buckets;
  }
}
