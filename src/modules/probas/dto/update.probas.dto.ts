import { IsIn, IsInt, IsString, Max, Min } from "class-validator"

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
  @Min(0)
  @Max(1)
  value: number
}
