import { Body, Controller, Get, Post, Res, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { Public } from "../common/decorators/public.decorator"
import { Response } from "express"

@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post("login")
  async logIn(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { __skob_jwt } = await this.authService.logIn(loginDto)
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const expires = new Date(Date.now() + oneDayInMilliseconds)

    response.cookie("__skob_jwt", __skob_jwt, { secure: true, httpOnly: true, expires: expires, maxAge: oneDayInMilliseconds })
  }

  @UsePipes(new ValidationPipe())
  @Post("register")
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const { __skob_jwt } = await this.authService.register(registerDto)
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const expires = new Date(Date.now() + oneDayInMilliseconds)

    response.cookie("__skob_jwt", __skob_jwt, { secure: true, httpOnly: true, expires: expires, maxAge: oneDayInMilliseconds })
  }

  @Get("logout")
  async logout(@Res({ passthrough: true }) response: Response) {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const pastDate = new Date(Date.now() - oneDayInMilliseconds)
    response.cookie("__skob_jwt", "", { secure: true, httpOnly: true, expires: pastDate, maxAge: 0 })
  }
}
