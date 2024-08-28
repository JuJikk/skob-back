import { Injectable, Logger, UnauthorizedException } from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { JwtService } from "@nestjs/jwt"
import { User } from "../users/users.entity"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  private readonly logger = new Logger(AuthService.name)

  async googleAuthenticate(user: User) {
    this.logger.log(`googleAuthenticate: ${user.email}, provider: ${user?.provider}`)
    if (!user || user.provider !== "google") {
      this.logger.log(`${user.email} registered by another method`)
      throw new UnauthorizedException("the account with this email address was not registered through Google")
    }

    const userDb = await this.usersService.getUserByEmail(user.email)

    if (!userDb) {
      this.logger.log(`${user.email} sign up first time`)
      const createUser = await this.usersService.createUser(user)
      return await this.signToken(createUser)
    }

    this.logger.log(`${userDb.name} signed in successfully`)
    return await this.signToken(userDb)
  }

  private async signToken(user: User) {
    const payload = { sub: user._id, email: user.email, roles: user.roles }
    return {
      token: await this.jwtService.signAsync(payload),
    }
  }
}
