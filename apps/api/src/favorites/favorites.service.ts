import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    const saved = await this.prisma.savedProperty.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            tipologiaPadre: true,
            tipologiaFiglio: true,
            tipoContratto: true,
            prezzo: true,
            valuta: true,
            status: true,
            isInPrimoPiano: true,
            comune: true,
            provincia: true,
            superficie: true,
            superficieTerreno: true,
            camere: true,
            bagni: true,
            annoConstruzione: true,
            images: { where: { isCover: true }, take: 1, select: { url: true } },
          },
        },
      },
    });

    return saved.map((s) => ({
      savedAt: s.createdAt,
      ...s.property,
      coverImage: s.property.images[0]?.url ?? null,
      images: undefined,
    }));
  }

  async save(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException("Immobile non trovato");

    try {
      await this.prisma.savedProperty.create({ data: { userId, propertyId } });
    } catch {
      throw new ConflictException("Immobile già nei preferiti");
    }
    return { saved: true };
  }

  async remove(userId: string, propertyId: string) {
    await this.prisma.savedProperty.deleteMany({ where: { userId, propertyId } });
    return { removed: true };
  }
}
