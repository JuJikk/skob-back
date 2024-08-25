import { Body, Controller, Get, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { Public } from "../common/decorators/public.decorator"
import { Response } from "express"
import { AuthGuard } from "@nestjs/passport"
import * as process from "node:process";

@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() req: any) {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    const { token } = await this.authService.googleAuthenticate(req.user)
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const expires = new Date(Date.now() + oneDayInMilliseconds)

    response.cookie("__skob_jwt", token, { secure: true, httpOnly: true, expires: expires, maxAge: oneDayInMilliseconds })
    response.redirect(process.env.FRONTEND_BASE_URL ?? "http://localhost:3000")
  }

  @UsePipes(new ValidationPipe())
  @Post("login")
  async logIn(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { token } = await this.authService.logIn(loginDto)
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const expires = new Date(Date.now() + oneDayInMilliseconds)

    response.cookie("__skob_jwt", token, { secure: true, httpOnly: true, expires: expires, maxAge: oneDayInMilliseconds })
  }

  @UsePipes(new ValidationPipe())
  @Post("register")
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const { token } = await this.authService.register(registerDto)
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const expires = new Date(Date.now() + oneDayInMilliseconds)

    response.cookie("__skob_jwt", token, { secure: true, httpOnly: true, expires: expires, maxAge: oneDayInMilliseconds })
  }

  @Get("logout")
  async logout(@Res({ passthrough: true }) response: Response) {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const pastDate = new Date(Date.now() - oneDayInMilliseconds)
    response.cookie("__skob_jwt", "", { secure: true, httpOnly: true, expires: pastDate, maxAge: 0 })
  }
}
