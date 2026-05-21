import { Controller, Get, Post, Delete, Param, UseGuards, Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FavoritesService } from "./favorites.service";

interface AuthRequest extends Express.Request {
  user: { id: string };
}

@Controller("favorites")
@UseGuards(AuthGuard("jwt"))
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  getAll(@Request() req: AuthRequest) {
    return this.favoritesService.getAll(req.user.id);
  }

  @Post(":id")
  save(@Request() req: AuthRequest, @Param("id") propertyId: string) {
    return this.favoritesService.save(req.user.id, propertyId);
  }

  @Delete(":id")
  remove(@Request() req: AuthRequest, @Param("id") propertyId: string) {
    return this.favoritesService.remove(req.user.id, propertyId);
  }
}
