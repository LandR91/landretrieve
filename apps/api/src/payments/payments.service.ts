import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import Stripe from "stripe";
import { SubscriptionPlan, SubscriptionStatus, BillingCycle } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  // ── Public methods ─────────────────────────────────────────────────────────

  async getSubscriptionStatus(userId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        invoices: { orderBy: { createdAt: "desc" }, take: 10 },
        agentBadges: { where: { isActive: true } },
        featuredListings: { where: { isActive: true } },
      },
    });
    return sub;
  }

  async getMyAgents(userId: string) {
    const agency = await this.prisma.agencyProfile.findFirst({ where: { userId } });
    if (!agency) return [];
    return this.prisma.agentProfile.findMany({
      where: { agencyId: agency.id },
      select: {
        id: true,
        user: { select: { id: true, displayName: true, email: true } },
      },
    });
  }

  async getMyProperties(userId: string) {
    const agency = await this.prisma.agencyProfile.findFirst({ where: { userId } });
    const where = agency
      ? { OR: [{ userId }, { agencyId: agency.id }] }
      : { userId };

    return this.prisma.property.findMany({
      where,
      select: { id: true, title: true, slug: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    plan: SubscriptionPlan,
    billingCycle: BillingCycle,
  ): Promise<{ url: string | null }> {
    const priceId =
      billingCycle === BillingCycle.YEARLY
        ? process.env.STRIPE_PRICE_CONNECT_YEARLY!
        : process.env.STRIPE_PRICE_CONNECT_MONTHLY!;

    const existing = await this.prisma.subscription.findUnique({ where: { userId } });
    const stripeCustomerId = existing?.stripeCustomerId ?? undefined;

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard/abbonamento/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/abbonamento`,
      metadata: { userId, plan, billingCycle },
      subscription_data: { metadata: { userId, plan } },
    });

    return { url: session.url };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) throw new BadRequestException("Nessun abbonamento attivo.");

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard/abbonamento`,
    });

    return { url: session.url };
  }

  async addBadgeAddon(userId: string, agentId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeSubId) throw new BadRequestException("Nessun abbonamento attivo.");

    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
      select: { id: true, agencyId: true },
    });
    if (!agent) throw new NotFoundException("Agente non trovato.");

    const agency = await this.prisma.agencyProfile.findFirst({ where: { userId } });
    if (!agency || agent.agencyId !== agency.id) {
      throw new BadRequestException("Agente non appartenente a questa agenzia.");
    }

    const existing = await this.prisma.agentBadgeAddon.findFirst({
      where: { subscriptionId: sub.id, agentId, isActive: true },
    });
    if (existing) throw new BadRequestException("Badge già attivo per questo agente.");

    await this.stripe.subscriptionItems.create({
      subscription: sub.stripeSubId,
      price: process.env.STRIPE_PRICE_BADGE!,
      quantity: 1,
    });

    await this.prisma.agentBadgeAddon.create({
      data: { subscriptionId: sub.id, agentId, price: 4.9, isActive: true },
    });

    return { success: true };
  }

  async addFeaturedListing(userId: string, propertyId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeSubId) throw new BadRequestException("Nessun abbonamento attivo.");

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, userId: true, agentId: true, agencyId: true, status: true },
    });
    if (!property) throw new NotFoundException("Immobile non trovato.");

    const agent = property.agentId
      ? await this.prisma.agentProfile.findUnique({
          where: { id: property.agentId },
          select: { userId: true, agencyId: true },
        })
      : null;

    const agency = property.agencyId
      ? await this.prisma.agencyProfile.findUnique({
          where: { id: property.agencyId },
          select: { userId: true },
        })
      : null;

    const actorAgency = await this.prisma.agencyProfile.findFirst({ where: { userId } });

    const isOwner =
      property.userId === userId ||
      agent?.userId === userId ||
      agency?.userId === userId ||
      (actorAgency != null &&
        (property.agencyId === actorAgency.id || agent?.agencyId === actorAgency.id));

    if (!isOwner) throw new BadRequestException("Non autorizzato su questo immobile.");

    const existing = await this.prisma.featuredListing.findFirst({
      where: { propertyId, isActive: true },
    });
    if (existing) throw new BadRequestException("Immobile già in primo piano.");

    await this.stripe.subscriptionItems.create({
      subscription: sub.stripeSubId,
      price: process.env.STRIPE_PRICE_IPP!,
      quantity: 1,
    });

    await this.prisma.featuredListing.create({
      data: {
        subscriptionId: sub.id,
        propertyId,
        userId,
        price: 7.9,
        isActive: true,
      },
    });

    return { success: true };
  }

  // Called by PropertiesService when a property is marked SOLD
  async deactivateIPPForProperty(propertyId: string): Promise<void> {
    const listings = await this.prisma.featuredListing.findMany({
      where: { propertyId, isActive: true },
      include: { subscription: { select: { stripeSubId: true } } },
    });

    for (const fl of listings) {
      await this.prisma.featuredListing.update({
        where: { id: fl.id },
        data: { isActive: false, endDate: new Date() },
      });

      // Best-effort removal of Stripe subscription item
      if (fl.subscription?.stripeSubId) {
        try {
          const items = await this.stripe.subscriptionItems.list({
            subscription: fl.subscription.stripeSubId,
          });
          const ippItem = items.data.find(
            (i) => i.price.id === process.env.STRIPE_PRICE_IPP,
          );
          if (ippItem) {
            await this.stripe.subscriptionItems.del(ippItem.id, {
              proration_behavior: "none",
            });
          }
        } catch {
          // non-critical
        }
      }

      // Email professional
      const user = await this.prisma.user.findUnique({
        where: { id: fl.userId },
        select: { email: true, displayName: true },
      });
      if (user?.email) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        resend.emails
          .send({
            from: "LandRetrieve <noreply@landretrieve.com>",
            to: user.email,
            subject: "Il tuo immobile è stato venduto — slot In Primo Piano terminato",
            html: `<p>Ciao ${user.displayName ?? ""},</p>
<p>Il tuo immobile è stato segnato come <strong>venduto</strong>. Lo slot <strong>In Primo Piano</strong> è stato disattivato e l'addebito si fermerà al prossimo ciclo di fatturazione.</p>
<p>Grazie per aver utilizzato LandRetrieve!</p>`,
          })
          .catch(() => {});
      }
    }
  }

  // ── Webhook handler ────────────────────────────────────────────────────────

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch {
      throw new BadRequestException("Webhook signature verification failed.");
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await this.syncSubscription(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await this.prisma.subscription.updateMany({
          where: { stripeSubId: sub.id },
          data: { status: SubscriptionStatus.CANCELLED },
        });
        break;
      }
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        await this.syncInvoice(inv, "paid");
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        await this.syncInvoice(inv, "failed");
        break;
      }
    }

    return { received: true };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async syncSubscription(sub: Stripe.Subscription) {
    const userId = sub.metadata?.userId;
    if (!userId) return;

    const priceId = sub.items.data[0]?.price.id;
    const billingCycle =
      priceId === process.env.STRIPE_PRICE_CONNECT_YEARLY
        ? BillingCycle.YEARLY
        : BillingCycle.MONTHLY;
    const basePrice = billingCycle === BillingCycle.YEARLY ? 322.92 : 29.9;
    const status = this.mapStripeStatus(sub.status);

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: sub.customer as string,
        stripeSubId: sub.id,
        plan: SubscriptionPlan.CONNECT,
        status,
        billingCycle,
        basePrice,
        totalPrice: basePrice,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      update: {
        stripeCustomerId: sub.customer as string,
        stripeSubId: sub.id,
        status,
        billingCycle,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    });
  }

  private async syncInvoice(inv: Stripe.Invoice, status: string) {
    const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
    if (!subId) return;

    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubId: subId },
    });
    if (!sub) return;

    await this.prisma.invoice.create({
      data: {
        subscriptionId: sub.id,
        stripeInvoiceId: inv.id,
        amount: (inv.amount_paid ?? 0) / 100,
        currency: inv.currency,
        status,
        pdfUrl: (inv as unknown as { invoice_pdf?: string }).invoice_pdf ?? undefined,
        paidAt: status === "paid" ? new Date() : undefined,
      },
    });
  }

  private mapStripeStatus(status: string): SubscriptionStatus {
    switch (status) {
      case "active":
        return SubscriptionStatus.ACTIVE;
      case "trialing":
        return SubscriptionStatus.TRIALING;
      case "canceled":
        return SubscriptionStatus.CANCELLED;
      case "past_due":
      case "unpaid":
        return SubscriptionStatus.EXPIRED;
      default:
        return SubscriptionStatus.INACTIVE;
    }
  }
}
