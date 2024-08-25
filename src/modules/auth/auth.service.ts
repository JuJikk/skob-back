import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common"
import * as bcrypt from "bcrypt"
import { UsersService } from "../users/users.service"
import { LoginDto } from "./dto/login.dto"
import { JwtService } from "@nestjs/jwt"
import { RegisterDto } from "./dto/register.dto"
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

  async logIn(loginDto: LoginDto): Promise<{ token: string }> {
    this.logger.log(`login with email ${loginDto.email}`)
    const user = await this.usersService.getUserByEmail(loginDto.email)
    if (!user) {
      this.logger.log(`user with email ${loginDto.email} not found`)
      throw new UnauthorizedException(`Invalid email or password`)
    }
    if (user.provider === "google") {
      this.logger.log(`user with email ${loginDto.email} signup with wrong method`)
      throw new BadRequestException("It looks like you used a different authorization method")
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password)
    if (!isMatch) {
      this.logger.log(`user with email ${loginDto.email} input wrong password`)
      throw new UnauthorizedException("Invalid email or password")
    }
    this.logger.log(`user with email ${loginDto.email} signed in`)
    return await this.signToken(user)
  }

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    this.logger.log(`register with email ${registerDto.email}`)
    const isEmailExist = await this.usersService.getUserByEmail(registerDto.email)
    if (isEmailExist) {
      this.logger.log(`${registerDto.email} is busy`)
      throw new BadRequestException("This email address is already busy")
    }

    const encryptedPassword = await bcrypt.hash(registerDto.password, await bcrypt.genSalt())

    const user = await this.usersService.createUser({
      ...registerDto,
      password: encryptedPassword,
    })
    this.logger.log(`${user.email} registered successfully`)
    return await this.signToken(user)
  }

  private async signToken(user: User) {
    const payload = { sub: user._id, email: user.email, roles: user.roles }
    return {
      token: await this.jwtService.signAsync(payload),
    }
  }
}
