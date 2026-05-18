import { IsString, IsNotEmpty } from "class-validator";

export class BadgeAddonDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;
}
