import { IsString, IsNotEmpty } from "class-validator";

export class AdminBadgeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
