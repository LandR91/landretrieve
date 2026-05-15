import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { MessagingService } from "../messaging/messaging.service";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferStatusDto } from "./dto/update-offer-status.dto";
import { CreateDealDto } from "./dto/create-deal.dto";

interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatar: string | null;
  phone: string | null;
  role: string;
}

@Injectable()
export class OffersService {
  constructor(
    private prisma: PrismaService,
    private messaging: MessagingService,
    private config: ConfigService,
  ) {}

  // ── Submit offer (visitor) ─────────────────────────────────────────────────

  async createOffer(sender: AuthUser, dto: CreateOfferDto) {
    // Photo gate: sender must have an avatar
    if (!sender.avatar) {
      throw new BadRequestException(
        "Carica una foto profilo per poter inviare un'offerta.",
      );
    }

    // Verify receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
      select: { id: true, email: true, firstName: true, displayName: true },
    });
    if (!receiver) throw new NotFoundException("Professionista non trovato.");

    // Create the offer
    const offer = await this.prisma.propertyOffer.create({
      data: {
        propertyId: dto.propertyId,
        senderId: sender.id,
        receiverId: dto.receiverId,
        offerPrice: dto.offerPrice,
        currency: dto.currency ?? "EUR",
        senderName: sender.displayName ?? `${sender.firstName ?? ""} ${sender.id}`.trim(),
        senderEmail: sender.email,
        senderPhone: sender.phone ?? undefined,
        senderLocation: dto.senderLocation ?? undefined,
        senderAvatar: sender.avatar ?? undefined,
        message: dto.message ?? undefined,
      },
    });

    // Auto-create CrmLead for the professional
    const existingLead = await this.prisma.crmLead.findFirst({
      where: { userId: dto.receiverId, email: sender.email },
    });
    if (!existingLead) {
      await this.prisma.crmLead.create({
        data: {
          userId: dto.receiverId,
          email: sender.email,
          firstName: sender.firstName ?? undefined,
          lastName: undefined,
          mobile: sender.phone ?? undefined,
          country: dto.senderLocation ?? undefined,
          source: "offer",
          status: "new",
        },
      });
    }

    // Auto-open thread between sender and receiver
    const thread = await this.messaging.getOrCreateThread(
      sender.id,
      dto.receiverId,
      dto.propertyId,
    );

    // Save offer summary as the first message in the thread
    const senderName = sender.displayName ?? sender.firstName ?? "Visitatore";
    const formattedPrice = Number(dto.offerPrice).toLocaleString("it-IT");
    const autoMsg = [
      `💰 Offerta inviata: ${formattedPrice} ${dto.currency ?? "EUR"}`,
      dto.message ? `\n${dto.message}` : "",
    ]
      .join("")
      .trim();
    await this.messaging.saveMessage(thread.id, sender.id, autoMsg);

    // Link thread to offer
    await this.prisma.propertyOffer.update({
      where: { id: offer.id },
      data: { threadId: thread.id },
    });

    // Fire-and-forget email notification
    this.sendOfferEmail(receiver, senderName, offer.id, thread.id).catch(() => {});

    return { ...offer, threadId: thread.id };
  }

  // ── Email notification ─────────────────────────────────────────────────────

  private async sendOfferEmail(
    receiver: { email: string; displayName: string | null; firstName: string | null },
    senderName: string,
    offerId: string,
    threadId: string,
  ) {
    const key = this.config.get<string>("RESEND_API_KEY");
    if (!key) return;

    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const appUrl = this.config.get<string>("FRONTEND_URL", "https://landretrieve.com");

    await resend.emails.send({
      from: "LandRetrieve <noreply@landretrieve.com>",
      to: receiver.email,
      subject: `Nuova offerta ricevuta da ${senderName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem">
          <h2 style="color:#111111">Hai ricevuto una nuova offerta</h2>
          <p style="color:#374151">
            <strong>${senderName}</strong> ha inviato un'offerta per uno dei tuoi immobili su LandRetrieve.com.
          </p>
          <a href="${appUrl}/dashboard/offerte?id=${offerId}"
             style="display:inline-block;margin-top:1rem;padding:.75rem 1.5rem;background:#26A55B;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
            Vedi l'offerta
          </a>
          <p style="margin-top:2rem;font-size:.8rem;color:#9ca3af">
            Puoi rispondere direttamente dalla tua dashboard LandRetrieve.com.
          </p>
        </div>
      `,
    });
  }

  // ── Get offers ─────────────────────────────────────────────────────────────

  async getMyOffers(userId: string, role: string) {
    const isProfessional = role === "AGENCY" || role === "AGENT";

    return this.prisma.propertyOffer.findMany({
      where: isProfessional ? { receiverId: userId } : { senderId: userId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Update offer status (professional) ────────────────────────────────────

  async updateStatus(offerId: string, userId: string, dto: UpdateOfferStatusDto) {
    const offer = await this.prisma.propertyOffer.findUnique({
      where: { id: offerId },
    });
    if (!offer) throw new NotFoundException("Offerta non trovata.");
    if (offer.receiverId !== userId) throw new ForbiddenException("Non autorizzato.");

    return this.prisma.propertyOffer.update({
      where: { id: offerId },
      data: { status: dto.status },
    });
  }

  // ── Manual deals (professional) ───────────────────────────────────────────

  async createDeal(userId: string, dto: CreateDealDto) {
    // Find or create a lead for this contact
    let lead = await this.prisma.crmLead.findFirst({
      where: { userId, firstName: dto.contactName },
    });
    if (!lead) {
      lead = await this.prisma.crmLead.create({
        data: {
          userId,
          email: `manual-${Date.now()}@crm.local`,
          firstName: dto.contactName,
          source: "manual",
        },
      });
    }

    return this.prisma.crmDeal.create({
      data: {
        userId,
        title: dto.title,
        group: dto.group ?? undefined,
        agentId: dto.agentId ?? undefined,
        dealValue: dto.dealValue ?? undefined,
        leadId: lead.id,
        status: "open",
      },
    });
  }

  async getDeals(userId: string) {
    return this.prisma.crmDeal.findMany({
      where: { userId },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
