import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
} from "class-validator";

enum PlanEnum {
  CONNECT = "CONNECT",
  SIGNATURE = "SIGNATURE",
}

enum BillingEnum {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export class RegisterAgencyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  agencyName: string;

  @IsString()
  country: string;

  @IsEmail({}, { message: "Email agenzia non valida" })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  taxNumber: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  license: string;

  @IsString()
  @MinLength(8, { message: "La password deve avere almeno 8 caratteri" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "La password deve contenere maiuscole, minuscole e numeri",
  })
  password: string;

  @IsString()
  confirmPassword: string;

  @IsEnum(PlanEnum)
  plan: "CONNECT" | "SIGNATURE";

  @IsEnum(BillingEnum)
  billingCycle: "MONTHLY" | "YEARLY";

  @IsOptional()
  badgeAddon?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  featuredCount?: number;

  @IsOptional()
  privacyAccepted?: boolean;
}
