import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PropertiesService } from "./properties.service";
import { SearchPropertiesDto } from "./dto/search-properties.dto";

interface AuthRequest extends Express.Request {
  user: { id: string; email: string; role: string };
}

@Controller("properties")
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  /** Ricerca pubblica — nessuna autenticazione richiesta */
  @Get("search")
  searchProperties(@Query() query: SearchPropertiesDto) {
    return this.propertiesService.searchProperties(query);
  }

  @Patch(":id/publish")
  @UseGuards(AuthGuard("jwt"))
  publishProperty(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.propertiesService.publishProperty(id, req.user.id);
  }

  @Patch(":id/unpublish")
  @UseGuards(AuthGuard("jwt"))
  unpublishProperty(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.propertiesService.unpublishProperty(id, req.user.id);
  }

  @Patch(":id/sell")
  @UseGuards(AuthGuard("jwt"))
  sellProperty(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.propertiesService.sellProperty(id, req.user.id);
  }
}
