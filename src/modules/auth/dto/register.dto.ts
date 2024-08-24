import { IsEmail, IsEnum, IsString, IsStrongPassword, Length } from "class-validator"
import { Sex } from "../../common/enums/sex.enum"

export class RegisterDto {
  @IsString()
  @Length(4, 40)
  name: string

  @IsEmail()
  email: string

  @IsStrongPassword()
  password: string

  @IsEnum(Sex)
  sex: Sex
}
