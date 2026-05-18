import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  // ── Leads ──────────────────────────────────────────────────────────────────

  async getLeads(userId: string) {
    return this.prisma.crmLead.findMany({
      where: { userId },
      include: {
        notes: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { deals: true, enquiries: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateLead(
    leadId: string,
    userId: string,
    data: { status?: string; firstName?: string; lastName?: string; mobile?: string; city?: string; country?: string },
  ) {
    const lead = await this.prisma.crmLead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException("Lead non trovato.");
    if (lead.userId !== userId) throw new ForbiddenException("Non autorizzato.");
    return this.prisma.crmLead.update({ where: { id: leadId }, data });
  }

  async bulkDeleteLeads(ids: string[], userId: string) {
    const leads = await this.prisma.crmLead.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });
    const validIds = leads.map((l) => l.id);
    if (validIds.length === 0) return { deleted: 0 };
    await this.prisma.crmLead.deleteMany({ where: { id: { in: validIds } } });
    return { deleted: validIds.length };
  }

  // ── Enquiries ──────────────────────────────────────────────────────────────

  async getEnquiries(userId: string) {
    return this.prisma.crmEnquiry.findMany({
      where: { userId },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true, mobile: true } },
        property: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateEnquiry(
    enquiryId: string,
    userId: string,
    data: { status?: string; agentId?: string },
  ) {
    const enquiry = await this.prisma.crmEnquiry.findUnique({ where: { id: enquiryId } });
    if (!enquiry) throw new NotFoundException("Richiesta non trovata.");
    if (enquiry.userId !== userId) throw new ForbiddenException("Non autorizzato.");
    return this.prisma.crmEnquiry.update({ where: { id: enquiryId }, data });
  }

  async bulkDeleteEnquiries(ids: string[], userId: string) {
    const records = await this.prisma.crmEnquiry.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });
    const validIds = records.map((r) => r.id);
    if (validIds.length === 0) return { deleted: 0 };
    await this.prisma.crmEnquiry.deleteMany({ where: { id: { in: validIds } } });
    return { deleted: validIds.length };
  }

  // ── Activities ─────────────────────────────────────────────────────────────

  async getActivities(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.crmActivity.count({ where: { userId } }),
      this.prisma.crmActivity.findMany({
        where: { userId },
        include: {
          lead: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async bulkDeleteActivities(ids: string[], userId: string) {
    const records = await this.prisma.crmActivity.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });
    const validIds = records.map((r) => r.id);
    if (validIds.length === 0) return { deleted: 0 };
    await this.prisma.crmActivity.deleteMany({ where: { id: { in: validIds } } });
    return { deleted: validIds.length };
  }
}
