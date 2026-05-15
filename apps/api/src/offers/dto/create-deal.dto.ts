import { IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IsNumber, Min } from "class-validator";

export class CreateDealDto {
  @IsString()
  @IsOptional()
  group?: string;

  @IsString()
  title: string;

  @IsString()
  contactName: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  dealValue?: number;
}
