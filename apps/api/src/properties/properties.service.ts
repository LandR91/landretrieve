import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PropertyStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PaymentsService } from "../payments/payments.service";

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private payments: PaymentsService,
  ) {}

  async publishProperty(propertyId: string, userId: string): Promise<{ id: string; status: PropertyStatus }> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, userId: true, agentId: true, agencyId: true, status: true },
    });

    if (!property) throw new NotFoundException("Immobile non trovato.");

    // Ownership: userId must match property owner, agent, or agency
    const agent = property.agentId
      ? await this.prisma.agentProfile.findUnique({
          where: { id: property.agentId },
          select: { userId: true },
        })
      : null;

    const agency = property.agencyId
      ? await this.prisma.agencyProfile.findUnique({
          where: { id: property.agencyId },
          select: { userId: true },
        })
      : null;

    const isOwner =
      property.userId === userId ||
      agent?.userId === userId ||
      agency?.userId === userId;

    if (!isOwner) throw new ForbiddenException("Non autorizzato.");

    if (property.status === PropertyStatus.PUBLISHED) {
      return { id: property.id, status: PropertyStatus.PUBLISHED };
    }

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.PUBLISHED, publishedAt: new Date() },
    });

    // Fire-and-forget visitor notifications
    this.notifications.notifyNewListing(propertyId).catch(() => {});

    return { id: propertyId, status: PropertyStatus.PUBLISHED };
  }

  async unpublishProperty(propertyId: string, userId: string): Promise<{ id: string; status: PropertyStatus }> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, userId: true },
    });

    if (!property) throw new NotFoundException("Immobile non trovato.");
    if (property.userId !== userId) throw new ForbiddenException("Non autorizzato.");

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.DRAFT },
    });

    return { id: propertyId, status: PropertyStatus.DRAFT };
  }

  async sellProperty(propertyId: string, userId: string): Promise<{ id: string; status: PropertyStatus }> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, userId: true, agentId: true, agencyId: true, status: true },
    });

    if (!property) throw new NotFoundException("Immobile non trovato.");

    const agent = property.agentId
      ? await this.prisma.agentProfile.findUnique({
          where: { id: property.agentId },
          select: { userId: true },
        })
      : null;

    const agency = property.agencyId
      ? await this.prisma.agencyProfile.findUnique({
          where: { id: property.agencyId },
          select: { userId: true },
        })
      : null;

    const isOwner =
      property.userId === userId ||
      agent?.userId === userId ||
      agency?.userId === userId;

    if (!isOwner) throw new ForbiddenException("Non autorizzato.");

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.SOLD },
    });

    // Deactivate IPP slots and notify professional — fire-and-forget
    this.payments.deactivateIPPForProperty(propertyId).catch(() => {});

    return { id: propertyId, status: PropertyStatus.SOLD };
  }
}
