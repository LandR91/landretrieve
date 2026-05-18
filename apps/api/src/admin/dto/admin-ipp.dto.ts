import { IsString, IsNotEmpty } from "class-validator";

export class AdminIppDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;
}
