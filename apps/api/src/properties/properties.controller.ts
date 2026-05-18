import { Controller, Patch, Param, UseGuards, Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PropertiesService } from "./properties.service";

interface AuthRequest extends Express.Request {
  user: { id: string; email: string; role: string };
}

@Controller("properties")
@UseGuards(AuthGuard("jwt"))
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Patch(":id/publish")
  publishProperty(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.propertiesService.publishProperty(id, req.user.id);
  }

  @Patch(":id/unpublish")
  unpublishProperty(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.propertiesService.unpublishProperty(id, req.user.id);
  }

  @Patch(":id/sell")
  sellProperty(@Param("id") id: string, @Request() req: AuthRequest) {
    return this.propertiesService.sellProperty(id, req.user.id);
  }
}
