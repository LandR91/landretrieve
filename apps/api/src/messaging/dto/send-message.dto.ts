import { IsString, IsOptional, IsArray } from "class-validator";

export class SendMessageDto {
  @IsString()
  threadId: string;

  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  attachments?: Array<{ url: string; name: string; type: string; size: number }>;
}
