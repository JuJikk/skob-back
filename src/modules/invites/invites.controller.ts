import { Controller, Get, Logger, Param, Res, ServiceUnavailableException, UsePipes, ValidationPipe } from "@nestjs/common"
import { InvitesService } from "./invites.service"
import { Public } from "../common/decorators/public.decorator"
import { Roles } from "../common/decorators/roles.decorator"
import { Role } from "../common/enums/role.enum"
import { Response } from "express"
import * as process from "node:process"
import { EmailDto } from "../common/dto/email.dto"
import { User } from "../common/decorators/user.decorator"
import { JwtPayloadDto } from "../auth/dto/jwtpayload.dto"

@Controller("invites")
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {
    this.FRONTEND_URL = process.env.FRONTEND_BASE_URL ?? ""
    if (!this.FRONTEND_URL) {
      throw new ServiceUnavailableException("FRONTEND_BASE_URL is missing")
    }
  }

  private readonly FRONTEND_URL: string
  private readonly logger = new Logger(InvitesController.name)

  @UsePipes(new ValidationPipe())
  @Roles(Role.FOREMAN)
  @Get("send/:email")
  async sendInvite(@Param() params: EmailDto, @User() { email: foremanEmail }: JwtPayloadDto) {
    this.logger.log("GET: /invites/send/:email")
    await this.invitesService.sendInvite(params.email, foremanEmail)
  }

  @Get(":id")
  @Public()
  async acceptInvite(@Param("id") id: string, @Res({ passthrough: true }) res: Response) {
    this.logger.log("GET: /invites/:id")
    await this.invitesService.acceptInvite(id)
    res.redirect(this.FRONTEND_URL)
  }
}
