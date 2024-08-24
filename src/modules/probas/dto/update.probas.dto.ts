import { IsIn, IsInt, IsString } from "class-validator";

type ProbaName = "zeroProba" | "firstProba" | "secondProba"

export class UpdateProbasDto {
  @IsString()
  @IsIn(["zeroProba", "firstProba", "secondProba"])
  probaName: ProbaName

  @IsString()
  probaSubName: string

  @IsInt()
  probaIndex: number

  @IsInt()
  value: number
}
