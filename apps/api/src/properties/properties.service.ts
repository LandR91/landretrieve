import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import {
  PropertyStatus,
  ListingType,
  PropertyTypeParent,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PaymentsService } from "../payments/payments.service";
import { SearchPropertiesDto } from "./dto/search-properties.dto";

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private payments: PaymentsService,
  ) {}

  // ── SEARCH ───────────────────────────────────────────────────────────────

  async searchProperties(query: SearchPropertiesDto): Promise<{
    data: object[];
    total: number;
    hasMore: boolean;
    page: number;
  }> {
    const page   = Math.max(1, parseInt(query.page  ?? "1",  10));
    const limit  = Math.min(50, Math.max(1, parseInt(query.limit ?? "20", 10)));
    const skip   = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.PUBLISHED,
    };

    // Tipo contratto
    if (query.tipo === "vendita") where.listingType = ListingType.SALE;
    else if (query.tipo === "affitto") where.listingType = ListingType.RENT;

    // Ricerca testuale "dove" — estrae codice provincia "(XX)" o cerca per comune
    if (query.dove && !query.provincia && !query.comune) {
      const matchProv = query.dove.match(/\(([A-Z]{2})\)$/);
      if (matchProv) {
        where.provincia = { contains: matchProv[1], mode: "insensitive" };
      } else {
        const term = query.dove.split(",")[0].trim();
        where.comune = { contains: term, mode: "insensitive" };
      }
    }

    // Provincia / Comune da filtri avanzati (hanno priorità su "dove")
    if (query.provincia) where.provincia = { contains: query.provincia, mode: "insensitive" };
    if (query.comune)    where.comune    = { contains: query.comune,    mode: "insensitive" };

    // Tipologia — mapping stringa frontend → enum Prisma
    const typeMap: Partial<Record<string, PropertyTypeParent>> = {
      Ville:              PropertyTypeParent.VILLE,
      Agriturismi:        PropertyTypeParent.AGRITURISMI,
      "Aziende agricole": PropertyTypeParent.AZIENDE_AGRICOLE,
      "Azienda agricola": PropertyTypeParent.AZIENDE_AGRICOLE,
      Casale:             PropertyTypeParent.CASALE,
      Terreno:            PropertyTypeParent.TERRENO,
    };
    if (query.tipologia && typeMap[query.tipologia]) {
      where.propertyTypeParent = typeMap[query.tipologia];
    }
    if (query.tipologiaFiglio) {
      where.propertyType = { contains: query.tipologiaFiglio, mode: "insensitive" };
    }

    // Prezzo
    if (query.prezzoMin || query.prezzoMax) {
      where.price = {
        ...(query.prezzoMin && { gte: query.prezzoMin }),
        ...(query.prezzoMax && { lte: query.prezzoMax }),
      };
    }

    // Camere / bagni
    if (query.camere) where.bedrooms  = { gte: parseInt(query.camere, 10) };
    if (query.bagni)  where.bathrooms = { gte: parseInt(query.bagni,  10) };

    // Superficie / terreno
    if (query.superficieMin || query.superficieMax) {
      where.size = {
        ...(query.superficieMin && { gte: query.superficieMin }),
        ...(query.superficieMax && { lte: query.superficieMax }),
      };
    }
    if (query.terrenoMin || query.terrenoMax) {
      where.landSize = {
        ...(query.terrenoMin && { gte: query.terrenoMin }),
        ...(query.terrenoMax && { lte: query.terrenoMax }),
      };
    }

    // Anno costruzione
    if (query.annoMin || query.annoMax) {
      where.yearBuilt = {
        ...(query.annoMin && { gte: parseInt(query.annoMin, 10) }),
        ...(query.annoMax && { lte: parseInt(query.annoMax, 10) }),
      };
    }

    // Solo In Primo Piano
    if (query.soloInPrimoPiano === "true") where.isInPrimoPiano = true;

    // Bounds mappa (neLat,neLng,swLat,swLng)
    if (query.bounds) {
      const parts = query.bounds.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        const [neLat, neLng, swLat, swLng] = parts;
        where.lat = { gte: String(Math.min(swLat, neLat)), lte: String(Math.max(swLat, neLat)) };
        where.lng = { gte: String(Math.min(swLng, neLng)), lte: String(Math.max(swLng, neLng)) };
      }
    }

    // Caratteristiche (feature filter — AND semantics: tutte le caratteristiche selezionate)
    if (query.caratteristiche) {
      const features = query.caratteristiche
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
      if (features.length > 0) {
        where.features = { some: { feature: { in: features } } };
      }
    }

    const [properties, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isInPrimoPiano: "desc" },
          { publishedAt: "desc" },
        ],
        select: {
          id:                 true,
          title:              true,
          propertyTypeParent: true,
          propertyType:       true,
          listingType:        true,
          price:              true,
          currency:           true,
          status:             true,
          isInPrimoPiano:     true,
          lat:                true,
          lng:                true,
          comune:             true,
          provincia:          true,
          size:               true,
          landSize:           true,
          bedrooms:           true,
          bathrooms:          true,
          yearBuilt:          true,
          images: {
            orderBy: { order: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    const data = properties.map((p) => ({
      id:               p.id,
      title:            p.title,
      tipologiaPadre:   p.propertyTypeParent ?? "",
      tipologiaFiglio:  p.propertyType ?? "",
      tipoContratto:    p.listingType === ListingType.SALE ? "VENDITA" : "AFFITTO",
      prezzo:           p.price    ? Number(p.price)    : 0,
      valuta:           p.currency ?? "EUR",
      status:           p.status,
      isInPrimoPiano:   p.isInPrimoPiano,
      coverImage:       p.images[0]?.url ?? undefined,
      lat:              p.lat ? Number(p.lat) : undefined,
      lng:              p.lng ? Number(p.lng) : undefined,
      comune:           p.comune    ?? undefined,
      provincia:        p.provincia ?? undefined,
      superficie:       p.size     ? Number(p.size)     : undefined,
      superficieTerreno: p.landSize ? Number(p.landSize) : undefined,
      camere:           p.bedrooms  ?? undefined,
      bagni:            p.bathrooms ?? undefined,
      annoConstruzione: p.yearBuilt ?? undefined,
    }));

    return {
      data,
      total,
      hasMore: skip + data.length < total,
      page,
    };
  }

  // ── PUBLISH / UNPUBLISH / SELL ────────────────────────────────────────────

  async publishProperty(
    propertyId: string,
    userId: string,
  ): Promise<{ id: string; status: PropertyStatus }> {
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

    if (property.status === PropertyStatus.PUBLISHED)
      return { id: property.id, status: PropertyStatus.PUBLISHED };

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: PropertyStatus.PUBLISHED, publishedAt: new Date() },
    });

    this.notifications.notifyNewListing(propertyId).catch(() => {});
    return { id: propertyId, status: PropertyStatus.PUBLISHED };
  }

  async unpublishProperty(
    propertyId: string,
    userId: string,
  ): Promise<{ id: string; status: PropertyStatus }> {
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

  async sellProperty(
    propertyId: string,
    userId: string,
  ): Promise<{ id: string; status: PropertyStatus }> {
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

    this.payments.deactivateIPPForProperty(propertyId).catch(() => {});
    return { id: propertyId, status: PropertyStatus.SOLD };
  }
}
