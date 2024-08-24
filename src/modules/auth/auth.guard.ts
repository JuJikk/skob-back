import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Reflector } from "@nestjs/core"
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator"
import { Request } from "express"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])

    if (isPublic) {
      return true
    }

    const req = context.switchToHttp().getRequest()
    const jwt_token = this.extractTokenFromHeader(req)

    if (!jwt_token) {
      throw new UnauthorizedException()
    }

    try {
      req["user"] = await this.jwtService.verifyAsync(jwt_token, { secret: "secret" })
    } catch {
      throw new UnauthorizedException()
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }
}
