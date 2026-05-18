import { IsString, IsNotEmpty } from "class-validator";

export class IppAddonDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;
}
