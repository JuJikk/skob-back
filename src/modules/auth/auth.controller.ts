import { Controller, Get, Logger, Req, Res, UseGuards } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { Public } from "../common/decorators/public.decorator"
import { Response } from "express"
import { AuthGuard } from "@nestjs/passport"
import * as process from "node:process"

@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name)

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() req: any) {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    this.logger.log("GET: /auth/google/callback")
    const { token } = await this.authService.googleAuthenticate(req.user)
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const expires = new Date(Date.now() + oneDayInMilliseconds)

    response.cookie("__skob_jwt", token, { secure: true, httpOnly: true, expires: expires, maxAge: oneDayInMilliseconds })
    response.redirect(process.env.FRONTEND_BASE_URL ?? "http://localhost:5173")
  }

  @Get("logout")
  async logout(@Res({ passthrough: true }) response: Response) {
    this.logger.log("POST: /auth/logout")
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const pastDate = new Date(Date.now() - oneDayInMilliseconds)
    response.cookie("__skob_jwt", "", { secure: true, httpOnly: true, expires: pastDate, maxAge: 0 })
  }
}
