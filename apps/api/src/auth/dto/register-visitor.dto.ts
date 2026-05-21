import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

enum UserTitleEnum {
  SIG = "SIG",
  SIGRA = "SIGRA",
}

export class RegisterVisitorDto {
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsEmail({}, { message: "Email non valida" })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone: string;

  @IsString()
  @MinLength(8, { message: "La password deve avere almeno 8 caratteri" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "La password deve contenere maiuscole, minuscole e numeri",
  })
  password: string;

  @IsString()
  confirmPassword: string;

  @IsOptional()
  privacyAccepted?: boolean;
}
