import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Role } from "../common/enums/role.enum"
import { ROLES_KEY } from "../common/decorators/roles.decorator"
import { JwtPayloadDto } from "./dto/jwtpayload.dto"
import { UsersService } from "../users/users.service"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService
  ) {}

  private readonly logger = new Logger(RolesGuard.name)

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
    if (!requiredRoles) {
      return true
    }
    const { user: payload }: { user: JwtPayloadDto } = context.switchToHttp().getRequest()
    const user = await this.userService.getUserByEmail(payload.email)
    if (!user) {
      this.logger.log("Invalid email while role protect checked")
      throw new UnauthorizedException(`Invalid email`)
    }
    const result = requiredRoles.some((role) => user.roles?.includes(role))
    this.logger.log(`${user.email} ${result ? "have access" : "does not have access"}`)
    return result
  }
}
