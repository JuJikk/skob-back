import { Sex } from "../../common/enums/sex.enum"
import { User } from "../users.entity"
import { Role } from "../../common/enums/role.enum"
import { Expose, plainToInstance } from "class-transformer"

export class UserDto {
  @Expose()
  email: string

  @Expose()
  ownerEmail: string

  @Expose()
  name: string

  @Expose()
  roles: Role[]

  @Expose()
  sex: Sex

  @Expose()
  zeroProba: any

  @Expose()
  firstProba: any

  @Expose()
  secondProba: any

  @Expose()
  picture: string

  static toDto(userEntity: User): UserDto {
    return plainToInstance(UserDto, userEntity, { excludeExtraneousValues: true })
  }

  static toDtoList(userEntityList: User[]): UserDto[] {
    return userEntityList.map((userEntity) => {
      return this.toDto(userEntity)
    })
  }
}
