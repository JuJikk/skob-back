import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common"
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

  async googleAuthenticate(user: User) {
    if (!user || user.provider !== "google") {
      throw new UnauthorizedException("the account with this email address was not registered through Google")
    }

    const userDb = await this.usersService.getUserByEmail(user.email)

    if (!userDb) {
      const createUser = await this.usersService.createUser(user)
      return await this.signToken(createUser)
    }

    return await this.signToken(userDb)
  }

  async logIn(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.usersService.getUserByEmail(loginDto.email)
    if (!user) {
      throw new UnauthorizedException(`Invalid email or password`)
    }
    if (user.provider === "google") {
      throw new BadRequestException("It looks like you used a different authorization method")
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password)
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password")
    }
    return await this.signToken(user)
  }

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    const isEmailExist = await this.usersService.getUserByEmail(registerDto.email)
    if (isEmailExist) {
      throw new BadRequestException("This email address is already busy")
    }

    const encryptedPassword = await bcrypt.hash(registerDto.password, await bcrypt.genSalt())

    const user = await this.usersService.createUser({
      ...registerDto,
      password: encryptedPassword,
    })

    return await this.signToken(user)
  }

  private async signToken(user: User) {
    const payload = { sub: user._id, email: user.email, roles: user.roles }
    return {
      token: await this.jwtService.signAsync(payload),
    }
  }
}
