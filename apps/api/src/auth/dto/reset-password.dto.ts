import { IsString, MinLength, Matches } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: "La password deve avere almeno 8 caratteri" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "La password deve contenere maiuscole, minuscole e numeri",
  })
  password: string;

  @IsString()
  confirmPassword: string;
}
