import { IsInt, IsString } from "class-validator"

export class UpdateProbasDto {
  @IsString()
  updateField: string

  @IsInt()
  value: number
}
