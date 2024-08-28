import { Sex } from "../../common/enums/sex.enum"
import { User } from "../users.entity"
import { Expose, plainToInstance } from "class-transformer"
import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator"

export class UpdateUserDto {
  @Expose()
  @IsOptional()
  @IsString()
  name: string

  @Expose()
  @IsOptional()
  @IsEnum(Sex)
  sex: Sex

  @Expose()
  @IsOptional()
  @IsUrl()
  picture: string

  static toDto(userEntity: User): UpdateUserDto {
    return plainToInstance(UpdateUserDto, userEntity, { excludeExtraneousValues: true })
  }

  static toDtoList(userEntityList: User[]): UpdateUserDto[] {
    return userEntityList.map((userEntity) => {
      return this.toDto(userEntity)
    })
  }
}
