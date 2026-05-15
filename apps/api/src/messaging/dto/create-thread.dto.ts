import { IsString, IsOptional } from "class-validator";

export class CreateThreadDto {
  @IsString()
  receiverId: string;

  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsString()
  @IsOptional()
  initialMessage?: string;
}
