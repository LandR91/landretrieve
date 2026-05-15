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

enum UserTitleEnum {
  SIG = "SIG",
  SIGRA = "SIGRA",
}

enum PlanEnum {
  CONNECT = "CONNECT",
  SIGNATURE = "SIGNATURE",
}

enum BillingEnum {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export class RegisterAgentDto {
  @IsEnum(UserTitleEnum, { message: "Titolo non valido" })
  title: "SIG" | "SIGRA";

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsString()
  country: string;

  @IsEmail({}, { message: "Email non valida" })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone: string;

  @IsString()
  taxNumber: string;

  @IsString()
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
