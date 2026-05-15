import { IsString, IsNumber, IsOptional, IsBoolean, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateOfferDto {
  @IsString()
  propertyId: string;

  @IsString()
  receiverId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offerPrice: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  senderLocation?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsBoolean()
  privacyAccepted: boolean;
}
