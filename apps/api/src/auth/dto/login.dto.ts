import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email non valida" })
  email: string;

  @IsString()
  @MinLength(6, { message: "Password troppo corta" })
  password: string;
}
