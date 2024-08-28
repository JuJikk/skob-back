import { Controller, Delete, ForbiddenException, Get, Logger, NotFoundException, Param, Patch, UsePipes, ValidationPipe } from "@nestjs/common"
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

  private readonly logger = new Logger(UsersController.name)

  @Get("me")
  async getMyAccount(@User() { email }: JwtPayloadDto) {
    this.logger.log("GET: /users/me")
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
    this.logger.log("GET: /users/:email")
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
    this.logger.log("GET: /users/scouts/all")
    const scouts = await this.userService.getAllScoutsByForemanEmail(email)
    if (!scouts || !scouts.length) {
      throw new NotFoundException(`Foreman does not have scouts`)
    }
    return UserDto.toDtoList(scouts)
  }

  @UsePipes(new ValidationPipe())
  @Roles(Role.FOREMAN)
  @Delete(":email")
  async removeScoutFromGroup(@Param() params: EmailDto, @User() { email: foremanEmail }: JwtPayloadDto) {
    this.logger.log("DELETE: /users/:email")
    await this.userService.removeScoutFromGroup(params.email, foremanEmail)
  }
}
