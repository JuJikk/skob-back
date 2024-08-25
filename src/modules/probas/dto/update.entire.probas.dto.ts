import { IsIn, IsInt, IsString, Max, Min } from "class-validator"

type ProbaName = "zeroProba" | "firstProba" | "secondProba"

export class UpdateEntireProbasDto {
  @IsString()
  @IsIn(["zeroProba", "firstProba", "secondProba"])
  probaName: ProbaName

  @IsInt()
  @Min(0)
  @Max(1)
  value: number
}
