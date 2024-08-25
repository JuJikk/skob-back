import { Body, Controller, Param, Patch, UsePipes, ValidationPipe } from "@nestjs/common"
import { ProbasService } from "./probas.service"
import { UpdateProbasDto } from "./dto/update.probas.dto"
import { EmailDto } from "../common/dto/email.dto"
import { Role } from "../common/enums/role.enum"
import { Roles } from "../common/decorators/roles.decorator"
import { User } from "../common/decorators/user.decorator"
import { JwtPayloadDto } from "../auth/dto/jwtpayload.dto"
import { UpdateEntireProbasDto } from "./dto/update.entire.probas.dto";

@Controller("probas")
export class ProbasController {
  constructor(private readonly probasService: ProbasService) {}

  @Patch(":email")
  @Roles(Role.FOREMAN)
  @UsePipes(new ValidationPipe())
  async updateProba(@Param() params: EmailDto, @User() { email: foremanEmail }: JwtPayloadDto, @Body() proba: UpdateProbasDto) {
    return await this.probasService.updateProba(params.email, foremanEmail, proba)
  }

  @Patch("/entire/:email")
  @Roles(Role.FOREMAN)
  @UsePipes(new ValidationPipe())
  async updateEntireProba(@Param() params: EmailDto, @User() { email: foremanEmail }: JwtPayloadDto, @Body() proba: UpdateEntireProbasDto) {
    return await this.probasService.updateEntireProba(params.email, foremanEmail, proba)
  }
}
