import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { Public } from "../common/decorators/public.decorator"

@Public()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post("login")
  async logIn(@Body() loginDto: LoginDto) {
    return this.authService.logIn(loginDto)
  }

  @UsePipes(new ValidationPipe())
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto)
  }
}
