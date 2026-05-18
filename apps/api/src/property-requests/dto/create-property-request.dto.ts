import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ArrayMinSize,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreatePropertyRequestDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  liveCountry?: string;

  @IsString()
  @IsOptional()
  liveCity?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  searchComuni: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  propertyTypes: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMin?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMax?: number;

  @IsString()
  @IsOptional()
  message?: string;

  @IsBoolean()
  privacyAccepted: boolean;
}
