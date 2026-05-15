import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";
import { MessagingService } from "./messaging.service";
import { UploadsService } from "../uploads/uploads.service";
import { CreateThreadDto } from "./dto/create-thread.dto";
import { memoryStorage } from "multer";

@Controller("messaging")
@UseGuards(AuthGuard("jwt"))
export class MessagingController {
  constructor(
    private messagingService: MessagingService,
    private uploadsService: UploadsService,
  ) {}

  @Get("threads")
  getThreads(@Request() req: Express.Request & { user: { id: string } }) {
    return this.messagingService.getThreads(req.user.id);
  }

  @Post("threads")
  createThread(
    @Body() dto: CreateThreadDto,
    @Request() req: Express.Request & { user: { id: string } },
  ) {
    return this.messagingService.getOrCreateThread(
      req.user.id,
      dto.receiverId,
      dto.propertyId,
    );
  }

  @Get("threads/:id/messages")
  getMessages(
    @Param("id") threadId: string,
    @Request() req: Express.Request & { user: { id: string } },
  ) {
    return this.messagingService.getMessages(threadId, req.user.id);
  }

  @Post("threads/:id/read")
  markRead(
    @Param("id") threadId: string,
    @Request() req: Express.Request & { user: { id: string } },
  ) {
    return this.messagingService.markRead(threadId, req.user.id);
  }

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadAttachment(file);
  }
}
