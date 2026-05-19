import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";

interface AuthRequest extends Express.Request {
  user: { id: string; email: string; role: string };
}

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Delete("me")
  @HttpCode(204)
  @UseGuards(AuthGuard("jwt"))
  async deleteMe(@Request() req: AuthRequest): Promise<void> {
    await this.usersService.deleteMe(req.user.id);
  }

  @Get("me/export")
  @UseGuards(AuthGuard("jwt"))
  exportData(@Request() req: AuthRequest) {
    return this.usersService.exportUserData(req.user.id);
  }
}
