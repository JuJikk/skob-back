import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common"
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

  async logIn(loginDto: LoginDto): Promise<{ __skob_jwt: string }> {
    const user = await this.usersService.getUserByEmail(loginDto.email)
    if (!user) {
      throw new UnauthorizedException(`Invalid email or password`)
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password)
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password")
    }
    return await this.signToken(user)
  }

  async register(registerDto: RegisterDto): Promise<{ __skob_jwt: string }> {
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
      __skob_jwt: await this.jwtService.signAsync(payload),
    }
  }
}
