import { IsString, IsNotEmpty, IsIn } from "class-validator";

export class RecordProfileViewDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsIn(["agent", "agency"])
  profileType: string;
}
