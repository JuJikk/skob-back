import { Controller, ForbiddenException, Get, NotFoundException, Param, Patch, UsePipes, ValidationPipe } from "@nestjs/common"
import { UsersService } from "./users.service"
import { EmailDto } from "../common/dto/email.dto"
import { User } from "../common/decorators/user.decorator"
import { JwtPayloadDto } from "../auth/dto/jwtpayload.dto"
import { Roles } from "../common/decorators/roles.decorator"
import { Role } from "../common/enums/role.enum"
import { UserDto } from "./dto/user.dto"

@Controller("users")
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get("me")
  async getMyAccount(@User() { email }: JwtPayloadDto) {
    const user = await this.userService.getUserByEmail(email)
    if (!user) {
      throw new NotFoundException(`User not found`)
    }
    return UserDto.toDto(user)
  }

  @Roles(Role.FOREMAN)
  @UsePipes(new ValidationPipe())
  @Get(":email")
  async getUserByEmail(@Param() params: EmailDto, @User() { email: userEmail }: JwtPayloadDto) {
    const user = await this.userService.getUserByEmail(params.email)
    if (!user) {
      throw new NotFoundException(`User not found with email ${params.email} not found.`)
    }
    if (user.ownerEmail !== userEmail) {
      throw new ForbiddenException(`access is denied to a Scout who is not in the your group`)
    }
    return UserDto.toDto(user)
  }

  @Get("scouts/all")
  @Roles(Role.FOREMAN)
  async getAllScoutsByForemanEmail(@User() { email }: JwtPayloadDto) {
    const scouts = await this.userService.getAllScoutsByForemanEmail(email)
    if (!scouts || !scouts.length) {
      throw new NotFoundException(`Foreman does not have scouts`)
    }
    return UserDto.toDtoList(scouts)
  }

  @UsePipes(new ValidationPipe())
  @Roles(Role.FOREMAN)
  @Patch(":email")
  async addScoutToGroup(@Param() params: EmailDto, @User() { email: foremanEmail }: JwtPayloadDto) {
    return await this.userService.addScoutToGroup(params.email, foremanEmail)
  }
}
