import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PropertyStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePropertyRequestDto } from "./dto/create-property-request.dto";

interface Professional {
  id: string;
  email: string;
  firstName: string | null;
  displayName: string | null;
}

@Injectable()
export class PropertyRequestsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createRequest(userId: string, dto: CreatePropertyRequestDto) {
    // Save the request to the database
    const request = await this.prisma.propertyRequest.create({
      data: {
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone ?? undefined,
        liveCountry: dto.liveCountry ?? undefined,
        liveCity: dto.liveCity ?? undefined,
        searchComuni: dto.searchComuni,
        searchRegioni: [],
        propertyTypes: dto.propertyTypes,
        priceMin: dto.priceMin ?? undefined,
        priceMax: dto.priceMax ?? undefined,
        message: dto.message ?? undefined,
        status: "new",
      },
    });

    // Find matching professionals by searching published properties in the requested comuni/types
    const matchingProperties = await this.prisma.property.findMany({
      where: {
        status: PropertyStatus.PUBLISHED,
        comune: {
          in: dto.searchComuni,
          mode: "insensitive",
        },
        AND: {
          propertyType: {
            in: dto.propertyTypes,
            mode: "insensitive",
          },
        },
      },
      select: {
        userId: true,
        agentId: true,
        agencyId: true,
        user: {
          select: { id: true, email: true, firstName: true, displayName: true },
        },
        agent: {
          select: {
            user: {
              select: { id: true, email: true, firstName: true, displayName: true },
            },
          },
        },
        agency: {
          select: {
            user: {
              select: { id: true, email: true, firstName: true, displayName: true },
            },
          },
        },
      },
    });

    // Deduplicate professionals by id
    const professionalsMap = new Map<string, Professional>();
    for (const prop of matchingProperties) {
      if (prop.user) {
        professionalsMap.set(prop.user.id, prop.user);
      }
      if (prop.agent?.user) {
        professionalsMap.set(prop.agent.user.id, prop.agent.user);
      }
      if (prop.agency?.user) {
        professionalsMap.set(prop.agency.user.id, prop.agency.user);
      }
    }
    const professionals = Array.from(professionalsMap.values());

    // Fire-and-forget notification emails
    this.sendNotificationEmails(professionals, request, dto).catch(() => {});

    return request;
  }

  private async sendNotificationEmails(
    professionals: Professional[],
    _request: { id: string },
    dto: CreatePropertyRequestDto,
  ): Promise<void> {
    const key = this.config.get<string>("RESEND_API_KEY");
    if (!key) return;

    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const appUrl = this.config.get<string>("FRONTEND_URL", "https://landretrieve.com");

    const subjectTypes = dto.propertyTypes.slice(0, 2).join(", ");
    const subjectComuni = dto.searchComuni.slice(0, 2).join(", ");
    const subject = `Nuova richiesta immobile: ${subjectTypes} in ${subjectComuni}`;

    const priceRange =
      dto.priceMin != null && dto.priceMax != null
        ? `€${dto.priceMin.toLocaleString("it-IT")} – €${dto.priceMax.toLocaleString("it-IT")}`
        : dto.priceMin != null
          ? `da €${dto.priceMin.toLocaleString("it-IT")}`
          : dto.priceMax != null
            ? `fino a €${dto.priceMax.toLocaleString("it-IT")}`
            : "Non specificato";

    for (const professional of professionals) {
      const greeting = professional.displayName ?? professional.firstName ?? "Professionista";
      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem">
          <h2 style="color:#111111">Nuova richiesta immobile</h2>
          <p style="color:#374151">
            Ciao <strong>${greeting}</strong>,<br/>
            un visitatore sta cercando un immobile che potrebbe corrispondere ai tuoi annunci su LandRetrieve.
          </p>
          <table style="width:100%;border-collapse:collapse;margin:1.25rem 0;font-size:.9rem;color:#374151">
            <tr>
              <td style="padding:.4rem 0;font-weight:600;width:140px">Tipologie:</td>
              <td style="padding:.4rem 0">${dto.propertyTypes.join(", ")}</td>
            </tr>
            <tr>
              <td style="padding:.4rem 0;font-weight:600">Comuni:</td>
              <td style="padding:.4rem 0">${dto.searchComuni.join(", ")}</td>
            </tr>
            <tr>
              <td style="padding:.4rem 0;font-weight:600">Budget:</td>
              <td style="padding:.4rem 0">${priceRange}</td>
            </tr>
            ${dto.message ? `<tr><td style="padding:.4rem 0;font-weight:600">Messaggio:</td><td style="padding:.4rem 0">${dto.message}</td></tr>` : ""}
          </table>
          <a href="${appUrl}/dashboard/offerte"
             style="display:inline-block;margin-top:1rem;padding:.75rem 1.5rem;background:#26A55B;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
            Vedi richiesta
          </a>
          <p style="margin-top:2rem;font-size:.8rem;color:#9ca3af">
            Puoi rispondere direttamente dalla tua dashboard LandRetrieve.com tramite la messaggistica.
          </p>
        </div>
      `;

      await resend.emails.send({
        from: "LandRetrieve <noreply@landretrieve.com>",
        to: professional.email,
        subject,
        html,
      });
    }
  }

  async getMyRequests(userId: string) {
    return this.prisma.propertyRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
