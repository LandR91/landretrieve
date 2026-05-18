import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PropertyRequestsService } from "./property-requests.service";
import { CreatePropertyRequestDto } from "./dto/create-property-request.dto";

interface AuthRequest extends Express.Request {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatar: string | null;
    phone: string | null;
  };
}

@Controller("property-requests")
@UseGuards(AuthGuard("jwt"))
export class PropertyRequestsController {
  constructor(private propertyRequestsService: PropertyRequestsService) {}

  @Post()
  createRequest(
    @Body() dto: CreatePropertyRequestDto,
    @Request() req: AuthRequest,
  ) {
    return this.propertyRequestsService.createRequest(req.user.id, dto);
  }

  @Get()
  getMyRequests(@Request() req: AuthRequest) {
    return this.propertyRequestsService.getMyRequests(req.user.id);
  }
}
