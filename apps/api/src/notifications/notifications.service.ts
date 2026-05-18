import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PropertyTypeParent } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MessagingGateway } from "../messaging/messaging.gateway";

// ── Haversine ─────────────────────────────────────────────────────────────────

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Type → category slug mapping ─────────────────────────────────────────────

const PARENT_TO_SLUG: Record<string, string> = {
  VILLE: "ville",
  AGRITURISMI: "agriturismi",
  AZIENDE_AGRICOLE: "aziende-agricole",
  CASALE: "casale",
  TERRENO: "terreno",
};

interface MatchedUser {
  id: string;
  email: string;
  firstName: string | null;
  displayName: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private gateway: MessagingGateway,
  ) {}

  // ── Entry point ──────────────────────────────────────────────────────────────

  async notifyNewListing(propertyId: string): Promise<void> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        slug: true,
        comune: true,
        regione: true,
        propertyTypeParent: true,
        propertyType: true,
        lat: true,
        lng: true,
        price: true,
        currency: true,
        listingType: true,
      },
    });
    if (!property) return;

    const categorySlugs = this.getCategorySlugs(
      property.propertyTypeParent,
      property.propertyType,
    );

    const usersMap = new Map<string, MatchedUser>();

    // ── A. CategoryView ────────────────────────────────────────────────────────
    const cvRecords = await this.prisma.categoryView.findMany({
      where: {
        userId: { not: null },
        categorySlug: { in: categorySlugs },
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            displayName: true,
            role: true,
          },
        },
      },
      distinct: ["userId"],
    });

    for (const cv of cvRecords) {
      if (cv.user && cv.user.role === "VISITOR") {
        usersMap.set(cv.user.id, cv.user);
      }
    }

    // ── B+C. SavedSearch + Haversine ───────────────────────────────────────────
    if (property.lat != null && property.lng != null) {
      const propLat = Number(property.lat);
      const propLng = Number(property.lng);

      const searches = await this.prisma.savedSearch.findMany({
        where: {
          centerLat: { not: null },
          centerLng: { not: null },
        },
        select: {
          centerLat: true,
          centerLng: true,
          filters: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              displayName: true,
              role: true,
            },
          },
        },
      });

      for (const ss of searches) {
        if (!ss.user || ss.user.role !== "VISITOR") continue;
        if (ss.centerLat == null || ss.centerLng == null) continue;

        const dist = haversineKm(
          Number(ss.centerLat),
          Number(ss.centerLng),
          propLat,
          propLng,
        );
        if (dist > 30) continue;

        // Optional type filter: if saved search specifies a type, check match
        if (
          !this.filtersMatchProperty(
            ss.filters as Record<string, unknown> | null,
            property.propertyTypeParent,
            property.propertyType,
            categorySlugs,
          )
        ) {
          continue;
        }

        usersMap.set(ss.user.id, ss.user);
      }
    }

    const users = Array.from(usersMap.values());
    if (users.length === 0) return;

    const appUrl = this.config.get<string>(
      "FRONTEND_URL",
      "https://landretrieve.com",
    );
    const propUrl = `${appUrl}/immobili/${property.slug}`;

    // ── In-app (Socket.io) ─────────────────────────────────────────────────────
    const socketPayload = {
      propertyId: property.id,
      title: property.title,
      slug: property.slug,
      comune: property.comune ?? "",
      categoria: (property.propertyType ?? property.propertyTypeParent ?? "").toString(),
      price: property.price != null ? Number(property.price) : null,
      currency: property.currency,
      url: propUrl,
    };

    for (const user of users) {
      this.gateway.sendToUser(user.id, "new_listing", socketPayload);
    }

    // ── Email (fire-and-forget) ────────────────────────────────────────────────
    this.sendEmails(users, socketPayload, propUrl).catch(() => {});
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private getCategorySlugs(
    parent: PropertyTypeParent | null,
    subtype: string | null,
  ): string[] {
    const slugs: string[] = [];
    if (parent && PARENT_TO_SLUG[parent]) slugs.push(PARENT_TO_SLUG[parent]);
    if (subtype) slugs.push(subtype.toLowerCase().replace(/\s+/g, "-"));
    return slugs;
  }

  private filtersMatchProperty(
    filters: Record<string, unknown> | null,
    parent: PropertyTypeParent | null,
    subtype: string | null,
    categorySlugs: string[],
  ): boolean {
    if (!filters) return true;

    const filterType = (
      (filters.tipologiaFiglio as string | undefined) ??
      (filters.tipologiaPadre as string | undefined) ??
      (filters.categoria as string | undefined)
    );

    // No type in filters → match everything (broad search)
    if (!filterType) return true;

    const ft = filterType.toLowerCase();
    if (subtype && ft === subtype.toLowerCase()) return true;
    if (categorySlugs.some((s) => ft.includes(s) || s.includes(ft))) return true;
    if (parent && ft.includes(PARENT_TO_SLUG[parent] ?? "")) return true;

    return false;
  }

  private async sendEmails(
    users: MatchedUser[],
    payload: {
      title: string;
      comune: string;
      categoria: string;
      price: number | null;
      currency: string;
      url: string;
    },
    _propUrl: string,
  ): Promise<void> {
    const key = this.config.get<string>("RESEND_API_KEY");
    if (!key) return;

    const { Resend } = await import("resend");
    const resend = new Resend(key);

    const priceFormatted =
      payload.price != null
        ? new Intl.NumberFormat("it-IT", {
            style: "currency",
            currency: payload.currency,
            maximumFractionDigits: 0,
          }).format(payload.price)
        : "Prezzo da definire";

    for (const user of users) {
      const greeting =
        (user.displayName ?? user.firstName ?? "") || "Utente";
      await resend.emails.send({
        from: "LandRetrieve <noreply@landretrieve.com>",
        to: user.email,
        subject: `Nuovo immobile: ${payload.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem">
            <h2 style="color:#111111">Nuovo immobile corrispondente ai tuoi interessi</h2>
            <p style="color:#374151">
              Ciao <strong>${greeting}</strong>,<br/>
              è stato pubblicato un nuovo immobile che potrebbe interessarti su LandRetrieve.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:1.25rem 0;font-size:.9rem;color:#374151">
              <tr>
                <td style="padding:.4rem 0;font-weight:600;width:120px">Titolo:</td>
                <td style="padding:.4rem 0">${payload.title}</td>
              </tr>
              <tr>
                <td style="padding:.4rem 0;font-weight:600">Tipologia:</td>
                <td style="padding:.4rem 0">${payload.categoria}</td>
              </tr>
              <tr>
                <td style="padding:.4rem 0;font-weight:600">Comune:</td>
                <td style="padding:.4rem 0">${payload.comune}</td>
              </tr>
              <tr>
                <td style="padding:.4rem 0;font-weight:600">Prezzo:</td>
                <td style="padding:.4rem 0">${priceFormatted}</td>
              </tr>
            </table>
            <a href="${payload.url}"
               style="display:inline-block;margin-top:1rem;padding:.75rem 1.5rem;background:#26A55B;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
              Vedi immobile
            </a>
            <p style="margin-top:2rem;font-size:.8rem;color:#9ca3af">
              Ricevi questa email perché hai salvato una ricerca o visitato questa categoria su LandRetrieve.com.
            </p>
          </div>
        `,
      });
    }
  }
}
