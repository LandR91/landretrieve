import { IsOptional, IsString } from "class-validator";

export class SearchPropertiesDto {
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsString() dove?: string;
  @IsOptional() @IsString() tipologia?: string;
  @IsOptional() @IsString() tipologiaFiglio?: string;
  @IsOptional() @IsString() prezzoMin?: string;
  @IsOptional() @IsString() prezzoMax?: string;
  @IsOptional() @IsString() camere?: string;
  @IsOptional() @IsString() bagni?: string;
  @IsOptional() @IsString() superficieMin?: string;
  @IsOptional() @IsString() superficieMax?: string;
  @IsOptional() @IsString() terrenoMin?: string;
  @IsOptional() @IsString() terrenoMax?: string;
  @IsOptional() @IsString() annoMin?: string;
  @IsOptional() @IsString() annoMax?: string;
  @IsOptional() @IsString() caratteristiche?: string;
  @IsOptional() @IsString() soloInPrimoPiano?: string;
  @IsOptional() @IsString() provincia?: string;
  @IsOptional() @IsString() comune?: string;
  @IsOptional() @IsString() bounds?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}
