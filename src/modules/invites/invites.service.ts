import { Injectable, InternalServerErrorException, Logger, NotFoundException, ServiceUnavailableException } from "@nestjs/common"
import { UsersService } from "../users/users.service"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SendGrid = require("@sendgrid/mail")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require("crypto")
import { InjectRepository } from "@nestjs/typeorm"
import { MongoRepository } from "typeorm"
import { Invite } from "./invites.entity"
import * as process from "node:process"

@Injectable()
export class InvitesService {
  private readonly senderEmail: string
  constructor(
    @InjectRepository(Invite)
    private readonly invitesRepository: MongoRepository<Invite>,
    private readonly usersService: UsersService
  ) {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY ?? "")
    this.senderEmail = process.env.SENDGRID_VERIFIED_SENDER_EMAIL ?? ""
    if (!this.senderEmail) {
      throw new ServiceUnavailableException("SENDGRID_VERIFIED_SENDER_EMAIL is missing")
    }
  }

  private readonly logger = new Logger(InvitesService.name)

  public async sendInvite(scoutEmail: string, foremanEmail: string) {
    this.logger.log(`Sending invite ${scoutEmail} to ${foremanEmail}`)

    const foreman = await this.usersService.getUserByEmail(foremanEmail)
    if (!foreman) {
      this.logger.log(`Foreman with ${scoutEmail} not found`)
      throw new NotFoundException(`Foreman with ${scoutEmail} not found`)
    }

    const scout = await this.usersService.getUserByEmail(scoutEmail)

    if (!scout) {
      this.logger.log(`Scout with ${scoutEmail} not found`)
      throw new NotFoundException(`Scout with ${scoutEmail} not found`)
    }

    const hashedValues = this.createSHA256Hash(JSON.stringify({ scoutEmail: scoutEmail, foremanEmail: foremanEmail, date: new Date() }))
    this.logger.log(`Hash: ${hashedValues}`)

    const invite = await this.invitesRepository.save(new Invite({ scoutEmail: scoutEmail, foremanEmail: foremanEmail, hash: hashedValues }))

    if (!invite) {
      this.logger.log(`Failed to save invite to mongodb`)
      throw new InternalServerErrorException(`Failed to save invite to mongodb`)
    }

    try {
      const message = {
        to: scoutEmail,
        from: this.senderEmail,
        subject: `Вас запрошено у групу виховника`,
        html: `<div> 
                <p>Привіт ${scout?.name}, у додатку Skob Proba
                  вас було запрошено у групу виховника ${foreman?.name}.
                  Щоб прийняти запрошення натисніть кнопку внизу.
                  Якщо ви не знаєте цього виховника,
                  або вважаєте що лист прийшов вам помилково,
                  просто проігноруйте його.
                </p>
                <a href="${process.env.BACKEND_BACKEND_URL}/invites/${hashedValues}"><button>Прийняти запрошення</button></a>
               </div>`,
      }

      await SendGrid.send(message)
      this.logger.log("invite send successfully")
    } catch (error: any) {
      this.logger.error("Invite not send: ", error)
      throw new InternalServerErrorException("Something went wrong, failed to send invite, try latter: ", error)
    }
  }

  public async acceptInvite(hash: string) {
    this.logger.log(`accept invite ${hash}`)

    const invite = await this.invitesRepository.findOne({ where: { hash: hash } })

    if (!invite) {
      throw new NotFoundException(`invite with hash ${hash} not found`)
    }

    await this.usersService.addScoutToGroup(invite.scoutEmail, invite.foremanEmail)
  }

  private createSHA256Hash(inputString: string): string {
    const hash = crypto.createHash("sha256")
    hash.update(inputString)
    return hash.digest("hex")
  }
}
