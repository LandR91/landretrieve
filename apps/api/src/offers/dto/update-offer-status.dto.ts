import { IsEnum } from "class-validator";

export enum OfferStatusEnum {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  COUNTERED = "COUNTERED",
}

export class UpdateOfferStatusDto {
  @IsEnum(OfferStatusEnum)
  status: OfferStatusEnum;
}
